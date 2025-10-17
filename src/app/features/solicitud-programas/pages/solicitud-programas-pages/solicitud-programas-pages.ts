import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { CombinePopupComponent } from '../../components/combine-popup/combine-popup.component';
import { SchedulesTableComponent } from '../../../../shared/components/schedules-table/schedules-table.component';
import { newSchedule, ScheduleRow } from '../../../programas/models/schedule.models';
import { SolicitudProgramasService, SolicitudDto } from '../../services/solicitud-programas.service';
import { PlanningService, ClassDTO } from '../../../planificacion/services/planning.service';
import { HeaderComponent } from "../../../../layouts/header/header.component";

type RowState = 'new' | 'existing' | 'deleted';

interface SolicitudRow {
  id: string | number;
  program: string;
  materia: string;
  cupos: number;
  startDate: string;
  endDate: string;
  comments?: string;
  comentarios?: string;
  selected?: boolean;
  _state?: RowState;
  schedules?: ScheduleRow[];
}

interface CombinedRequest {
  id: string | number;
  programs: string[];
  materias: string[];
  cupos: number;
  startDate?: string;
  endDate?: string;
  sourceIds: Array<string | number>;
  editable?: boolean;
  schedules?: any[];
}

@Component({
  selector: 'app-solicitud-programas-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, AccesosRapidosSeccion, SidebarToggleButtonComponent, CombinePopupComponent, SchedulesTableComponent, HeaderComponent],
  templateUrl: './solicitud-programas-pages.html',
  styleUrls: ['./solicitud-programas-pages.scss']
})
export class SolicitudProgramasPages implements OnInit {
  rows: SolicitudRow[] = [];
  combined: CombinedRequest[] = [];

  // Popup control
  combinePopupVisible = false;
  selectedForCombine: SolicitudRow[] = [];

  searchQuery = '';

  get filteredRows(): SolicitudRow[] {
    const q = this.searchQuery?.trim().toLowerCase();
    if (!q) return this.rows.filter(r => r._state !== 'deleted');
    return this.rows.filter(r => r._state !== 'deleted' && (
      (r.program || '').toString().toLowerCase().includes(q) ||
      (r.materia || '').toString().toLowerCase().includes(q) ||
      (r.comments || r.comentarios || '').toString().toLowerCase().includes(q)
    ));
  }

  get allSelected(): boolean {
    const visible = this.filteredRows;
    if (!visible.length) return false;
    return visible.every(r => r.selected === true);
  }

  constructor(
    private readonly service: SolicitudProgramasService,
    private readonly router: Router,
    private readonly planningService: PlanningService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  private loadRequests(): void {
    this.service.getRequestsForSection().subscribe((list: SolicitudDto[]) => {
      console.log('=== CARGANDO SOLICITUDES DESDE BACKEND ===');
      console.log('Solicitudes recibidas:', list);
      
      this.rows = list.map((r: SolicitudDto, index: number) => {
        console.log(`--- SOLICITUD ${index} ---`);
        console.log('Solicitud original:', r);
        console.log('Horarios en solicitud:', r.schedules);
        console.log('Número de horarios:', r.schedules?.length || 0);
        
        const mappedRow = {
          ...r,
          selected: false,
          _state: 'existing' as RowState,
          // copy comments if the backend uses either naming
          comments: (r as any).comments || (r as any).comentarios,
          comentarios: (r as any).comentarios || (r as any).comments,
          // CORREGIDO: Solo usar horarios reales, no agregar horarios vacíos
          schedules: r.schedules && r.schedules.length > 0 ? r.schedules : []
        };
        
        console.log('Row mapeada:', mappedRow);
        console.log('Horarios finales:', mappedRow.schedules);
        console.log('------------------------');
        
        return mappedRow;
      });
      
      console.log('=== TODAS LAS ROWS FINALES ===');
      console.log('Total rows:', this.rows.length);
      this.rows.forEach((row, index) => {
        console.log(`Row ${index}:`, {
          id: row.id,
          materia: row.materia,
          program: row.program,
          schedulesCount: row.schedules?.length || 0,
          schedules: row.schedules
        });
      });
    });
  }

  toggleSelectAll(): void {
    const visible = this.filteredRows;
    const someSelected = visible.every(r => r.selected);
    visible.forEach(r => r.selected = !someSelected);
  }

  canCombine(): boolean {
    return this.rows.filter(r => r.selected && r._state !== 'deleted').length >= 2;
  }

  combineRequests(): void {
    this.selectedForCombine = this.rows.filter(r => r.selected && r._state !== 'deleted');
    if (this.selectedForCombine.length < 2) return;
    this.combinePopupVisible = true;
  }

  onCombineConfirmed(payload: { programs: string[]; materias: string[]; cupos: number; sourceIds: Array<string | number>; schedules?: any[] }) {
    // Hide popup
    this.combinePopupVisible = false;

    console.log('=== COMBINACIÓN CONFIRMADA ===');
    console.log('Payload recibido:', payload);
    console.log('Horarios incluidos:', payload.schedules);

    const combined: CombinedRequest = {
      id: 'c-' + Date.now(),
      programs: payload.programs,
      materias: payload.materias,
      cupos: payload.cupos,
      sourceIds: payload.sourceIds,
      startDate: undefined,
      endDate: undefined,
      editable: false,
      schedules: payload.schedules || []
    };

    console.log('CombinedRequest creado:', combined);

    // Mark source rows as deleted/merged
    for (const sid of payload.sourceIds) {
      const r = this.rows.find(x => x.id === sid);
      if (r) r._state = 'deleted';
    }

    this.combined.push(combined);
    // clear selection
    this.rows.forEach(r => r.selected = false);
  }

  cancelCombine(): void {
    this.combinePopupVisible = false;
  }

  removeRow(index: number): void {
    const row = this.rows[index];
    if (!row) return;
    if (row._state === 'new') {
      this.rows.splice(index, 1);
    } else {
      this.rows[index]._state = 'deleted';
    }
  }

  undoCombination(index: number): void {
    const combo = this.combined[index];
    if (!combo) return;
    // restore source rows
    for (const sid of combo.sourceIds) {
      const r = this.rows.find(x => x.id === sid);
      if (r) r._state = 'existing';
    }
    this.combined.splice(index, 1);
  }

  editCombinedToggle(index: number): void {
    const c = this.combined[index];
    if (!c) return;
    c.editable = !c.editable;
  }

  applyChanges(): void {
    console.log('=== APLICANDO CAMBIOS ===');
    console.log('Rows originales:', this.rows);
    console.log('Combined originales:', this.combined);
    
    // 🔧 CORRECCIÓN: Solo procesar solicitudes SELECCIONADAS (no duplicar)
    const individual = this.rows.filter(r => r.selected && r._state !== 'deleted');
    
    // Validar que haya algo que procesar
    if (individual.length === 0 && this.combined.length === 0) {
      alert('Debe seleccionar al menos una solicitud o crear una combinación para aplicar.');
      return;
    }
    
    const payload = {
      individual,
      combined: this.combined
    };

    console.log('=== PAYLOAD PREPARADO ===');
    console.log('Individual filtradas (SOLO SELECCIONADAS):', individual);
    console.log('Combined:', this.combined);
    console.log('Payload final:', payload);

    // Primero aplicar las solicitudes en el backend
    this.service.applyRequests(payload).subscribe({
      next: () => {
        console.log('✅ Solicitudes aplicadas correctamente en backend, creando clases en planificación...');
        // 🔧 CORRECCIÓN: Solo crear clases para las que fueron procesadas exitosamente
        this.createClassesFromRequests(individual, this.combined);
      },
      error: (error) => {
        console.error('❌ Error al aplicar solicitudes:', error);
        alert('Error al aplicar solicitudes en el backend.');
      }
    });
  }

  private createClassesFromRequests(individual: SolicitudRow[], combined: CombinedRequest[]): void {
    console.log('=== CREANDO CLASES DESDE SOLICITUDES ===');
    console.log('Solicitudes individuales seleccionadas:', individual);
    console.log('Solicitudes combinadas:', combined);
    
    // 🔧 CORRECCIÓN: Solo crear clases si hay solicitudes que procesar
    if (individual.length === 0 && combined.length === 0) {
      console.log('⚠️ No hay solicitudes para crear clases en planificación');
      alert('No hay solicitudes seleccionadas para procesar.');
      return;
    }
    
    const classesToCreate: ClassDTO[] = [];

    // Convertir solicitudes individuales SELECCIONADAS a clases
    console.log('--- PROCESANDO SOLICITUDES INDIVIDUALES SELECCIONADAS ---');
    individual.forEach((row, index) => {
      console.log(`Procesando solicitud individual ${index + 1}/${individual.length}:`, row);
      const classData = this.mapSolicitudToClass(row);
      console.log(`Clase mapeada ${index + 1}:`, classData);
      classesToCreate.push(classData);
    });

    // Convertir solicitudes combinadas a clases
    console.log('--- PROCESANDO SOLICITUDES COMBINADAS ---');
    combined.forEach((combo, index) => {
      console.log(`Procesando solicitud combinada ${index + 1}/${combined.length}:`, combo);
      const classData = this.mapCombinedToClass(combo);
      console.log(`Clase combinada mapeada ${index + 1}:`, classData);
      classesToCreate.push(classData);
    });

    console.log(`=== RESUMEN FINAL ===`);
    console.log(`Total clases a crear: ${classesToCreate.length}`);
    classesToCreate.forEach((cls, index) => {
      console.log(`Clase ${index + 1}:`, {
        courseName: cls.courseName,
        sectionName: cls.sectionName,
        capacity: cls.capacity,
        schedules: cls.schedules?.length || 0,
        observation: cls.observation
      });
    });

    // ✅ MEJORA: Crear todas las clases en planificación con mejor manejo de errores
    if (classesToCreate.length > 0) {
      console.log(`📋 Creando ${classesToCreate.length} clases en planificación...`);
      
      const createRequests = classesToCreate.map((classData, index) => {
        console.log(`🚀 Enviando clase ${index + 1} al servicio de planificación:`, classData);
        return this.planningService.createClass(classData);
      });

      forkJoin(createRequests).subscribe({
        next: (createdClasses) => {
          console.log(`✅ Se crearon ${createdClasses.length} clases en planificación exitosamente`);
          console.log('Clases creadas:', createdClasses);
          
          // Mostrar mensaje de éxito al usuario
          alert(`Se crearon ${createdClasses.length} clases en planificación exitosamente. Redirigiendo a planificación...`);
          
          // Navegar a planificación donde se mostrarán las nuevas clases
          this.router.navigate(['/planificacion']);
        },
        error: (error) => {
          console.error('❌ Error creando clases en planificación:', error);
          
          // Mostrar error específico al usuario
          let errorMessage = 'Hubo un error creando las clases en planificación.';
          if (error.error?.message) {
            errorMessage += ` Detalle: ${error.error.message}`;
          }
          
          alert(errorMessage + ' Las solicitudes se aplicaron en el backend pero las clases no se crearon. Revise planificación manualmente.');
          
          // Aún así navegar a planificación para que el usuario pueda ver el estado
          this.router.navigate(['/planificacion']);
        }
      });
    } else {
      console.log('⚠️ No hay clases para crear en planificación');
      alert('No se generaron clases para planificación.');
      this.router.navigate(['/planificacion']);
    }
  }

  private mapSolicitudToClass(solicitud: SolicitudRow): ClassDTO {
    // Generar un courseId único basado en el programa y materia
    const courseId = this.generateCourseId(solicitud.program, solicitud.materia);
    
    console.log('=== MAPEANDO SOLICITUD A CLASE ===');
    console.log('Solicitud original:', solicitud);
    console.log('Horarios en solicitud:', solicitud.schedules);
    console.log('Número de horarios:', solicitud.schedules?.length || 0);
    
    // 🔧 CORRECCIÓN: Verificar que los horarios existan y sean válidos
    let schedules: any[] = [];
    if (solicitud.schedules && solicitud.schedules.length > 0) {
      console.log('📅 Procesando horarios existentes...');
      schedules = this.mapSchedulesToClassSchedules(solicitud.schedules);
    } else {
      console.log('⚠️ No hay horarios en la solicitud - creando clase sin horarios');
    }
    
    console.log('Horarios convertidos para clase:', schedules);
    
    const classData: ClassDTO = {
      courseName: solicitud.materia,
      courseId: parseInt(courseId) || 1, // Convertir a number para el backend
      startDate: solicitud.startDate,
      endDate: solicitud.endDate,
      capacity: solicitud.cupos,
      observation: solicitud.comments || solicitud.comentarios || `Solicitud de: ${solicitud.program}`,
      statusId: 1, // Estado inicial (pendiente)
      semesterId: 1, // ID del semestre actual
      sectionName: solicitud.program,
      schedules: schedules
    };
    
    console.log('✅ Clase mapeada final:', classData);
    return classData;
  }

  private mapCombinedToClass(combined: CombinedRequest): ClassDTO {
    // Para solicitudes combinadas, usar el primer programa y combinar materias
    const program = combined.programs[0] || 'Programa Combinado';
    const materia = combined.materias.join(' + ');
    const courseId = this.generateCourseId(program, materia);
    
    console.log('=== MAPEANDO SOLICITUD COMBINADA A CLASE ===');
    console.log('Solicitud combinada:', combined);
    console.log('Horarios en combinada:', combined.schedules);
    console.log('Número de horarios:', combined.schedules?.length || 0);
    
    // 🔧 CORRECCIÓN: Verificar que los horarios existan y sean válidos
    let schedules: any[] = [];
    if (combined.schedules && combined.schedules.length > 0) {
      console.log('📅 Procesando horarios de solicitud combinada...');
      schedules = this.mapSchedulesToClassSchedules(combined.schedules);
    } else {
      console.log('⚠️ No hay horarios en la solicitud combinada - creando clase sin horarios');
    }
    
    console.log('Horarios convertidos para clase combinada:', schedules);
    
    // Crear observación detallada para combinadas
    const observationParts = [
      `Clase combinada de: ${combined.programs.join(', ')}`,
      `Materias: ${combined.materias.join(', ')}`,
      `Cupos totales: ${combined.cupos}`
    ];
    
    const classData: ClassDTO = {
      courseName: materia,
      courseId: parseInt(courseId) || 1,
      startDate: combined.startDate || new Date().toISOString().split('T')[0],
      endDate: combined.endDate || new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +4 meses
      capacity: combined.cupos,
      observation: observationParts.join(' | '),
      statusId: 1,
      semesterId: 1,
      sectionName: program,
      schedules: schedules
    };
    
    console.log('✅ Clase combinada mapeada final:', classData);
    return classData;
  }

  private generateCourseId(program: string, materia: string): string {
    // Generar un ID único basado en programa y materia
    const programCode = program.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const materiaCode = materia.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4); // Últimos 4 dígitos del timestamp
    return `${programCode}${materiaCode}${timestamp}`;
  }

  private mapSchedulesToClassSchedules(schedules: any[]): any[] {
    console.log('=== CONVIRTIENDO HORARIOS DE SOLICITUD A FORMATO CLASE ===');
    console.log('Horarios recibidos:', schedules);
    
    if (!schedules || schedules.length === 0) {
      console.log('⚠️ No hay horarios para mapear');
      return [];
    }
    
    // 🔧 CORRECCIÓN: Filtrado más estricto de horarios vacíos
    const validSchedules = schedules.filter(schedule => {
      // Verificar que el horario tenga los campos mínimos requeridos
      const hasDay = schedule.day && schedule.day.trim() !== '';
      const hasStartTime = schedule.startTime && schedule.startTime.trim() !== '';
      const hasEndTime = schedule.endTime && schedule.endTime.trim() !== '';
      
      const isValid = hasDay && hasStartTime && hasEndTime;
      
      if (!isValid) {
        console.log('🚫 Horario inválido omitido:', {
          schedule,
          hasDay,
          hasStartTime,
          hasEndTime
        });
      } else {
        console.log('✅ Horario válido:', schedule);
      }
      
      return isValid;
    });
    
    console.log(`📊 Horarios válidos: ${validSchedules.length} de ${schedules.length} originales`);
    
    if (validSchedules.length === 0) {
      console.log('⚠️ No hay horarios válidos después del filtrado');
      return [];
    }
    
    // Mapear días de español a inglés (formato del backend)
    const dayMap: { [key: string]: string } = {
      'LUN': 'MONDAY',
      'MAR': 'TUESDAY', 
      'MIE': 'WEDNESDAY',
      'JUE': 'THURSDAY',
      'VIE': 'FRIDAY',
      'SAB': 'SATURDAY',
      'DOM': 'SUNDAY'
    };

    // Mapear modalidad a ID (formato del backend)
    const modalityMap: { [key: string]: number } = {
      'PRESENCIAL': 1,
      'VIRTUAL': 2,
      'HÍBRIDO': 3,
      'HIBRIDO': 3  // Variante sin acento
    };

    // Mapear tipo de aula a ID (formato del backend)
    const roomTypeMap: { [key: string]: number } = {
      'Aulas': 1,
      'Laboratorio': 2,
      'Auditorio': 3,
      'Aulas Moviles': 4,
      'Aulas Accesibles': 5
    };
    
    const mappedSchedules = validSchedules.map((schedule, index) => {
      // 🔧 DEBUG: Información detallada del mapeo de días
      const originalDay = schedule.day;
      const upperDay = schedule.day?.toUpperCase();
      const mappedDay = dayMap[upperDay];
      
      console.log(`🔍 DEBUG Día ${index + 1}:`, {
        original: originalDay,
        uppercase: upperDay, 
        encontradoEnMapa: mappedDay,
        mapaCompleto: dayMap
      });

      const mappedSchedule = {
        day: mappedDay || schedule.day || 'MONDAY',
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        modalityId: modalityMap[(schedule.modality || '').toString().toUpperCase()] || 1, // Default: PRESENCIAL
        classroomId: null, // Se asignará después en planificación
        disability: schedule.disability || false,
        // Mapear tipo de aula si está disponible
        classRoomTypeId: roomTypeMap[schedule.roomType] || 1 // Default: Aulas
      };

      console.log(`📝 Horario ${index + 1} mapeado:`, {
        original: schedule,
        mapped: mappedSchedule
      });

      return mappedSchedule;
    });

    console.log('✅ Todos los horarios mapeados:', mappedSchedules);
    return mappedSchedules;
  }

  private mapModalityToId(modality?: string): number {
    // Mapear modalidades a IDs del backend
    switch (modality?.toLowerCase()) {
      case 'online':
      case 'virtual':
        return 2;
      case 'hybrid':
      case 'híbrido':
        return 3;
      default:
        return 1; // Presencial por defecto
    }
  }

  isFormValid(): boolean {
    // ✅ CORRECCIÓN: Validar que al menos una solicitud esté SELECCIONADA
    const hasSelectedRows = this.rows.some(r => r.selected && r._state !== 'deleted');
    const hasCombined = this.combined.length > 0;
    return hasSelectedRows || hasCombined;
  }
}

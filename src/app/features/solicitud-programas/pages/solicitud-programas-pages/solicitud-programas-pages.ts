import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { CombinePopupComponent } from '../../components/combine-popup/combine-popup.component';
import { SchedulesTableComponent } from '../../../../shared/components/schedules-table/schedules-table.component';
import { ScheduleRow } from '../../../programas/models/schedule.models';
import { SolicitudProgramasService, SolicitudDto } from '../../services/solicitud-programas.service';
import { PlanningService, ClassDTO } from '../../../planificacion/services/planning.service';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { CourseInformationService } from '../../../../shared/services/course-information.service';
import { SectionInformationService } from '../../../../shared/services/section-information.service';
import { ParametricService } from '../../../../shared/services/parametric.service';
import { ModalityDTO, ClassroomTypeDTO } from '../../../../shared/model/dto/parametric';
import { SectionResponseDTO } from '../../../../shared/model/dto/admin/SectionResponseDTO.model';
import { AcademicRequestResponseDTO, RequestScheduleResponseDTO } from '../../../programas/models/academic-request.models';

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
  // Optional resolved identifiers filled during mapping
  courseId?: number;
  sectionId?: number;
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

  // Course cache for mapping course IDs to course details
  private coursesMap = new Map<number, any>();
  
  // Section cache for mapping section IDs to section details
  private readonly sectionsMap = new Map<number, SectionResponseDTO>();
  
  // Parametric data caches
  private readonly modalitiesMap = new Map<number, ModalityDTO>();
  private readonly classroomTypesMap = new Map<number, ClassroomTypeDTO>();
  private readonly modalityNameToIdMap = new Map<string, number>();
  private readonly roomTypeNameToIdMap = new Map<string, number>();

  constructor(
    private readonly service: SolicitudProgramasService,
    private readonly router: Router,
    private readonly planningService: PlanningService,
    private readonly courseInformationService: CourseInformationService,
    private readonly sectionInformationService: SectionInformationService,
    private readonly parametricService: ParametricService
  ) {}

  ngOnInit(): void {
    // Load parametric data, sections, courses, then raw academic requests
    this.loadAllData();
  }

  private loadAllData(): void {
    forkJoin({
      courses: this.courseInformationService.findAllCourses(),
      sections: this.sectionInformationService.findAllSections(),
      modalities: this.parametricService.getAllModalities(),
      classroomTypes: this.parametricService.getAllClassroomTypes()
    }).subscribe({
      next: ({ courses, sections, modalities, classroomTypes }) => {
        courses.forEach(course => this.coursesMap.set(course.id!, course));
        sections.forEach(section => this.sectionsMap.set(section.id!, section));
        modalities.forEach(modality => {
          this.modalitiesMap.set(modality.id, modality);
          this.modalityNameToIdMap.set(modality.name.toUpperCase(), modality.id);
        });
        classroomTypes.forEach(type => {
          this.classroomTypesMap.set(type.id, type);
          this.roomTypeNameToIdMap.set(type.name, type.id);
        });
        this.loadRequests();
      },
      error: () => {
        // Even if data fails, try to load requests
        this.loadRequests();
      }
    });
  }

  private loadRequests(): void {
    this.service.getRawAcademicRequests().subscribe((list: AcademicRequestResponseDTO[]) => {
      // Determine which course IDs are missing from the local cache
      const missingCourseIds = Array.from(new Set(list
        .map(r => r.courseId)
        .filter(id => !!id && !this.coursesMap.has(id as number)) as number[]));

      if (missingCourseIds.length > 0) {
        // Fetch missing courses in parallel, then map rows
        const fetches = missingCourseIds.map(id => this.courseInformationService.findCourseById(id));
        forkJoin(fetches).subscribe({
          next: (courses) => {
            courses.forEach(c => {
              if (c && c.id != null) this.coursesMap.set(c.id, c);
            });
            this.mapRequestsToRows(list);
          },
          error: () => {
            // If a fetch fails, still try to map with whatever cache we have
            this.mapRequestsToRows(list);
          }
        });
      } else {
        this.mapRequestsToRows(list);
      }
    });
  }

  // Helper: map backend requests into UI rows (assumes coursesMap/sectionsMap populated)
  private mapRequestsToRows(list: AcademicRequestResponseDTO[]): void {
    this.rows = list.map((r: AcademicRequestResponseDTO) => {
      let courseId: number | undefined;
      let sectionId: number | undefined;
      let sectionName = '';

      // Follow the chain: academicRequest.courseId -> course.sectionId -> section.name
      if (r.courseId) {
        const cachedCourse = this.coursesMap.get(r.courseId as number);
        if (cachedCourse) {
          courseId = cachedCourse.id;
          sectionId = cachedCourse.sectionId;
          
          // Get section name from sections cache using the course's sectionId
          if (sectionId) {
            const section = this.sectionsMap.get(sectionId);
            if (section) {
              sectionName = section.name;
            }
          }
        }
      }

      // Fallback: if no courseId but we have courseName, try to find by name
      if (!courseId && r.courseName) {
        for (const [id, course] of this.coursesMap.entries()) {
          if (course.name === r.courseName) {
            courseId = id;
            sectionId = course.sectionId;
            
            // Get section name from sections cache
            if (sectionId) {
              const section = this.sectionsMap.get(sectionId);
              if (section) {
                sectionName = section.name;
              }
            }
            break;
          }
        }
      }

      // Final fallback: use programName from request if we couldn't resolve section
      if (!sectionName) {
        sectionName = r.programName || 'Sin sección';
      }

      const mappedRow: SolicitudRow = {
        id: r.id,
        program: sectionName || r.programName || `Usuario ${r.userId}`,
        materia: r.courseName || `Curso ${r.courseId}`,
        cupos: r.capacity,
        startDate: r.startDate,
        endDate: r.endDate,
        comments: r.observation || '',
        comentarios: r.observation || '',
        selected: false,
        _state: 'existing' as RowState,
        schedules: r.schedules && r.schedules.length > 0 ? r.schedules.map((s: RequestScheduleResponseDTO) => {
          const normalizeTime = (t?: string) => {
            if (!t) return '';
            const parts = t.split(':');
            return parts.length >= 2 ? parts[0].padStart(2,'0') + ':' + parts[1].padStart(2,'0') : t;
          };

          // Get classroom type name from classRoomTypeId
          let roomTypeName = 'Aulas'; // Default
          if (s.classRoomTypeId) {
            const classroomType = this.classroomTypesMap.get(s.classRoomTypeId);
            if (classroomType) {
              roomTypeName = classroomType.name;
            }
          }

          return {
            day: this.mapDayFromBackend(s.day) as any,
            startTime: normalizeTime(s.startTime),
            endTime: normalizeTime(s.endTime),
            roomType: roomTypeName as any,
            roomTypeId: s.classRoomTypeId,
            modality: this.mapModalityIdToName(s.modalityId) as any,
            disability: s.disability
          };
        }) : []
      };

      if (courseId) (mappedRow as any).courseId = courseId;
      if (sectionId) (mappedRow as any).sectionId = sectionId;

      // Debugging: log mapping decisions for problematic cases
      if (r.courseId && (!courseId || (mappedRow.materia?.includes('Curso') && r.courseName))) {
        console.log('🧭 Mapeo solicitud -> curso', { requestCourseId: r.courseId, requestCourseName: r.courseName, resolvedCourseId: courseId, resolvedMateria: mappedRow.materia });
      }

      return mappedRow;
    });
  }

  private mapDayFromBackend(day: string): string {
    // Map English day names from backend to Spanish abbreviations
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'LUN',
      'TUESDAY': 'MAR',
      'WEDNESDAY': 'MIE',
      'THURSDAY': 'JUE',
      'FRIDAY': 'VIE',
      'SATURDAY': 'SAB',
      'SUNDAY': 'DOM',
      // Also handle if already in Spanish
      'LUN': 'LUN',
      'MAR': 'MAR',
      'MIE': 'MIE',
      'JUE': 'JUE',
      'VIE': 'VIE',
      'SAB': 'SAB',
      'DOM': 'DOM'
    };
    return dayMap[day.toUpperCase()] || 'LUN';
  }

  private mapRoomTypeIdToName(id: number): string {
    const roomType = this.classroomTypesMap.get(id);
    const raw = (roomType?.name || '').toLowerCase();
    if (raw.includes('lab') || raw.includes('laboratorio')) return 'Laboratorio';
    if (raw.includes('mobile') || raw.includes('móvil') || raw.includes('movil')) return 'Aulas Moviles';
    if (raw.includes('access') || raw.includes('accesible')) return 'Aulas Accesibles';
    if (raw.includes('audit') || raw.includes('auditorio')) return 'Auditorio';
    return 'Aulas';
  }

  private mapModalityIdToName(id: number): string {
    const modality = this.modalitiesMap.get(id);
    const raw = (modality?.name || '').toLowerCase();
    if (raw.includes('in-person') || raw.includes('presencial')) return 'PRESENCIAL';
    if (raw.includes('online') || raw.includes('virtual')) return 'VIRTUAL';
    if (raw.includes('hybrid') || raw.includes('hibr')) return 'HIBRIDO';
    return 'PRESENCIAL';
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

    
    // Primero aplicar las solicitudes en el backend
    this.service.applyRequests(payload).subscribe({
      next: () => {
        // Create classes for processed requests
        this.createClassesFromRequests(individual, this.combined);
      },
      error: () => {
        alert('Error al aplicar solicitudes en el backend.');
      }
    });
  }

  private createClassesFromRequests(individual: SolicitudRow[], combined: CombinedRequest[]): void {
    
    // 🔧 CORRECCIÓN: Solo crear clases si hay solicitudes que procesar
    if (individual.length === 0 && combined.length === 0) {
      alert('No hay solicitudes seleccionadas para procesar.');
      return;
    }
    
    const classesToCreate: ClassDTO[] = [];

    // Convertir solicitudes individuales SELECCIONADAS a clases
    
    individual.forEach((row, index) => {
      const classData = this.mapSolicitudToClass(row);
      classesToCreate.push(classData);
    });

    // Convertir solicitudes combinadas a clases
    
    combined.forEach((combo, index) => {
      const classData = this.mapCombinedToClass(combo);
      classesToCreate.push(classData);
    });

    if (classesToCreate.length > 0) {
      const createRequests = classesToCreate.map(classData => this.planningService.createClass(classData));
      forkJoin(createRequests).subscribe({
        next: (createdClasses) => {
          alert(`Se crearon ${createdClasses.length} clases en planificación exitosamente. Redirigiendo a planificación...`);
          this.router.navigate(['/planificacion']);
        },
        error: (error) => {
          let errorMessage = 'Hubo un error creando las clases en planificación.';
          if (error.error?.message) {
            errorMessage += ` Detalle: ${error.error.message}`;
          }
          alert(errorMessage + ' Las solicitudes se aplicaron en el backend pero las clases no se crearon. Revise planificación manualmente.');
          this.router.navigate(['/planificacion']);
        }
      });
    } else {
      alert('No se generaron clases para planificación.');
      this.router.navigate(['/planificacion']);
    }
  }

  private mapSolicitudToClass(solicitud: SolicitudRow): ClassDTO {
    
    
    // Prefer using resolved courseId if available on the solicitud (set during mapping)
    let courseId = solicitud.courseId ?? 1; // Default fallback

    // If courseId is still the generic fallback, try to match by name as last resort
    if ((!courseId || courseId === 1) && solicitud.materia) {
      for (const [id, course] of this.coursesMap.entries()) {
        if (course.name === solicitud.materia) {
          courseId = id;
          break;
        }
      }
    }
    
    // 🔧 CORRECCIÓN: Verificar que los horarios existan y sean válidos
    let schedules: any[] = [];
    if (solicitud.schedules && solicitud.schedules.length > 0) {
      schedules = this.mapSchedulesToClassSchedules(solicitud.schedules);
    }
    
    const obs = ((solicitud.comments ?? solicitud.comentarios ?? '')).trim();
    const classData: ClassDTO = {
      courseName: solicitud.materia,
      courseId: courseId, // Use actual course ID from database
      startDate: solicitud.startDate,
      endDate: solicitud.endDate,
      capacity: solicitud.cupos,
      observation: obs || `Solicitud de: ${solicitud.program}`,
      statusId: 1, // Estado inicial (pendiente)
      semesterId: 1, // ID del semestre actual
      sectionName: solicitud.program,
      schedules: schedules
    };
    
    return classData;
  }

  private mapCombinedToClass(combined: CombinedRequest): ClassDTO {
    // Para solicitudes combinadas, usar el primer programa y combinar materias
    const program = combined.programs[0] || 'Programa Combinado';
    const materia = combined.materias.join(' + ');
    
    
    
    // Try to reuse courseId from source rows (if we have them in rows cache)
    let courseId = 1; // Default fallback
    if (combined.sourceIds && combined.sourceIds.length > 0) {
      const firstSourceId = combined.sourceIds[0];
      const sourceRow = this.rows.find(r => r.id === firstSourceId) as SolicitudRow | undefined;
      if (sourceRow && sourceRow.courseId) {
        courseId = sourceRow.courseId;
      }
    }

    // If still not resolved, fallback to name matching for the first materia
    if ((!courseId || courseId === 1) && combined.materias && combined.materias.length > 0) {
      const firstMateria = combined.materias[0];
      if (firstMateria) {
        for (const [id, course] of this.coursesMap.entries()) {
          if (course.name === firstMateria) {
            courseId = id;
            break;
          }
        }
      }
    }
    
    // �🔧 CORRECCIÓN: Verificar que los horarios existan y sean válidos
    let schedules: any[] = [];
    if (combined.schedules && combined.schedules.length > 0) {
      schedules = this.mapSchedulesToClassSchedules(combined.schedules);
    }
    
    // Crear observación detallada para combinadas
    const observationParts = [
      `Clase combinada de: ${combined.programs.join(', ')}`,
      `Materias: ${combined.materias.join(', ')}`,
      `Cupos totales: ${combined.cupos}`
    ];
    
    const classData: ClassDTO = {
      courseName: materia,
      courseId: courseId, // Use actual course ID from database
      startDate: combined.startDate || new Date().toISOString().split('T')[0],
      endDate: combined.endDate || new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +4 meses
      capacity: combined.cupos,
      observation: observationParts.join(' | '),
      statusId: 1,
      semesterId: 1,
      sectionName: program,
      schedules: schedules
    };
    
    return classData;
  }

  private mapSchedulesToClassSchedules(schedules: ScheduleRow[]): any[] {
    if (!schedules || schedules.length === 0) {
      return [];
    }

    // Filtrar horarios inválidos
    const validSchedules = schedules.filter(schedule => {
      const hasDay = schedule.day && schedule.day.trim() !== '';
      const hasStartTime = schedule.startTime && schedule.startTime.trim() !== '';
      const hasEndTime = schedule.endTime && schedule.endTime.trim() !== '';
      return hasDay && hasStartTime && hasEndTime;
    });

    if (validSchedules.length === 0) return [];

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

    const mappedSchedules = validSchedules.map(schedule => {
      const upperDay = schedule.day?.toUpperCase();
      const mappedDay = dayMap[upperDay] || schedule.day || 'MONDAY';

      // Map modality name to ID
      const modalityName = schedule.modality.toUpperCase();
      const modalityId = this.modalityNameToIdMap.get(modalityName) || this.modalityNameToIdMap.get('PRESENCIAL') || 1;

      // Map room type name to ID
      const roomTypeId = schedule.roomTypeId ?? this.roomTypeNameToIdMap.get(schedule.roomType) ?? this.roomTypeNameToIdMap.get('Aulas') ?? 1;

      return {
        day: mappedDay,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        modalityId: modalityId,
        classroomId: null,
        disability: schedule.disability,
        classRoomTypeId: roomTypeId
      };
    });

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

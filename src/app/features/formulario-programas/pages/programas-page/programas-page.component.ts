
import { CommonModule } from '@angular/common';
import { ConfirmSendPopupComponent } from '../../../../shared/components/confirm-send-popup/confirm-send-popup.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { ClassesTableComponent } from '../../components/classes-table/classes-table.component';
import { PopDuplicacionSolicitudComponent } from '../../components/pop-duplicacion-solicitud/pop-duplicacion-solicitud.component';
import { ProgramaRowDto, ProgramasService } from '../../services/programas.service';
import { ScheduleRow } from '../../models/schedule.models';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ProgramaContextDto } from '../../models/context.models';
import { Observable } from 'rxjs';
import { SemesterInformationService } from '../../../../shared/services/semester-information.service';
import { SemesterResponseDTO } from '../../../../shared/model/dto/admin/SemesterResponseDTO.model';
import { AcademicRequestBatchDTO, AcademicRequestRequestDTO, RequestScheduleRequestDTO, AcademicRequestResponseDTO } from '../../models/academic-request.models';


type RowState = 'new' | 'existing' | 'deleted';

interface ClaseRow extends ProgramaRowDto {
  _state: RowState;
  schedules: ScheduleRow[];
  _open?: boolean;
  comments?: string;
}

@Component({
  selector: 'app-programas-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ClassesTableComponent, ConfirmSendPopupComponent, PopDuplicacionSolicitudComponent],
  templateUrl: './programas-page.component.html',
  styleUrls: ['./programas-page.component.scss'],
})
export class ProgramasPageComponent implements OnInit {
  @ViewChild(ClassesTableComponent) classesTable?: ClassesTableComponent;
  
  context$!: Observable<ProgramaContextDto>;
  rows: ClaseRow[] = [];

  showConfirm = false;
  loadingPrevious = false;
  showDuplicateModal = false;
  // Current semester info (used to default dates on new/duplicated requests)
  currentSemester: SemesterResponseDTO | null = null;

  constructor(
    private readonly programas: ProgramasService,
    private readonly semesterService: SemesterInformationService
  ) {}

  ngOnInit(): void {
    console.log('🚀 ProgramasPageComponent: Iniciando componente...');
    console.log('🔄 ProgramasPageComponent: Obteniendo contexto...');
    this.context$ = this.programas.getContext();
    
    // Agregar suscripción para ver qué pasa con el contexto
    this.context$.subscribe({
      next: (context) => {
        console.log('✅ ProgramasPageComponent: Contexto recibido:', context);
      },
      error: (error) => {
        console.error('❌ ProgramasPageComponent: Error en contexto:', error);
      }
    });
    
    // Cargar semestre actual y luego iniciar con una fila vacía
    this.loadCurrentSemesterAndInitRows();
    console.log('✅ ProgramasPageComponent: Componente inicializado');
  }

  private loadCurrentSemesterAndInitRows(): void {
    this.semesterService.getCurrentSemester().subscribe({
      next: (sem) => {
        this.currentSemester = sem;
        this.ensureAtLeastOneRow();
      },
      error: (err) => {
        console.warn('No se pudo cargar semestre actual, usando fallback:', err);
        this.currentSemester = null;
        this.ensureAtLeastOneRow();
      }
    });
  }

  /**
   * Acción al confirmar el popup de envío
   */
  onConfirmSend() {
    this.showConfirm = false;

    // Validar que todos los campos requeridos estén llenos
    if (!this.validateAllFields()) {
      alert('Por favor, complete todos los campos requeridos antes de enviar.');
      return;
    }

    // Convertir a formato requerido por el backend
    const batchRequest = this.createAcademicRequestBatch();

    this.programas.submitAcademicRequests(batchRequest).subscribe({
      next: (response) => {
        alert('Formulario enviado correctamente.');
      },
      error: (error) => {
        console.error('Error al enviar solicitudes:', error);
        alert('Error al enviar el formulario. Por favor, intente nuevamente.');
      }
    });
  }

  /**
   * Valida que todos los campos requeridos estén completos
   */
  private validateAllFields(): boolean {
    const validRows = this.rows.filter(r => r._state !== 'deleted');

    if (validRows.length === 0) {
      return false;
    }

    // Verificar si hay errores de validación de fechas en el componente de tabla
    if (this.classesTable?.hasAnyDateErrors()) {
      return false;
    }

    for (const row of validRows) {
      // Validar campos principales
      if (!row.courseId?.trim() ||
          !row.courseName?.trim() ||
          !row.section?.trim() ||
          !row.startDate ||
          !row.endDate ||
          row.seats <= 0) {
        return false;
      }

      // Validar que tenga al menos un horario completo
      if (!row.schedules || row.schedules.length === 0) {
        return false;
      }

      // Validar cada horario
      for (const schedule of row.schedules) {
        if (!schedule.day ||
            !schedule.startTime ||
            !schedule.endTime ||
            !schedule.modality ||
            !schedule.roomType) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Crea el objeto AcademicRequestBatchDTO para enviar al backend
   */
  private createAcademicRequestBatch(): AcademicRequestBatchDTO {
    const validRows = this.rows.filter(r => r._state !== 'deleted');

    const requests: AcademicRequestRequestDTO[] = validRows.map(row => ({
      courseId: parseInt(row.courseId),
      capacity: row.seats,
      startDate: row.startDate,
      endDate: row.endDate,
      observation: (row.comments?.trim() || undefined),
      schedules: row.schedules.map(schedule => this.convertToRequestSchedule(schedule))
    }));

    return {
      requests
    };
  }

  /**
   * Convierte un ScheduleRow a RequestScheduleRequestDTO
   */
  private convertToRequestSchedule(schedule: ScheduleRow): RequestScheduleRequestDTO {
    console.log("Convirtiendo horario:", schedule);
    return {
      day: schedule.day,
      startTime: schedule.startTime + ':00', // Agregar segundos si es necesario
      endTime: schedule.endTime + ':00',
      classRoomTypeId: this.getRoomTypeId(schedule.roomType),
      modalityId: this.getModalityId(schedule.modality),
      disability: schedule.disability
    };
  }

  /**
   * Mapea el tipo de aula a su ID correspondiente
   */
  private getRoomTypeId(roomType: string): number {
    const mapping: Record<string, number> = {
      'Aulas': 1,
      'Laboratorio': 2,
      'Auditorio': 3,
      'Aulas Moviles': 4,
      'Aulas Accesibles': 5
    };
    return mapping[roomType] ?? 1; // Default a 'Aulas'
  }

  /**
   * Mapea la modalidad a su ID correspondiente
   */
  private getModalityId(modality: string): number {
    const mapping: Record<string, number> = {
      'PRESENCIAL': 1,
      'VIRTUAL': 2,
      'HIBRIDO': 3
    };
    return mapping[modality] || 1; // Default a 'PRESENCIAL'
  }

  get totalCount(): number {
    // Cuenta filas visibles (no eliminadas). Si quieres que NO cuente la vacía,
    // aquí podrías filtrar por las que tengan courseId o courseName llenos.
    return this.rows.filter(r => r._state !== 'deleted').length;
  }

  /**
   * Verifica si el formulario es válido para habilitar el botón de envío
   */
  isFormValid(): boolean {
    return this.validateAllFields();
  }

  /**
   * Abre el modal para duplicar solicitudes del semestre anterior
   */
  loadPrevious(): void {
    this.showDuplicateModal = true;
  }

  /**
   * Cierra el modal de duplicación
   */
  closeDuplicateModal(): void {
    this.showDuplicateModal = false;
  }

  /**
   * Maneja la aplicación de solicitudes duplicadas desde el modal
   */
  onApplyDuplicatedRequests(requests: AcademicRequestResponseDTO[]): void {
    console.log('� Aplicando solicitudes duplicadas...', requests);
    
    if (!requests || requests.length === 0) {
      console.log('⚠️ No se recibieron solicitudes para duplicar');
      alert('No hay solicitudes para duplicar.');
      this.closeDuplicateModal();
      return;
    }

    // Confirmar antes de reemplazar las filas actuales
    const hasData = this.rows.some(row => 
      row.courseId?.trim() || 
      row.courseName?.trim() || 
      row.startDate || 
      row.endDate ||
      (row.schedules && row.schedules.length > 0)
    );

    if (hasData) {
      const confirmed = confirm(
        'Esta acción reemplazará todas las solicitudes actuales con las del semestre seleccionado. ' +
        '¿Está seguro de que desea continuar?'
      );
      if (!confirmed) {
        return;
      }
    }

    // Mapear las solicitudes del semestre seleccionado
    const mapped: ClaseRow[] = requests.map(req => {
      const course = this.programas.getCourseById(String(req.courseId));
      const defaultStart = this.getSemesterStartDate();
      const defaultEnd = this.getSemesterEndDate();
      
      return {
        courseId: String(req.courseId ?? ''),
        courseName: req.courseName || course?.name || '',
        section: course?.sectionId ? String(course.sectionId) : '',
        roomType: '',
        seats: req.capacity,
        // Default to current semester dates but keep editable
        startDate: defaultStart,
        endDate: defaultEnd,
        weeks: this.calculateWeeks(defaultStart, defaultEnd),
        _state: 'new' as RowState, // Marcar como 'new' ya que son solicitudes duplicadas
        schedules: (req.schedules || []).map(s => ({
          day: this.normalizeDay(s.day),
          startTime: (s.startTime || '').slice(0,5),
          endTime: (s.endTime || '').slice(0,5),
          modality: this.reverseModalityId(s.modalityId) as any,
          roomType: this.reverseRoomTypeId(s.classRoomTypeId) as any,
          roomTypeId: s.classRoomTypeId, // Preservar el ID también
          disability: !!s.disability,
          room: ''
        })),
        _open: false,
        comments: req.observation || ''
      };
    });

    // Reemplazar todas las filas con las del semestre seleccionado
    this.rows = mapped;
    
    console.log(`✅ Se duplicaron ${mapped.length} solicitudes del semestre seleccionado`);
    alert(`Se duplicaron exitosamente ${mapped.length} solicitudes del semestre seleccionado.\n\n⚠️ IMPORTANTE: Las fechas han sido limpiadas. Por favor, ingrese las fechas correspondientes al semestre actual.`);
    
    this.closeDuplicateModal();
  }

  private reverseRoomTypeId(id: number): string {
    const mapIdToName: Record<number, string> = {
      1: 'Aulas',
      2: 'Laboratorio',
      3: 'Auditorio',
      4: 'Aulas Moviles',
      5: 'Aulas Accesibles'
    };
    return mapIdToName[id] ?? '';
  }

  private reverseModalityId(id: number): string {
    const mapIdToName: Record<number, string> = {
      1: 'PRESENCIAL',
      2: 'VIRTUAL',
      3: 'HIBRIDO'
    };
    return mapIdToName[id] ?? '';
  }

  private normalizeDay(day: string): 'LUN'|'MAR'|'MIE'|'JUE'|'VIE'|'SAB'|'DOM'|'' {
    const map: Record<string, 'LUN'|'MAR'|'MIE'|'JUE'|'VIE'|'SAB'|'DOM'> = {
      // Días en español
      'LUNES': 'LUN', 'LUN': 'LUN',
      'MARTES': 'MAR', 'MAR': 'MAR',
      'MIERCOLES': 'MIE', 'MIÉRCOLES': 'MIE', 'MIE': 'MIE',
      'JUEVES': 'JUE', 'JUE': 'JUE',
      'VIERNES': 'VIE', 'VIE': 'VIE',
      'SABADO': 'SAB', 'SÁBADO': 'SAB', 'SAB': 'SAB',
      'DOMINGO': 'DOM', 'DOM': 'DOM',
      // Días en inglés (desde el backend)
      'MONDAY': 'LUN',
      'TUESDAY': 'MAR', 
      'WEDNESDAY': 'MIE',
      'THURSDAY': 'JUE',
      'FRIDAY': 'VIE',
      'SATURDAY': 'SAB',
      'SUNDAY': 'DOM'
    };
    const key = (day || '').toUpperCase().trim();
    return map[key] ?? '';
  }

  private getSemesterStartDate(): string {
    if (this.currentSemester && this.currentSemester.startDate) {
      return this.currentSemester.startDate;
    }
    // Fallback: first day of current year semester heuristic
    const now = new Date();
    const year = now.getFullYear();
    // Assume first semester starts Jan 1, second starts Aug 1. Choose based on month
    const month = now.getMonth() + 1;
    if (month <= 6) {
      return `${year}-01-01`;
    }
    return `${year}-08-01`;
  }

  private getSemesterEndDate(): string {
    if (this.currentSemester && this.currentSemester.endDate) {
      return this.currentSemester.endDate;
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    if (month <= 6) {
      // first semester ends end of May
      return `${year}-05-31`;
    }
    // second semester ends end of November
    return `${year}-11-30`;
  }

  /**
   * Calcula la cantidad de semanas entre dos fechas.
   * @param startDate Fecha de inicio en formato YYYY-MM-DD
   * @param endDate Fecha de fin en formato YYYY-MM-DD
   * @returns Número de semanas (redondeado hacia arriba)
   */
  private calculateWeeks(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) {
      return 0;
    }
    
    // Calcula semanas aproximadas: ceil(diferencia en días / 7)
    const diffMs = d2.getTime() - d1.getTime();
    const days = diffMs / (1000 * 60 * 60 * 24);
    return Math.ceil(days / 7);
  }

  addRow(): void {
    this.rows.push(this.emptyRow());
  }

  removeRow(index: number): void {
    if (this.rows.length === 1) {
      // Si es la única fila, la reseteamos en vez de eliminarla
      this.rows[0] = this.emptyRow();
      return;
    }

    const row = this.rows[index];
    if (!row) return;

    if (row._state === 'new') {
      this.rows.splice(index, 1);
    } else {
      // Cuando se elimina una fila, limpiar los campos de curso
      this.rows[index] = {
        ...this.emptyRow(),
        _state: 'deleted'
      };
    }
  }

  onPatch(e: { index: number; data: Partial<ClaseRow> }) {
    Object.assign(this.rows[e.index], e.data);
  }

  private emptyRow(): ClaseRow {
  const defaultStart = this.getSemesterStartDate();
  const defaultEnd = this.getSemesterEndDate();
  return {
    courseId: '',
    courseName: '',
    section: '',
    seats: 0,
    // Default semester dates (editable by user afterwards)
    startDate: defaultStart,
    endDate: defaultEnd,
    weeks: this.calculateWeeks(defaultStart, defaultEnd),
    roomType: '',   // si aún existe en tu modelo original, si no elimínalo
    _state: 'new',
    schedules: [],
    _open: false,
    comments: '',
  };
}


  private ensureAtLeastOneRow(): void {
    if (this.rows.length === 0) {
      this.rows.push(this.emptyRow());
    }
  }
}

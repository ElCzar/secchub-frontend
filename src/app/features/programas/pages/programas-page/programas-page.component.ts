
import { CommonModule } from '@angular/common';
import { ConfirmSendPopupComponent } from '../../../../shared/components/confirm-send-popup/confirm-send-popup.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { ClassesTableComponent } from '../../components/classes-table/classes-table.component';
import { ProgramaRowDto, ProgramasService } from '../../services/programas.service';
import { ScheduleRow } from '../../models/schedule.models';
import { Component, OnInit } from '@angular/core';
import { ProgramaContextDto } from '../../models/context.models';
import { Observable } from 'rxjs';
import { AcademicRequestBatchDTO, AcademicRequestDTO, RequestScheduleDTO } from '../../models/academic-request.models';


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
  imports: [CommonModule, HeaderComponent, ClassesTableComponent, ConfirmSendPopupComponent],
  templateUrl: './programas-page.component.html',
  styleUrls: ['./programas-page.component.scss'],
})
export class ProgramasPageComponent implements OnInit {
  context$!: Observable<ProgramaContextDto>;
  rows: ClaseRow[] = [];

  showConfirm = false;

  constructor(private readonly programas: ProgramasService) {}

  ngOnInit(): void {
    this.context$ = this.programas.getContext();
    // Siempre iniciar con una fila vacía
    this.ensureAtLeastOneRow();
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

    const requests: AcademicRequestDTO[] = validRows.map(row => ({
      courseId: parseInt(row.courseId),
      capacity: row.seats,
      startDate: row.startDate,
      endDate: row.endDate,
      observation: (row.comments?.trim() || undefined),
      schedules: row.schedules.map(schedule => this.convertToRequestSchedule(schedule)),
      weeks: row.weeks,
      sectionId: row.section ? parseInt(row.section) : undefined
    }));

    return {
      userId: 1, // This should be obtained from authentication context
      semesterId: 1, // This should be obtained from current context
      requests
    };
  }

  /**
   * Convierte un ScheduleRow a RequestScheduleDTO
   */
  private convertToRequestSchedule(schedule: ScheduleRow): RequestScheduleDTO {
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

  loadPrevious(): void {
    this.programas.loadPreviousSemesterRequests().subscribe({
      next: (requests: AcademicRequestDTO[]) => {
        // Mapear TODAS las solicitudes del semestre anterior (una fila por cada solicitud)
        // Si había 3 cursos solicitados, se crearán 3 filas prellenadas para autofill
        const mapped: ClaseRow[] = (requests || []).map(req => {
          const course = this.programas.getCourseById(String(req.courseId));
          
          return {
            courseId: String(req.courseId ?? ''),
            courseName: course?.name || '',
            section: course?.sectionId ? String(course.sectionId) : '',
            roomType: '',
            seats: req.capacity,
            startDate: req.startDate,
            endDate: req.endDate,
            weeks: req.weeks ?? 0,
            _state: 'existing' as RowState,
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

        // Reemplazar todas las filas con las del semestre anterior (autofill completo)
        this.rows = mapped.length > 0 ? mapped : [this.emptyRow()];
        
        // Recalcular semanas directamente para cada fila cargada
        this.rows.forEach((row, index) => {
          if (row.startDate && row.endDate) {
            row.weeks = this.calculateWeeks(row.startDate, row.endDate);
          }
        });
      },
      error: () => {
        // En error, mantener al menos una fila
        this.ensureAtLeastOneRow();
      }
    });
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
      'LUNES': 'LUN', 'LUN': 'LUN',
      'MARTES': 'MAR', 'MAR': 'MAR',
      'MIERCOLES': 'MIE', 'MIÉRCOLES': 'MIE', 'MIE': 'MIE',
      'JUEVES': 'JUE', 'JUE': 'JUE',
      'VIERNES': 'VIE', 'VIE': 'VIE',
      'SABADO': 'SAB', 'SÁBADO': 'SAB', 'SAB': 'SAB',
      'DOMINGO': 'DOM', 'DOM': 'DOM'
    };
    const key = (day || '').toUpperCase().trim();
    return map[key] ?? '';
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
  return {
    courseId: '',
    courseName: '',
    section: '',
    seats: 0,
    startDate: '',
    endDate: '',
    weeks: 0,
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

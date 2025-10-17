
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
    this.programas.getPreviousSemesterClasses().subscribe({
      next: (list: ProgramaRowDto[]) => {
        const mapped = list.map(r => ({
          ...r,
          _state: 'existing' as RowState,
          schedules: [],
          _open: false
        }));
        this.rows = mapped.length > 0 ? mapped : [this.emptyRow()];
      },
      error: (e) => {
        console.error('Error al cargar semestre anterior', e);
        // Si falla, aseguramos al menos una fila vacía
        this.ensureAtLeastOneRow();
      }
    });
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


import { CommonModule } from '@angular/common';
import { ConfirmSendPopupComponent } from '../../../../shared/components/confirm-send-popup/confirm-send-popup.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { ClassesTableComponent } from '../../components/classes-table/classes-table.component';
import { ProgramaRowDto, ProgramasService } from '../../services/programas.service';
import { ScheduleRow } from '../../models/schedule.models';
import { Component, OnInit } from '@angular/core';
import { ProgramaContextDto } from '../../models/context.models';
import { Observable } from 'rxjs';


type RowState = 'new' | 'existing' | 'deleted';

interface ClaseRow extends ProgramaRowDto {
  _state: RowState;
  schedules: ScheduleRow[];
  _open?: boolean; 
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

  constructor(private programas: ProgramasService) {}

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
    // Aquí va la lógica real de envío
    alert('Formulario enviado correctamente.');
  }

  get totalCount(): number {
    // Cuenta filas visibles (no eliminadas). Si quieres que NO cuente la vacía,
    // aquí podrías filtrar por las que tengan courseId o courseName llenos.
    return this.rows.filter(r => r._state !== 'deleted').length;
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
      this.rows[index]._state = 'deleted';
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
  };
}


  private ensureAtLeastOneRow(): void {
    if (this.rows.length === 0) {
      this.rows.push(this.emptyRow());
    }
  }
}

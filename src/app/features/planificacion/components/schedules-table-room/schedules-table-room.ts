import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScheduleRow, Day, Modality } from '../../models/planificacion.models';


function newScheduleRow(): ScheduleRow {
  return {
    day: undefined,
    startTime: '',
    endTime: '',
    disability: false,
    modality: 'PRESENCIAL',
    roomType: 'Aulas',
    room: '',
  };
}

@Component({
  selector: 'app-schedules-table-room',
  imports: [CommonModule, FormsModule],
  templateUrl: './schedules-table-room.html',
  styleUrl: './schedules-table-room.scss'
})
export class SchedulesTableRoom {
  @Input() rows: ScheduleRow[] = [];
  @Output() rowsChange = new EventEmitter<ScheduleRow[]>();

  days = [
    { v: 'LUN', t: 'Lunes' }, { v: 'MAR', t: 'Martes' }, { v: 'MIE', t: 'Miércoles' },
    { v: 'JUE', t: 'Jueves' }, { v: 'VIE', t: 'Viernes' }, { v: 'SAB', t: 'Sábado' }, { v: 'DOM', t: 'Domingo' },
  ] as const;
  roomTypes = ['Laboratorio', 'Aulas', 'Aulas Moviles', 'Aulas Accesibles'] as const;
  modalities: Modality[] = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'];

  add(): void { this.rows = [...this.rows, newScheduleRow()]; this.rowsChange.emit(this.rows); }
  remove(i: number): void { this.rows = this.rows.filter((_, idx) => idx !== i); this.rowsChange.emit(this.rows); }
  patch(i: number, data: Partial<ScheduleRow>): void {
    const copy = [...this.rows];
    copy[i] = { ...copy[i], ...data };
    this.rows = copy;
    this.rowsChange.emit(copy);
  }

  focus(el: HTMLInputElement | null) { el?.focus(); el?.showPicker?.(); }
}




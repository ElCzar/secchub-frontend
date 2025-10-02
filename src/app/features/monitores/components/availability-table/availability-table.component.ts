import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Días válidos */
export type DayCode = 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM';

/** Fila de disponibilidad */
export interface AvailabilityRow {
  day: DayCode | '';
  start: string; // HH:mm
  end: string;   // HH:mm
  total: number; // horas calculadas
}

/** Constructor de fila vacía */
export function newAvailabilityRow(): AvailabilityRow {
  return { day: '', start: '', end: '', total: 0 };
}

@Component({
  selector: 'app-availability-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './availability-table.component.html',
  styleUrls: ['./availability-table.component.scss'],
})
export class AvailabilityTableComponent {
  @Input() rows: AvailabilityRow[] = [];
  @Output() rowsChange = new EventEmitter<AvailabilityRow[]>();

  /** Lista de días para el dropdown */
  readonly days: { v: DayCode; t: string }[] = [
    { v: 'LUN', t: 'Lunes' },
    { v: 'MAR', t: 'Martes' },
    { v: 'MIE', t: 'Miércoles' },
    { v: 'JUE', t: 'Jueves' },
    { v: 'VIE', t: 'Viernes' },
    { v: 'SAB', t: 'Sábado' },
    { v: 'DOM', t: 'Domingo' },
  ];

  /** Lista de horas para los dropdowns (solo horas completas) */
  readonly hours: { value: string; label: string }[] = [
    { value: '07:00', label: '7:00 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '21:00', label: '9:00 PM' },
    { value: '22:00', label: '10:00 PM' },
  ];

  /** Añade una nueva fila */
  add(): void {
    const next = [...this.rows, newAvailabilityRow()];
    this.rows = next;
    this.rowsChange.emit(next);
  }

  /** Elimina una fila (si es la última, deja una vacía) */
  remove(i: number): void {
    const next = this.rows.filter((_, idx) => idx !== i);
    this.rows = next.length ? next : [newAvailabilityRow()];
    this.rowsChange.emit(this.rows);
  }

  /** Actualiza parcialmente una fila */
  patch(i: number, data: Partial<AvailabilityRow>): void {
    const copy = [...this.rows];
    copy[i] = { ...copy[i], ...data };
    copy[i].total = this.computeHours(copy[i].start, copy[i].end);
    this.rows = copy;
    this.rowsChange.emit(copy);
  }

  /** Cálculo de horas totales entre start y end (solo horas completas) */
  private computeHours(start: string, end: string): number {
    if (!start || !end) return 0;
    const [sh] = start.split(':').map(Number);
    const [eh] = end.split(':').map(Number);
    if (isNaN(sh) || isNaN(eh) || eh <= sh) return 0;
    return eh - sh; // diferencia en horas completas
  }
}

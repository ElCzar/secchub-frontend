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

  /** Cálculo de horas totales entre start y end */
  private computeHours(start: string, end: string): number {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const s = sh * 60 + sm;
    const e = eh * 60 + em;
    if (isNaN(s) || isNaN(e) || e <= s) return 0;
    const diffMin = e - s;
    return Math.round((diffMin / 60) * 100) / 100; // con 2 decimales
  }
}

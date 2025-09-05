
// Importaciones necesarias para el funcionamiento del componente y sus dependencias
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Modality, newSchedule, RoomType, ScheduleRow } from '../../../features/programas/models/schedule.models';
import { FormsModule } from '@angular/forms';


/**
 * Componente que muestra y gestiona la tabla de sub-horarios para una clase.
 * Permite agregar, eliminar y modificar filas de horarios, así como seleccionar modalidad y tipo de aula.
 */
@Component({
  selector: 'app-schedules-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedules-table.component.html',
  styleUrls: ['./schedules-table.component.scss'],
})
export class SchedulesTableComponent {
  /**
   * Lista de filas de horarios a mostrar en la tabla.
   * Se recibe como input desde el componente padre.
   */
  @Input() rows: ScheduleRow[] = [];
  /**
   * Evento emitido cuando se modifica la lista de horarios.
   */
  @Output() rowsChange = new EventEmitter<ScheduleRow[]>();

  /**
   * Inicializa el componente asegurando que siempre haya al menos una fila vacía.
   */
  ngOnInit(): void {
    // Siempre mostrar al menos una fila vacía
    if (!this.rows || this.rows.length === 0) {
      this.rows = [newSchedule()];
      this.rowsChange.emit(this.rows);
    }
  }

  /**
   * Días de la semana disponibles para seleccionar en el horario.
   */
  days = [
    { v: 'LUN', t: 'Lunes' },
    { v: 'MAR', t: 'Martes' },
    { v: 'MIE', t: 'Miércoles' },
    { v: 'JUE', t: 'Jueves' },
    { v: 'VIE', t: 'Viernes' },
    { v: 'SAB', t: 'Sábado' },
    { v: 'DOM', t: 'Domingo' },
  ] as const;

  /**
   * Modalidades disponibles para el horario.
   */
  modalities: Modality[] = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'];

  /**
   * Tipos de aula disponibles para el horario.
   */
  roomTypes: RoomType[] = ['Laboratorio', 'Aulas', 'Aulas Moviles', 'Aulas Accesibles'];

  /**
   * Agrega una nueva fila de horario vacía a la tabla.
   */
  add(): void {
    this.rows = [...this.rows, newSchedule()];
    this.rowsChange.emit(this.rows);
  }

  /**
   * Elimina la fila de horario en la posición indicada.
   * Si solo queda una fila, la resetea a vacía en vez de eliminarla.
   * @param i Índice de la fila a eliminar
   */
  remove(i: number): void {
    if (this.rows.length === 1) {
      // Si es la única, resetea a vacía
      this.rows = [newSchedule()];
    } else {
      this.rows = this.rows.filter((_, idx) => idx !== i);
    }
    this.rowsChange.emit(this.rows);
  }

  /**
   * Modifica los datos de una fila de horario específica.
   * @param i Índice de la fila a modificar
   * @param data Datos parciales a actualizar en la fila
   */
  patch(i: number, data: Partial<ScheduleRow>): void {
    const copy = [...this.rows];
    copy[i] = { ...copy[i], ...data };
    this.rows = copy;
    this.rowsChange.emit(copy);
  }

  /**
   * Da foco a un input y, si es compatible, abre el selector de hora del navegador.
   * @param el Elemento input a enfocar
   */
  focus(el: HTMLInputElement | null) {
    el?.focus();
    el?.showPicker?.(); // En navegadores compatibles abre el time picker
  }
}


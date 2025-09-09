import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScheduleRow, Modality } from '../../models/planificacion.models';


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
export class SchedulesTableRoom implements OnInit, OnChanges {
  @Input() rows: ScheduleRow[] = [];
  @Input() editable: boolean = false; // Nuevo input para controlar si es editable
  @Output() rowsChange = new EventEmitter<ScheduleRow[]>();

  days = [
    { v: 'LUN', t: 'Lunes' }, { v: 'MAR', t: 'Martes' }, { v: 'MIE', t: 'Miércoles' },
    { v: 'JUE', t: 'Jueves' }, { v: 'VIE', t: 'Viernes' }, { v: 'SAB', t: 'Sábado' }, { v: 'DOM', t: 'Domingo' },
  ] as const;
  roomTypes = ['Laboratorio', 'Aulas', 'Aulas Moviles', 'Aulas Accesibles'] as const;
  modalities: Modality[] = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'];

  ngOnInit() {
    this.ensureEditableRow();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['editable'] || changes['rows']) {
      this.ensureEditableRow();
    }
  }

  private ensureEditableRow() {
    // Solo agregar fila editable si está en modo edición y no hay filas
    if (this.editable && this.rows.length === 0) {
      this.addNewEditableRow();
    }
  }

  private addNewEditableRow() {
    const newRow = newScheduleRow();
    this.rows = [...this.rows, newRow];
    this.rowsChange.emit(this.rows);
  }

  add(): void { 
    if (!this.editable) return;
    this.rows = [...this.rows, newScheduleRow()]; 
    this.rowsChange.emit(this.rows); 
  }
  
  remove(i: number): void { 
    if (!this.editable) return;
    this.rows = this.rows.filter((_, idx) => idx !== i); 
    this.rowsChange.emit(this.rows);
    
    // Si eliminamos la única fila, agregar automáticamente una nueva
    if (this.rows.length === 0) {
      this.addNewEditableRow();
    }
  }
  
  patch(i: number, data: Partial<ScheduleRow>): void {
    if (!this.editable) return;
    // Actualizar directamente el objeto sin reasignar el array para evitar pérdida de foco
    Object.assign(this.rows[i], data);
    this.rowsChange.emit([...this.rows]); // Emitir una copia para detectar cambios
  }

  focus(el: HTMLInputElement | null) { 
    if (!this.editable) return;
    el?.focus(); 
    el?.showPicker?.(); 
  }

  // Función trackBy para optimizar el *ngFor y evitar re-renderizados innecesarios
  trackByFn(index: number, item: ScheduleRow): any {
    return index; // Usar el índice como identificador único
  }
}




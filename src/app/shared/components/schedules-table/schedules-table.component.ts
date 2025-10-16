
// Importaciones necesarias para el funcionamiento del componente y sus dependencias
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Modality, newSchedule, RoomType, ScheduleRow } from '../../../features/programas/models/schedule.models';
import { FormsModule } from '@angular/forms';
import { ClassroomService, ClassroomTypeDTO, ModalityDTO } from '../../../features/planificacion/services/classroom.service';


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
export class SchedulesTableComponent implements OnInit {
  /**
   * Lista de filas de horarios a mostrar en la tabla.
   * Se recibe como input desde el componente padre.
   */
  @Input() 
  set rows(value: ScheduleRow[]) {
    // En modo de solo lectura, crear una copia para evitar mutaciones
    this._rows = value || [];
  }
  get rows(): ScheduleRow[] {
    return this._rows;
  }
  private _rows: ScheduleRow[] = [];

  /**
   * Evento emitido cuando se modifica la lista de horarios.
   */
  @Output() rowsChange = new EventEmitter<ScheduleRow[]>();

  /**
   * Indica si el componente está en modo de solo lectura.
   * Se detecta automáticamente si no hay listeners para rowsChange.
   */
  get isReadOnly(): boolean {
    return this.rowsChange.observers.length === 0;
  }

  /**
   * Inicializa el componente asegurando que siempre haya al menos una fila vacía.
   * Solo en modo editable (no solo lectura).
   */
  ngOnInit(): void {
    // Solo mostrar fila vacía si está en modo editable
    if (!this.isReadOnly && (!this._rows || this._rows.length === 0)) {
      this._rows = [newSchedule()];
      this.rowsChange.emit(this._rows);
    }

    // Cargar opciones dinámicas desde el backend
    this.loadModalitiesFromApi();
    this.loadRoomTypesFromApi();
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
   * Opciones de modalidades obtenidas desde el backend.
   * value: valor que se guarda en la fila (se mantiene contrato actual)
   * label: texto mostrado en el dropdown
   */
  modalityOptions: Array<{ value: Modality; label: string }> = [];

  /**
   * Opciones de tipos de aula obtenidas desde el backend.
   */
  roomTypeOptions: Array<{ value: RoomType; label: string }> = [];

  private loadModalitiesFromApi(): void {
    this.classroomService.getAllModalitiesStrict().subscribe({
      next: (items: ModalityDTO[]) => {
        // Mapear nombres del backend -> valores esperados, usando como label el nombre del backend
        const mapped = new Map<string, { value: Modality; label: string }>();
        items.forEach((m) => {
          const rawName = m.name || '';
          const name = rawName.toLowerCase();
          if (name.includes('in-person') || name.includes('presencial')) {
            mapped.set('PRESENCIAL', { value: 'PRESENCIAL', label: rawName });
          } else if (name.includes('online') || name.includes('virtual')) {
            mapped.set('VIRTUAL', { value: 'VIRTUAL', label: rawName });
          } else if (name.includes('hybrid') || name.includes('hibr')) {
            mapped.set('HIBRIDO', { value: 'HIBRIDO', label: rawName });
          }
        });
        // Asegurar orden deseado
        this.modalityOptions = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO']
          .map((k) => mapped.get(k as Modality))
          .filter(Boolean) as Array<{ value: Modality; label: string }>;

        // Si backend no devolvió nada reconocible, dejar vacío (sin fallback)
      },
      error: () => {
        // No fallback: mantener lista vacía
        this.modalityOptions = [];
      }
    });
  }

  private loadRoomTypesFromApi(): void {
    this.classroomService.getAllClassroomTypesStrict().subscribe({
      next: (items: ClassroomTypeDTO[]) => {
        // Mapear nombres del backend a los valores internos, usando como label el nombre del backend
        const mapped: Array<{ value: RoomType; label: string }> = [];
        const pushIfMissing = (value: RoomType, label: string) => {
          if (!mapped.find((m) => m.value === value)) mapped.push({ value, label });
        };

        items.forEach((t) => {
          const rawName = t.name || '';
          const name = rawName.toLowerCase();
          if (name.includes('lab')) {
            pushIfMissing('Laboratorio', rawName);
          } else if (name.includes('lecture') || name.includes('aula') || name.includes('regular')) {
            pushIfMissing('Aulas', rawName);
          } else if (name.includes('mobile') || name.includes('móvil') || name.includes('movil')) {
            pushIfMissing('Aulas Moviles', rawName);
          } else if (name.includes('access') || name.includes('accesible')) {
            pushIfMissing('Aulas Accesibles', rawName);
          }
        });

        // Orden deseado
        const order: RoomType[] = ['Laboratorio', 'Aulas', 'Aulas Moviles', 'Aulas Accesibles'];
        this.roomTypeOptions = order
          .map((v) => mapped.find((m) => m.value === v))
          .filter(Boolean) as Array<{ value: RoomType; label: string }>;

        // Si backend no devolvió nada reconocible, dejar vacío (sin fallback)
      },
      error: () => {
        // No fallback: mantener lista vacía
        this.roomTypeOptions = [];
      }
    });
  }

  constructor(private classroomService: ClassroomService) {}

  /**
   * Agrega una nueva fila de horario vacía a la tabla.
   */
  add(): void {
    if (this.isReadOnly) return;
    this._rows = [...this._rows, newSchedule()];
    this.rowsChange.emit(this._rows);
  }

  /**
   * Elimina la fila de horario en la posición indicada.
   * Si solo queda una fila, la resetea a vacía en vez de eliminarla.
   * @param i Índice de la fila a eliminar
   */
  remove(i: number): void {
    if (this.isReadOnly) return;
    if (this._rows.length === 1) {
      // Si es la única, resetea a vacía
      this._rows = [newSchedule()];
    } else {
      this._rows = this._rows.filter((_, idx) => idx !== i);
    }
    this.rowsChange.emit(this._rows);
  }

  /**
   * Modifica los datos de una fila de horario específica.
   * @param i Índice de la fila a modificar
   * @param data Datos parciales a actualizar en la fila
   */
  patch(i: number, data: Partial<ScheduleRow>): void {
    if (this.isReadOnly) return;
    const copy = [...this._rows];
    copy[i] = { ...copy[i], ...data };
    this._rows = copy;
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


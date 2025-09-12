
// Importaciones necesarias para el funcionamiento del componente y sus dependencias
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseOption, ProgramasService } from '../../services/programas.service';
import { ScheduleRow } from '../../models/schedule.models';
import { SchedulesTableComponent } from '../../../../shared/components/schedules-table/schedules-table.component';


/**
 * Interfaz que representa una fila de clase en la tabla de clases.
 * Incluye información básica del curso, sección, cupos, fechas y sub-horarios.
 * El campo _state indica el estado de la fila (nuevo, existente o eliminado).
 * El campo _open controla si la fila está expandida en la interfaz de usuario.
 */
export interface ClaseRowView {
  courseId: string;         // ID del curso seleccionado
  courseName: string;       // Nombre del curso
  section: string;          // Sección asignada
  seats: number;            // Número de cupos disponibles
  startDate: string;        // Fecha de inicio de la clase
  endDate: string;          // Fecha de finalización de la clase
  weeks: number;            // Duración en semanas (calculada)
  _state: 'new' | 'existing' | 'deleted'; // Estado de la fila

  schedules: ScheduleRow[]; // Lista de sub-horarios asociados a la clase
  _open?: boolean;          // Indica si la fila está expandida en la UI
}



/**
 * Componente que muestra y gestiona la tabla de clases dentro del módulo de programas.
 * Permite agregar, eliminar y modificar clases, así como gestionar los sub-horarios.
 */
@Component({
  selector: 'app-classes-table',
  standalone: true,
  imports: [CommonModule, FormsModule, SchedulesTableComponent],
  templateUrl: './classes-table.component.html',
  styleUrls: ['./classes-table.component.scss'],
})

export class ClassesTableComponent {

  /**
   * Lista de filas que representan las clases a mostrar en la tabla.
   * Se recibe como input desde el componente padre.
   */
  @Input() rows: ClaseRowView[] = [];

  /**
   * Eventos emitidos hacia el componente padre para agregar, eliminar o modificar filas.
   * - add: se emite cuando se solicita agregar una nueva clase.
   * - remove: se emite con el índice de la fila a eliminar.
   * - patch: se emite con el índice y los datos modificados de una fila.
   */
  @Output() add    = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();
  @Output() patch  = new EventEmitter<{ index: number; data: Partial<ClaseRowView> }>();

  /**
   * Arreglo de sugerencias de cursos para cada fila, utilizado en el autocompletado.
   * showList controla la visibilidad de la lista de sugerencias por fila.
   */
  suggestions: CourseOption[][] = [];
  showList: boolean[] = [];

  /**
   * Indica si los cursos están siendo cargados
   */
  coursesLoading = true;

  /**
   * Inyección del servicio ProgramasService para acceder a la API de cursos y secciones.
   */
  constructor(private readonly api: ProgramasService) {
    // Subscribe to courses loading status
    this.api.areCoursesLoaded().subscribe(loaded => {
      this.coursesLoading = !loaded;
    });
  }

  /**
   * Obtiene el número total de cursos cargados (útil para depuración)
   */
  getTotalCoursesCount(): number {
    return this.api.getCoursesCount();
  }

  /**
   * Realiza la búsqueda de cursos al escribir en el campo de nombre.
   * Busca únicamente por nombre del curso en los datos cargados previamente.
   * @param i Índice de la fila
   * @param term Término de búsqueda ingresado
   */
  onSearch(i: number, term: string) {
    const q = term?.trim();
    if (!q || q.length < 2) { // Iniciar búsqueda a partir de 2 caracteres
      this.suggestions[i] = [];
      this.showList[i] = false;
      return;
    }

    // Buscar por nombre en los cursos cargados localmente
    this.api.searchCourses(q).subscribe({
      next: (list) => {
        this.suggestions[i] = list;
        this.showList[i] = list.length > 0;
      },
      error: (error) => {
        console.error('Error searching courses:', error);
        this.suggestions[i] = [];
        this.showList[i] = false;
      }
    });
  }


  /**
   * Selecciona un curso de la lista de sugerencias y actualiza los datos de la fila correspondiente.
   * Usa los datos del curso que ya están disponibles en la opción seleccionada.
   * @param i Índice de la fila
   * @param opt Opción de curso seleccionada
   */
  selectCourse(i: number, opt: CourseOption) {
    this.showList[i] = false;
    this.suggestions[i] = [];

    // Actualiza todos los datos del curso en una sola emisión
    const section = opt.sectionId ? opt.sectionId.toString() : '01';
    this.patch.emit({
      index: i,
      data: {
        courseId: opt.id,
        courseName: opt.name,
        section: section
      }
    });
  }


  /**
   * Cierra la lista de sugerencias al perder el foco, con un pequeño retraso para permitir la selección con click.
   * @param i Índice de la fila
   */
  closeList(i: number) {
    setTimeout(() => (this.showList[i] = false), 120); // pequeño delay para permitir click
  }



  /**
   * Modifica la cantidad de cupos (seats) de una fila sumando o restando el valor delta.
   * No permite valores negativos.
   * @param i Índice de la fila
   * @param delta Valor a sumar/restar
   */
  changeSeats(i: number, delta: number) {
    const r = this.rows[i];
    if (!r) return;
    const next = Math.max(0, (r.seats ?? 0) + delta);
    this.patch.emit({ index: i, data: { seats: next } });
  }

  /**
   * Actualiza la cantidad de cupos (seats) a partir de la entrada directa del usuario.
   * Convierte el valor a número y asegura que no sea negativo.
   * @param i Índice de la fila
   * @param value Valor ingresado por el usuario
   */
  onSeatsInput(i: number, value: string) {
    const n = Math.max(0, Number(value) || 0);
    this.patch.emit({ index: i, data: { seats: n } });
  }

  /**
   * Maneja el cambio de la fecha de inicio y recalcula la cantidad de semanas.
   * @param i Índice de la fila
   * @param value Nueva fecha de inicio
   */
  onStartChange(i: number, value: string) {
    this.patch.emit({ index: i, data: { startDate: value } });
    this.recalcWeeks(i, value, this.rows[i].endDate);
  }

  /**
   * Maneja el cambio de la fecha de finalización y recalcula la cantidad de semanas.
   * @param i Índice de la fila
   * @param value Nueva fecha de finalización
   */
  onEndChange(i: number, value: string) {
    this.patch.emit({ index: i, data: { endDate: value } });
    this.recalcWeeks(i, this.rows[i].startDate, value);
  }

  /**
   * Calcula la cantidad de semanas entre dos fechas y actualiza el campo correspondiente en la fila.
   * Si las fechas no son válidas, asigna 0 semanas.
   * @param i Índice de la fila
   * @param start Fecha de inicio
   * @param end Fecha de finalización
   */
  private recalcWeeks(i: number, start?: string, end?: string) {
    if (!start || !end) {
      this.patch.emit({ index: i, data: { weeks: 0 } });
      return;
    }
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) {
      this.patch.emit({ index: i, data: { weeks: 0 } });
      return;
    }
    // Calcula semanas aproximadas: ceil(diferencia en días / 7)
    const diffMs = d2.getTime() - d1.getTime();
    const days = diffMs / (1000 * 60 * 60 * 24);
    const weeks = Math.ceil(days / 7);
    this.patch.emit({ index: i, data: { weeks } });
  }

  /**
   * Verifica si una fila tiene horarios válidos
   * @param row La fila a verificar
   * @returns true si tiene al menos un horario válido
   */
  hasValidSchedules(row: ClaseRowView): boolean {
    if (!row.schedules || row.schedules.length === 0) {
      return false;
    }

    return row.schedules.some(schedule =>
      schedule.day &&
      schedule.startTime &&
      schedule.endTime &&
      schedule.modality &&
      schedule.roomType
    );
  }

}

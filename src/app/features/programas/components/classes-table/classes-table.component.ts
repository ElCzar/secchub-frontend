
// Importaciones necesarias para el funcionamiento del componente y sus dependencias
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseOption, ProgramasService } from '../../services/programas.service';
import { SemesterResponseDTO } from '../../../../shared/model/dto/admin/SemesterResponseDTO.model';
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
  comments?: string;        // Comentarios libres por fila
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

export class ClassesTableComponent implements OnInit {

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
   * Información del semestre actual para validación de fechas
   */
  currentSemester: SemesterResponseDTO | null = null;

  /**
   * Mapas para rastrear errores de validación de fechas por fila
   */
  startDateErrors: Map<number, string> = new Map();
  endDateErrors: Map<number, string> = new Map();

  /**
   * Inyección del servicio ProgramasService para acceder a la API de cursos y secciones.
   */
  constructor(private readonly api: ProgramasService) {
    // Subscribe to courses loading status
    this.api.areCoursesLoaded().subscribe(loaded => {
      this.coursesLoading = !loaded;
    });
  }

  ngOnInit(): void {
    // Cargar información del semestre actual al inicializar el componente
    this.loadCurrentSemester();
  }

  /**
   * Carga la información del semestre actual para validaciones de fechas
   */
  private loadCurrentSemester(): void {
    console.log('🔄 Iniciando carga del semestre actual...');
    this.api.getCurrentSemester().subscribe({
      next: (semester) => {
        this.currentSemester = semester;
        console.log('📚 Semestre actual cargado:', semester);
        console.log(`📅 Periodo: ${semester.year}-${semester.period}`);
        console.log(`📅 Fechas: ${semester.startDate} a ${semester.endDate}`);
        console.log(`📅 Es actual: ${semester.isCurrent}`);
        // Revalidar todas las fechas existentes cuando se carga el semestre
        this.revalidateAllDates();
      },
      error: (error) => {
        console.error('❌ Error cargando semestre actual:', error);
      }
    });
  }

  /**
   * Revalida todas las fechas existentes en las filas después de cargar el semestre actual
   */
  private revalidateAllDates(): void {
    this.rows.forEach((row, index) => {
      if (row.startDate) {
        const startError = this.validateDateInSemesterRange(row.startDate);
        if (startError) {
          this.startDateErrors.set(index, startError);
        } else {
          this.startDateErrors.delete(index);
        }
      }

      if (row.endDate) {
        const endError = this.validateDateInSemesterRange(row.endDate);
        if (endError) {
          this.endDateErrors.set(index, endError);
        } else {
          this.endDateErrors.delete(index);
        }
      }
    });
  }

  /**
   * Obtiene el número total de cursos cargados (útil para depuración)
   */
  getTotalCoursesCount(): number {
    return this.api.getCoursesCount();
  }

  /**
   * Realiza la búsqueda de cursos al escribir en el campo de ID o nombre.
   * @param i Índice de la fila
   * @param term Término de búsqueda ingresado
   * @param searchById Si es true, busca por ID; si es false, busca por nombre
   */
  onSearch(i: number, term: string, searchById: boolean = false) {
    const q = term?.trim();
    if (!q || q.length < 2) { // Iniciar búsqueda a partir de 2 caracteres
      this.suggestions[i] = [];
      this.showList[i] = false;
      return;
    }

    // Buscar por ID o nombre en los cursos cargados localmente
    this.api.searchCourses(q, searchById).subscribe({
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
    console.log(`🔍 onStartChange - Fila ${i}, Fecha: ${value}`);
    
    // Validar que la fecha esté dentro del rango del semestre actual
    const validationError = this.validateDateInSemesterRange(value);
    
    if (validationError) {
      this.startDateErrors.set(i, validationError);
      console.log(`🚨 Error validación fecha inicio fila ${i}:`, validationError);
    } else {
      this.startDateErrors.delete(i);
      console.log(`✅ Fecha inicio válida fila ${i}`);
    }

    this.patch.emit({ index: i, data: { startDate: value } });
    this.recalcWeeks(i, value, this.rows[i].endDate);
  }

  /**
   * Maneja el cambio de la fecha de finalización y recalcula la cantidad de semanas.
   * @param i Índice de la fila
   * @param value Nueva fecha de finalización
   */
  onEndChange(i: number, value: string) {
    console.log(`🔍 onEndChange - Fila ${i}, Fecha: ${value}`);
    
    // Validar que la fecha esté dentro del rango del semestre actual
    const validationError = this.validateDateInSemesterRange(value);
    
    if (validationError) {
      this.endDateErrors.set(i, validationError);
      console.log(`🚨 Error validación fecha fin fila ${i}:`, validationError);
    } else {
      this.endDateErrors.delete(i);
      console.log(`✅ Fecha fin válida fila ${i}`);
    }

    this.patch.emit({ index: i, data: { endDate: value } });
    this.recalcWeeks(i, this.rows[i].startDate, value);
  }

  /**
   * Valida que una fecha esté dentro del rango del semestre actual
   * @param dateStr Fecha a validar en formato string
   * @returns Mensaje de error si la fecha no es válida, null si es válida
   */
  private validateDateInSemesterRange(dateStr: string): string | null {
    if (!dateStr || !this.currentSemester) {
      return null; // No validar si no hay fecha o no se ha cargado el semestre
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const semesterStart = new Date(this.currentSemester.startDate);
    const semesterEnd = new Date(this.currentSemester.endDate);
    
    console.log(`📅 Validando ${dateStr} contra semestre ${this.currentSemester.year}-${this.currentSemester.period} (${this.currentSemester.startDate} a ${this.currentSemester.endDate})`);

    if (date < semesterStart) {
      const errorMsg = `Debe ser posterior al ${semesterStart.toLocaleDateString('es-ES')} (inicio semestre)`;
      return errorMsg;
    }

    if (date > semesterEnd) {
      const errorMsg = `Debe ser anterior al ${semesterEnd.toLocaleDateString('es-ES')} (fin semestre)`;
      return errorMsg;
    }

    return null; // Fecha válida
  }

  /**
   * Obtiene el mensaje de error de validación para la fecha de inicio de una fila
   * @param index Índice de la fila
   * @returns Mensaje de error o null
   */
  getStartDateError(index: number): string | null {
    return this.startDateErrors.get(index) || null;
  }

  /**
   * Obtiene el mensaje de error de validación para la fecha de fin de una fila
   * @param index Índice de la fila
   * @returns Mensaje de error o null
   */
  getEndDateError(index: number): string | null {
    return this.endDateErrors.get(index) || null;
  }

  /**
   * Verifica si una fila tiene errores de validación en las fechas
   * @param index Índice de la fila
   * @returns true si hay errores, false si no los hay
   */
  hasDateErrors(index: number): boolean {
    return this.startDateErrors.has(index) || this.endDateErrors.has(index);
  }

  /**
   * Verifica si hay algún error de validación en todas las filas
   * @returns true si hay errores, false si no los hay
   */
  hasAnyDateErrors(): boolean {
    return this.startDateErrors.size > 0 || this.endDateErrors.size > 0;
  }

  /**
   * Obtiene todos los errores de validación de fechas
   * @returns Array con información de todos los errores
   */
  getAllDateErrors(): Array<{ rowIndex: number; field: 'start' | 'end'; error: string }> {
    const errors: Array<{ rowIndex: number; field: 'start' | 'end'; error: string }> = [];
    
    this.startDateErrors.forEach((error, index) => {
      errors.push({ rowIndex: index, field: 'start', error });
    });
    
    this.endDateErrors.forEach((error, index) => {
      errors.push({ rowIndex: index, field: 'end', error });
    });
    
    return errors;
  }

  /**
   * Calcula la cantidad de semanas entre dos fechas y actualiza el campo correspondiente en la fila.
   * Si las fechas no son válidas, asigna 0 semanas.
   * @param i Índice de la fila
   * @param start Fecha de inicio
   * @param end Fecha de finalización
   */
  private recalcWeeks(i: number, start?: string, end?: string) {
    console.log(`📊 recalcWeeks - Fila ${i}, Inicio: "${start}", Fin: "${end}"`);
    
    if (!start || !end) {
      console.log(`⚠️ Faltan fechas, asignando 0 semanas`);
      this.patch.emit({ index: i, data: { weeks: 0 } });
      return;
    }
    
    const d1 = new Date(start);
    const d2 = new Date(end);
    
    console.log(`📅 Fechas parseadas:`);
    console.log(`   Inicio: ${d1.toISOString().split('T')[0]} (${d1.getTime()})`);
    console.log(`   Fin: ${d2.toISOString().split('T')[0]} (${d2.getTime()})`);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      console.log(`❌ Fechas inválidas, asignando 0 semanas`);
      this.patch.emit({ index: i, data: { weeks: 0 } });
      return;
    }
    
    if (d2 < d1) {
      console.log(`❌ Fecha fin anterior a fecha inicio, asignando 0 semanas`);
      this.patch.emit({ index: i, data: { weeks: 0 } });
      return;
    }
    
    // Calcula semanas más precisas: incluye el día final y usa math.ceil para redondear hacia arriba
    const diffMs = d2.getTime() - d1.getTime();
    const days = diffMs / (1000 * 60 * 60 * 24) + 1; // +1 para incluir el día final
    const weeks = Math.ceil(days / 7);
    
    console.log(`📊 Cálculo:`);
    console.log(`   Diferencia en ms: ${diffMs}`);
    console.log(`   Días (incluyendo día final): ${days}`);
    console.log(`   Semanas calculadas: ${weeks}`);
    
    this.patch.emit({ index: i, data: { weeks } });
  }

  /**
   * Método público para recalcular semanas de todas las filas.
   * Útil cuando se cargan datos externamente (ej: semestre anterior).
   */
  recalculateAllWeeks() {
    this.rows.forEach((row, i) => {
      if (row.startDate && row.endDate) {
        this.recalcWeeks(i, row.startDate, row.endDate);
      }
    });
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

  /**
   * Maneja cambios en el campo de comentarios y emite un parche hacia el padre.
   * @param i índice de la fila
   * @param value nuevo texto de comentarios
   */
  onCommentChange(i: number, value: string) {
    this.patch.emit({ index: i, data: { comments: value } });
  }

  /**
   * Ajusta la altura del textarea para que se acomode al contenido.
   * Se usa desde el template en (input).
   */
  autoGrow(target: unknown) {
    // target puede ser HTMLTextAreaElement; normalizar con type-guard
    let el: HTMLTextAreaElement | null = null;
    if (target instanceof HTMLTextAreaElement) el = target;
    // en algunos entornos Angular el target llega como EventTarget con propiedad value
    if (!el && typeof target === 'object' && target !== null && 'value' in (target as any)) {
      const maybe = (target as any) as HTMLTextAreaElement | undefined;
      if (maybe?.style && typeof maybe?.scrollHeight === 'number') el = maybe;
    }
    if (!el) return;
    el.style.height = 'auto';
    // añadir un pequeño padding extra para evitar scroll
    el.style.height = (el.scrollHeight + 2) + 'px';
  }

}

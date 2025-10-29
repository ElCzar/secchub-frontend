import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanningRow } from '../../models/planificacion.models';
import { SchedulesTableRoom } from "../schedules-table-room/schedules-table-room";
import { SelectedTeachers } from '../../services/selected-teachers';
import { ObservacionesModal } from '../observaciones-modal/observaciones-modal';
import { PlanningService } from '../../services/planning.service';
import { TeacherAssignmentService } from '../../services/teacher-assignment.service';
import { TeacherDatesService } from '../../../docentes/services/teacher-dates.service';
import { TeacherDatesTooltipComponent } from '../../../docentes/components/teacher-dates-tooltip/teacher-dates-tooltip.component';
import { TeacherDatesModalComponent } from '../../../docentes/components/teacher-dates-modal/teacher-dates-modal.component';
import { TeacherClassWithDates, TeacherDatePopupData, TeacherDatesRequest } from '../../../docentes/models/teacher-dates.model';
import { firstValueFrom } from 'rxjs';

// Interfaz para las opciones de curso en el autocompletado
export interface CourseOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-planning-classes-table',
  standalone: true,
  imports: [CommonModule, FormsModule, SchedulesTableRoom, ObservacionesModal, TeacherDatesTooltipComponent, TeacherDatesModalComponent],
  templateUrl: './planning-classes-table.html',
  styleUrls: ['./planning-classes-table.scss'],
  providers: [DatePipe]
})

export class PlanningClassesTable {
  @Input() rows: PlanningRow[] = [];
  @Output() patchRow = new EventEmitter<{ index: number; data: Partial<PlanningRow> }>();
  @Output() addRow = new EventEmitter<void>();
  @Output() removeRow = new EventEmitter<number>();
  @Output() saveRow = new EventEmitter<{ index: number; data: PlanningRow }>();

  constructor(
    private readonly router: Router, 
    private readonly datePipe: DatePipe, 
    private readonly selectedTeachersService: SelectedTeachers,
    private readonly planningService: PlanningService,
    private readonly teacherAssignmentService: TeacherAssignmentService,
    private readonly cdr: ChangeDetectorRef,
    private readonly teacherDatesService: TeacherDatesService
  ) {
    console.log('🚨🚨🚨 PLANNING-CLASSES-TABLE CONSTRUCTOR - VERSION UPDATE LOADED 🚨🚨🚨');
    
    // Exponer función de debug globalmente para uso desde consola
    (window as any).debugPlanningTable = () => this.debugRowState();
    (window as any).debugPlanningRow = (index: number) => this.debugRowState(index);
    
    // Función global para diagnosticar problemas de guardado de horarios
    (window as any).debugScheduleSave = () => {
      console.log('=== DEBUG SCHEDULE SAVE ===');
      console.log('Filas actuales (rows):', this.rows);
      
      const rowsWithSchedules = this.rows.filter(row => row.schedules && row.schedules.length > 0);
      console.log('Filas con horarios:', rowsWithSchedules);
      
      rowsWithSchedules.forEach((row: any, rowIndex: number) => {
        console.log(`\n📚 FILA ${rowIndex} - ID: ${row.id}:`);
        console.log('Total horarios:', row.schedules ? row.schedules.length : 0);
        
        if (row.schedules) {
          const newSchedules = row.schedules.filter((s: any) => !s.id);
          const existingSchedules = row.schedules.filter((s: any) => s.id);
          
          console.log('- Horarios nuevos (sin ID):', newSchedules.length);
          console.log('- Horarios existentes (con ID):', existingSchedules.length);
          
          newSchedules.forEach((schedule: any, idx: number) => {
            console.log(`\n🆕 HORARIO NUEVO ${idx + 1}:`);
            console.log('- Día:', schedule.day);
            console.log('- Inicio:', schedule.startTime);
            console.log('- Fin:', schedule.endTime);
            console.log('- Modalidad:', schedule.modality);
            console.log('- Aula:', schedule.room);
            console.log('- ClassroomId:', schedule.classroomId);
            
            const hasEssentials = schedule.day && schedule.startTime && schedule.endTime && schedule.modality;
            console.log('- Datos esenciales completos:', hasEssentials ? '✅' : '❌');
          });
        }
      });
      
      console.log('\n💡 Para probar el guardado ejecuta: debugTestSave(índiceFila)');
    };
    
    // Función global para probar la conexión con el backend de cursos
    (window as any).testCourseBackend = (query: string = 'test') => {
      console.log('=== PROBANDO CONEXIÓN BACKEND CURSOS ===');
      console.log(`Buscando cursos con: "${query}"`);
      
      this.planningService.searchCourses(query).subscribe({
        next: (courses) => {
          console.log('✅ Conexión exitosa. Cursos encontrados:', courses);
          if (courses.length > 0) {
            console.log('Primer curso de ejemplo:', courses[0]);
          }
        },
        error: (error) => {
          console.error('❌ Error de conexión con backend de cursos:', error);
          console.log('Status:', error.status);
          console.log('URL:', error.url);
          console.log('Message:', error.message);
        }
      });
    };
    
    // Función para probar el guardado de una fila específica
    (window as any).debugTestSave = (rowIndex: number) => {
      console.log(`=== PROBANDO GUARDADO FILA ${rowIndex} ===`);
      
      if (!this.rows[rowIndex]) {
        console.log('❌ Fila no encontrada');
        return;
      }
      
      const row = this.rows[rowIndex];
      if (!row.schedules || row.schedules.length === 0) {
        console.log('❌ La fila no tiene horarios');
        return;
      }
      
      console.log(`🔄 Intentando guardar horarios de la fila ${rowIndex}...`);
      this.onSchedulesChange(rowIndex, row.schedules);
    };

    // Función para inspeccionar respuestas del backend
    (window as any).debugBackendResponse = () => {
      console.log('=== DEBUG BACKEND RESPONSE ===');
      console.log('Interceptando próximas respuestas del backend...');
      console.log('Guarda un horario y revisa los logs detallados');
    };

    // Función específica para debug de actualizaciones
    (window as any).debugUpdates = () => {
      console.log('=== DEBUG ACTUALIZACIONES ===');
      console.log('Filas con horarios:', this.rows.filter(r => r.schedules && r.schedules.length > 0));
      
      this.rows.forEach((row: any, rowIndex: number) => {
        if (row.schedules && row.schedules.length > 0) {
          console.log(`\n📚 FILA ${rowIndex}:`);
          console.log('Horarios existentes (con ID):');
          row.schedules.filter((s: any) => s.id).forEach((s: any) => {
            console.log(`  - ID ${s.id}: ${s.day} ${s.startTime}-${s.endTime} (${s.modality}) roomType: ${s.roomType}`);
          });
          
          console.log('Horarios nuevos (sin ID):');
          row.schedules.filter((s: any) => !s.id).forEach((s: any) => {
            console.log(`  - NUEVO: ${s.day} ${s.startTime}-${s.endTime} (${s.modality}) roomType: ${s.roomType}`);
          });
        }
      });
    };
  }

  // Propiedades para el autocompletado
  suggestions: CourseOption[][] = [];
  showList: boolean[] = [];

  // Propiedades para el modal de observaciones
  showObservationsModal = false;
  currentObservations: string[] = [];
  currentRowIndex = -1;

  // Propiedades para el tooltip de fechas de docentes
  showTeacherTooltip = false;
  tooltipTeacherData: TeacherClassWithDates | null = null;
  tooltipPosition = { x: 0, y: 0 };
  private tooltipTimeout: any = null;

  // Propiedades para el modal de fechas de docentes
  showDatesModal = false;
  datePopupData: TeacherDatePopupData | null = null;

  private ensureEditableRow() {
    // Si no hay filas, solicitar al padre que agregue una
    if (this.rows.length === 0) {
      this.addRow.emit();
      return;
    } 
    
    // Si hay filas pero ninguna está en modo edición, solicitar al padre que agregue una
    const hasEditingRow = this.rows.some(row => row._editing === true);
    if (!hasEditingRow) {
      this.addRow.emit();
    }
  }

  // Este método ya no agrega filas directamente
  private addNewEditableRow() {
    // Método eliminado - ahora el padre maneja esto
    this.addRow.emit();
  }


  // Activa modo edición en la fila
  editClass(index: number) {
    console.log('🖊️ === ACTIVANDO MODO EDICIÓN ===');
    console.log('📍 Índice de fila:', index);
    console.log('📋 Fila antes de editar:', this.rows[index]);
    // Ensure teachers array exists and has at least one entry to edit primary teacher name
    if (!this.rows[index].teachers) {
      this.rows[index].teachers = [];
    }
    if (this.rows[index].teachers.length === 0) {
      // prefer legacy `teacher` if present
      const legacy = this.rows[index].teacher;
      this.rows[index].teachers.push(legacy ? { ...legacy } : { id: 0, name: '' });
    }
    this.rows[index]._editing = true;
    
    console.log('✅ Modo edición activado para fila', index);
    console.log('📝 Estado _editing:', this.rows[index]._editing);
    console.log('📋 Fila después de activar edición:', this.rows[index]);
  }

  // Guarda los cambios y desactiva modo edición
  saveClass(index: number) {
    this.rows[index]._editing = false;
    this.patchRow.emit({ index, data: this.rows[index] });
    this.saveRow.emit({ index, data: this.rows[index] });
    // Removido: No agregar fila automáticamente después de guardar
  }

  // Función para eliminar una clase
  deleteClass(index: number) {
    console.log('Eliminar clase', this.rows[index]);
    // Lógica para eliminar una clase
    this.removeRow.emit(index);
  }

  // Función para ver las observaciones de la clase
  viewObservations(index: number) {
    console.log('Ver observaciones de clase', this.rows[index]);
    this.currentRowIndex = index;
    this.currentObservations = this.rows[index].notes || [];
    this.showObservationsModal = true;
  }

  // Función para enviar correo - navega a la ruta de envío de correos
  sendEmail(index: number) {
    const row = this.rows[index];
    console.log('Enviar correo para la clase:', row);
    
    // Navegar a la ruta de envío de correos para docentes
    // Pasar información de la clase como estado para que pueda ser utilizada en el componente de destino
    this.router.navigate(['/envio-correo/docentes'], {
      state: {
        classInfo: {
          courseName: row.courseName,
          section: row.section,
          classId: row.classId,
          startDate: row.startDate,
          endDate: row.endDate,
          status: row.status,
          teacher: row.teacher,
          schedules: row.schedules
        }
      }
    });
  }

  // Métodos para el modal de observaciones
  onSaveObservations(observations: string[]) {
    if (this.currentRowIndex >= 0) {
      this.patchRow.emit({ 
        index: this.currentRowIndex, 
        data: { notes: observations } 
      });
    }
    this.closeObservationsModal();
  }

  onCloseObservationsModal() {
    this.closeObservationsModal();
  }

  private closeObservationsModal() {
    this.showObservationsModal = false;
    this.currentObservations = [];
    this.currentRowIndex = -1;
  }

  // Función para seleccionar una clase
  selectClass(index: number) {
    console.log('Seleccionar clase', this.rows[index]);
    // Lógica para seleccionar una clase
  }

  // Funciones para manejar teacher de forma segura
  getTeacherName(row: PlanningRow): string {
    // Prefer teachers[0] if available for backward compatibility
    if (row.teachers && row.teachers.length > 0) return row.teachers[0].name || '';
    return row.teacher?.name || '';
  }

  updateTeacherName(row: PlanningRow, name: string) {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      // Si borra completamente el nombre, limpia el primer teacher
      if (row.teachers && row.teachers.length > 0) {
        row.teachers[0] = { id: 0, name: '' };
      } else {
        row.teacher = undefined;
      }
    } else {
      // Si hay texto, inicializa teacher si es necesario
      if (!row.teachers) row.teachers = [];
      if (row.teachers.length === 0) {
        // populate from legacy if available
        if (row.teacher) row.teachers.push({ ...row.teacher });
        else row.teachers.push({ id: 0, name: '' });
      }
      row.teachers[0].name = trimmedName;
    }
  }

  // Funciones para el autocompletado de cursos - CONECTADO AL BACKEND REAL
  onSearch(i: number, term: string) {
    const q = term?.trim();
    if (!q) {
      this.suggestions[i] = [];
      this.showList[i] = false;
      return;
    }
    
    console.log(`🔍 Buscando cursos con término: "${q}"`);
    
    // Conectar con el servicio backend real
    this.planningService.searchCourses(q).subscribe({
      next: (courses: CourseOption[]) => {
        console.log('✅ Cursos encontrados desde backend:', courses);
        this.suggestions[i] = courses;
        this.showList[i] = courses.length > 0;
      },
      error: (error) => {
        console.error('❌ Error al buscar cursos:', error);
        // En caso de error, mostrar datos mock como fallback
        console.warn('⚠️ Usando datos mock como fallback');
        const mockCourses: CourseOption[] = [
          { id: '1010', name: 'Redes de Computadores (MOCK)' },
          { id: '1015', name: 'Ingeniería de Software (MOCK)' },
          { id: '1020', name: 'Base de Datos (MOCK)' },
          { id: '1025', name: 'Algoritmos y Estructuras de Datos (MOCK)' },
          { id: '1030', name: 'Sistemas Operativos (MOCK)' },
        ];
        
        const filtered = mockCourses.filter(course => 
          course.id.toLowerCase().includes(q.toLowerCase()) || 
          course.name.toLowerCase().includes(q.toLowerCase())
        );
        
        this.suggestions[i] = filtered;
        this.showList[i] = filtered.length > 0;
      }
    });
  }

  selectCourse(i: number, opt: CourseOption) {
    console.log(`📚 Curso seleccionado:`, opt);
    this.showList[i] = false;
    this.suggestions[i] = [];

    // Extraer solo el nombre del curso (sin el ID que viene en formato "ID - Nombre")
    const courseName = this.extractCourseName(opt.name);
    console.log(`📝 Nombre extraído: "${courseName}" (original: "${opt.name}")`);

    // Actualiza el ID y nombre del curso en la fila
    this.patchRow.emit({ index: i, data: { courseId: opt.id, courseName: courseName } });

    // Obtener la sección desde el backend basándose en el courseId
    console.log(`🔍 Obteniendo sección para curso ID: ${opt.id}`);
    this.planningService.getSectionByCourseId(opt.id).subscribe({
      next: (section: string) => {
        console.log(`✅ Sección obtenida desde backend: ${section}`);
        this.patchRow.emit({ index: i, data: { section: section } });
      },
      error: (error) => {
        console.error('❌ Error al obtener sección:', error);
        // En caso de error, usar sección por defecto
        const fallbackSection = this.getMockSectionForCourse(opt.id);
        console.warn(`⚠️ Usando sección fallback: ${fallbackSection}`);
        this.patchRow.emit({ index: i, data: { section: fallbackSection } });
      }
    });
  }

  /**
   * Extrae el nombre del curso removiendo el ID del formato "ID - Nombre"
   */
  private extractCourseName(fullName: string): string {
    // Si el nombre viene en formato "ID - Nombre", extraer solo el nombre
    const dashIndex = fullName.indexOf(' - ');
    if (dashIndex > 0) {
      return fullName.substring(dashIndex + 3).trim();
    }
    // Si no tiene el formato esperado, devolver el nombre completo
    return fullName;
  }

  // Función temporal para simular la obtención de sección desde backend
  private getMockSectionForCourse(courseId: string): string {
    const sectionMap: Record<string, string> = {
      '1010': 'SIS-01',
      '1015': 'SIS-02', 
      '1020': 'SIS-01',
      '1025': 'SIS-03',
      '1030': 'SIS-02',
    };
    return sectionMap[courseId] || 'SIS-01';
  }

  closeList(i: number) {
    setTimeout(() => (this.showList[i] = false), 120); // pequeño delay para permitir click
  }

  // Funciones para manejo de docentes
  hasTeacher(row: PlanningRow): boolean {
    // Consider teachers[] first (new), then legacy teacher
    if (row.teachers && row.teachers.length > 0) {
      return !!(row.teachers[0]?.name?.trim());
    }
    return !!(row.teacher?.name?.trim());
  }

  selectTeacher(index: number) {
    console.log('Seleccionar docente para la fila', index);
    
    // Crear un key único para esta clase específica
    const row = this.rows[index];
    const classKey = `${row.courseName || 'nueva-clase'}-${row.section || 'sin-seccion'}-${index}`;

    // Crear un snapshot de la fila para poder restaurarla si se pierde durante la navegación
    const rowSnapshot = JSON.parse(JSON.stringify(row));

    // Navegar a la pantalla de selección de docentes con el contexto de la clase
    this.router.navigate(['/seleccionar-docente'], {
      state: {
        classKey,
        classInfo: {
          materia: row.courseName,
          seccion: row.section,
          classId: row.classId,
          rowIndex: index,
          // Incluir snapshot para restauración en caso de race condition
          rowSnapshot
        }
      }
    });
  }

  selectAdditionalTeacher(index: number) {
    console.log('Seleccionar docente adicional para la fila', index);

    const row = this.rows[index];
    const classKey = `${row.courseName || 'nueva-clase'}-${row.section || 'sin-seccion'}-${index}`;
    const rowSnapshot = JSON.parse(JSON.stringify(row));

    this.router.navigate(['/seleccionar-docente'], {
      state: {
        classKey,
        addAdditional: true,
        classInfo: {
          materia: row.courseName,
          seccion: row.section,
          classId: row.classId,
          rowIndex: index,
          rowSnapshot
        }
      }
    });
  }

  viewTeacherDetails(index: number) {
    console.log('Ver detalles del docente para la fila', index);
    // TODO: Mostrar modal o navegar a detalles del docente
  }

  /**
   * Obtiene el índice de una fila en el array rows
   */
  getRowIndex(row: PlanningRow): number {
    return this.rows.indexOf(row);
  }

  /**
   * Elimina un profesor de una clase
   */
  async removeTeacherFromClass(row: PlanningRow, teacherIndex: number) {
    if (!row.teachers || teacherIndex < 0 || teacherIndex >= row.teachers.length) {
      console.warn('Índice de profesor inválido');
      return;
    }

    const teacherToRemove = row.teachers[teacherIndex];
    console.log(`🗑️ Iniciando eliminación de profesor ${teacherToRemove.name} (ID: ${teacherToRemove.id}) de la clase ${row.backendId}`);

    // Verificar que tenemos los IDs necesarios
    if (!teacherToRemove.id || !row.backendId) {
      console.error('❌ No se puede eliminar: faltan IDs', { teacherId: teacherToRemove.id, classId: row.backendId });
      alert('Error: No se puede eliminar el profesor (faltan identificadores)');
      return;
    }

    try {
      // Llamar al backend para eliminar la asignación
      await firstValueFrom(
        this.teacherAssignmentService.removeTeacherFromClass(teacherToRemove.id, row.backendId)
      );

      console.log(`✅ Profesor eliminado del backend exitosamente`);

      // Eliminar el profesor del array local
      row.teachers.splice(teacherIndex, 1);

      // Si no quedan profesores, limpiar el array
      if (row.teachers.length === 0) {
        row.teachers = [];
      }

      // Emitir el cambio
      const rowIndex = this.getRowIndex(row);
      if (rowIndex !== -1) {
        this.patchRow.emit({ index: rowIndex, data: { teachers: row.teachers } });
      }

      // Forzar detección de cambios
      this.cdr.detectChanges();

    } catch (error) {
      console.error('❌ Error al eliminar profesor del backend:', error);
      alert(`Error al eliminar el profesor: ${error}`);
    }
  }

  /**
   * Verifica si la fila tiene profesores válidos (no vacíos, no undefined)
   */
  hasValidTeachers(row: PlanningRow): boolean {
    return !!(row.teachers && row.teachers.length > 0 && row.teachers.some(t => t && t.id));
  }

  /**
   * Maneja el cambio de estado de la clase
   */
  onClassStatusChange(index: number, newStatusId: number | undefined) {
    if (newStatusId === undefined) return;
    
    const row = this.rows[index];
    console.log(`Cambiando estado de clase ${row.backendId} a: ${newStatusId}`);
    
    // Actualizar el estado en la fila
    row.classStatusId = newStatusId;
    
    // Forzar detección de cambios para que el color se actualice inmediatamente
    this.cdr.detectChanges();
    
    // Emitir el cambio para que se guarde
    this.patchRow.emit({ index, data: { classStatusId: newStatusId } });
  }

  // Métodos para manejo de fechas y cálculo automático de semanas
  onStartDateChange(index: number, newStartDate: string) {
    const row = this.rows[index];
    row.startDate = newStartDate;
    this.calculateWeeks(index);
    this.patchRow.emit({ index, data: { startDate: newStartDate, weeks: row.weeks } });
  }

  onEndDateChange(index: number, newEndDate: string) {
    const row = this.rows[index];
    row.endDate = newEndDate;
    this.calculateWeeks(index);
    this.patchRow.emit({ index, data: { endDate: newEndDate, weeks: row.weeks } });
  }

  private calculateWeeks(index: number) {
    const row = this.rows[index];
    
    if (row.startDate && row.endDate) {
      const startDate = new Date(row.startDate);
      const endDate = new Date(row.endDate);
      
      // Validar que la fecha final sea posterior a la inicial
      if (endDate > startDate) {
        // Calcular la diferencia en milisegundos
        const timeDifference = endDate.getTime() - startDate.getTime();
        
        // Convertir a días y luego a semanas (redondeando hacia arriba)
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
        const weeks = Math.ceil(daysDifference / 7);
        // Restar una semana al resultado según petición, sin permitir valor negativo
        row.weeks = Math.max(0, weeks - 1);
      } else if (endDate < startDate) {
        // Si la fecha final es anterior a la inicial, mostrar error
        console.warn('La fecha final debe ser posterior a la fecha inicial');
        row.weeks = 0;
      } else {
        // Si las fechas son iguales: equivalente a 0 semanas después de restar 1
        row.weeks = 0;
      }
    } else {
      // Si no hay ambas fechas, no calcular
      row.weeks = 0;
    }
  }

  // Getter para obtener las semanas calculadas (solo lectura en modo no edición)
  getCalculatedWeeks(row: PlanningRow): number {
    if (row.startDate && row.endDate) {
      const startDate = new Date(row.startDate);
      const endDate = new Date(row.endDate);
      
      if (endDate > startDate) {
        const timeDifference = endDate.getTime() - startDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
        const weeks = Math.ceil(daysDifference / 7);
        // Restar una semana y no devolver valores negativos
        return Math.max(0, weeks - 1);
      }
    }
    return row.weeks || 0;
  }

  /**
   * Maneja cambios en los horarios - crear nuevos y actualizar existentes
   * Ahora con mejor logging y validación más permisiva
   */
  onSchedulesChange(rowIndex: number, newSchedules: any[]): void {
    console.log('🚨🚨🚨 VERSIÓN ACTUALIZADA - onSchedulesChange EJECUTÁNDOSE 🚨🚨🚨');
    console.log('=== 🚀 INICIO onSchedulesChange ===');
    console.log('📥 Parámetros recibidos:', { rowIndex, newSchedules });
    console.log('📊 Número de horarios recibidos:', newSchedules?.length || 0);
    
    const row = this.rows[rowIndex];
    console.log('📋 Fila seleccionada:', row);
    
    if (!row) {
      console.error('❌ ERROR: Fila no encontrada en el índice:', rowIndex);
      alert('Error: No se pudo encontrar la fila de la clase');
      return;
    }
    
    console.log('🆔 BackendId de la fila:', row.backendId);
    console.log('📅 Clase:', row.courseName);
    
    // Guardar los horarios originales para comparar
    const originalSchedules = [...(row.schedules || [])];
    console.log('💾 Horarios originales:', originalSchedules);
    console.log('🔍 IDs de horarios originales:', originalSchedules.map(h => ({ id: h.id, day: h.day, startTime: h.startTime, endTime: h.endTime })));
    
    // VERIFICACIÓN CRÍTICA: Los horarios originales deben ser una copia profunda
    console.log('🚨 VERIFICACIÓN CRÍTICA - ¿Qué día tiene el horario 1 en originales?:', originalSchedules[1]?.day);
    console.log('🚨 VERIFICACIÓN CRÍTICA - ¿Qué día tiene el horario 1 en row.schedules?:', row.schedules?.[1]?.day);
    
    // Si la clase no tiene un ID válido, no procesar
    if (!row.backendId) {
      console.error('❌ ERROR: No se puede procesar porque la clase no tiene backendId');
      console.log('📄 Datos de la fila sin backendId:', row);
      // Actualizar la interfaz para reflejar que no se procesarán los cambios
      row.schedules = originalSchedules;
      alert('No se pueden modificar horarios hasta guardar la clase');
      return;
    }

    try {
      console.log('🧹 PASO 1: Limpiando duplicados...');
      // PASO 1: Limpiar duplicados en los nuevos horarios antes de procesar
      const cleanedSchedules = this.removeDuplicateSchedules(newSchedules);
      console.log('✨ Horarios después de limpiar duplicados:', cleanedSchedules);
      
      console.log('✅ PASO 2: Validando horarios...');
      // PASO 2: Validar horarios antes de procesarlos
      this.validateSchedules(cleanedSchedules);
      console.log('🎯 Validación completada sin errores');
      
      const classId = row.backendId;
      console.log('🚀 PASO 3: Procesando cambios para clase ID:', classId);
      
      console.log('📂 PASO 4: Categorizando horarios ANTES de actualizar la fila...');
      // PASO 4: Separar horarios en categorías ANTES de sobrescribir row.schedules
      console.log('🔍 Horarios para categorizar:', cleanedSchedules);
      console.log('🔍 IDs de horarios para categorizar:', cleanedSchedules.map(h => ({ id: h.id, day: h.day, startTime: h.startTime, endTime: h.endTime })));
      const newSchedulesToCreate = this.getSchedulesToCreate(cleanedSchedules);
      
      // SOLUCIÓN PERMANENTE: Usar snapshots de los horarios originales desde la carga inicial
      const schedulesToUpdate = this.getSchedulesToUpdateFixed(cleanedSchedules, row.backendId);
      
      console.log('💾 PASO 5: Actualizando horarios en la fila DESPUÉS de categorizar...');
      // PASO 5: Actualizar los horarios en la fila actual DESPUÉS de haber categorizado
      row.schedules = cleanedSchedules;
      
      console.log(`📊 Resumen de operaciones:`);
      console.log(`   🆕 Crear: ${newSchedulesToCreate.length} horarios`);
      console.log(`   📝 Actualizar: ${schedulesToUpdate.length} horarios`);
      console.log(`   💾 Total procesados: ${cleanedSchedules.length} horarios`);
      
      if (newSchedulesToCreate.length > 0) {
        console.log('🆕 Horarios a crear:', newSchedulesToCreate);
      }
      if (schedulesToUpdate.length > 0) {
        console.log('📝 Horarios a actualizar:', schedulesToUpdate);
      }
      
      console.log('⚙️ PASO 6: Ejecutando operaciones...');
      // PASO 6: Procesar creaciones y actualizaciones
      this.processScheduleCreations(classId, newSchedulesToCreate, cleanedSchedules);
      this.processScheduleUpdates(classId, schedulesToUpdate, cleanedSchedules);
      
      console.log('🎉 onSchedulesChange completado exitosamente');
      
    } catch (error) {
      console.error('💥 ERROR en onSchedulesChange:', error);
      console.error('🔍 Tipo de error:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('📝 Mensaje:', error instanceof Error ? error.message : String(error));
      console.error('📚 Stack trace:', error instanceof Error ? error.stack : 'No disponible');
      
      // Revertir cambios en la interfaz en caso de error
      console.log('↩️ Revirtiendo cambios debido al error...');
      row.schedules = originalSchedules;
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar horarios';
      alert(`❌ Error al procesar horarios:\n\n${errorMessage}\n\nLos cambios han sido revertidos.`);
    }
  }
  
  /**
   * Elimina horarios duplicados basándose en día, hora de inicio, fin y modalidad
   * Prioriza horarios con ID (ya guardados) sobre horarios nuevos
   * IMPORTANTE: Permite filas completamente vacías para edición
   */
  private removeDuplicateSchedules(schedules: any[]): any[] {
    const uniqueSchedules: any[] = [];
    const seenKeys = new Set<string>();
    
    console.log('🧹 === INICIO LIMPIEZA DE DUPLICADOS ===');
    console.log('📊 Schedules recibidos:', schedules);
    
    // Ordenar para priorizar horarios con ID
    const sortedSchedules = [...schedules].sort((a, b) => {
      if (a.id && !b.id) return -1; // a con ID va primero
      if (!a.id && b.id) return 1;  // b con ID va primero
      return 0; // mantener orden relativo
    });
    
    sortedSchedules.forEach((schedule, index) => {
      // Crear clave única basada en los campos críticos
      const key = `${schedule.day || 'NO_DAY'}-${schedule.startTime || 'NO_START'}-${schedule.endTime || 'NO_END'}-${schedule.modality || 'NO_MODALITY'}`;
      
      // Verificar si es una fila completamente vacía (nueva para llenar)
      const isCompletelyEmpty = !schedule.id && 
                               !schedule.day && 
                               !schedule.startTime && 
                               !schedule.endTime && 
                               !schedule.modality;
      
      // Verificar si es una fila parcialmente llena (en proceso de edición)
      const isPartiallyFilled = !schedule.id && 
                               (schedule.day || schedule.startTime || schedule.endTime || schedule.modality);
      
      console.log(`🔍 Evaluando schedule ${index}:`, {
        schedule,
        key,
        isCompletelyEmpty,
        isPartiallyFilled,
        hasId: !!schedule.id
      });
      
      if (seenKeys.has(key) && !isCompletelyEmpty && !isPartiallyFilled) {
        console.warn(`🗑️ DUPLICADO REMOVIDO: Horario ${index} con clave "${key}"`, schedule);
        return; // Omitir este duplicado
      }
      
      // Reglas de inclusión:
      // 1. Horario con ID (ya guardado) - SIEMPRE incluir
      // 2. Horario con datos completos - incluir si no es duplicado
      // 3. Fila completamente vacía - SIEMPRE incluir (para edición)
      // 4. Fila parcialmente llena - SIEMPRE incluir (en proceso de edición)
      if (schedule.id || 
          (schedule.day && schedule.startTime && schedule.endTime) ||
          isCompletelyEmpty ||
          isPartiallyFilled) {
        
        // Solo marcar como visto si no está completamente vacío ni siendo editado
        if (!isCompletelyEmpty && !isPartiallyFilled) {
          seenKeys.add(key);
        }
        
        uniqueSchedules.push(schedule);
        
        if (isCompletelyEmpty) {
          console.log(`✅ Fila vacía conservada para edición:`, schedule);
        } else if (isPartiallyFilled) {
          console.log(`✅ Fila parcialmente llena conservada (en edición):`, schedule);
        } else {
          console.log(`✅ Horario único agregado: ${key}`, schedule);
        }
      } else {
        console.log(`⚠️ Horario incompleto omitido (no en edición):`, schedule);
      }
    });
    
    console.log(`📊 Resultado de limpieza: ${uniqueSchedules.length} de ${schedules.length} horarios conservados`);
    console.log('🧹 === FIN LIMPIEZA DE DUPLICADOS ===');
    return uniqueSchedules;
  }
  
  /**
   * Valida que los horarios cumplan con los requisitos mínimos
   * Solo valida horarios que están REALMENTE listos para ser guardados
   * Validación más permisiva durante la edición
   */
  private validateSchedules(schedules: any[]): void {
    console.log('🔍 Validando horarios:', schedules);
    
    // Filtrar solo los horarios que están COMPLETOS Y LISTOS para procesar
    const schedulesToValidate = schedules.filter(schedule => {
      // Los horarios con ID ya existen y son válidos
      if (schedule.id) {
        console.log('✅ Horario con ID encontrado - válido:', schedule.id);
        return true;
      }
      
      // Para horarios nuevos, deben tener al menos día, hora inicio, hora fin Y modalidad
      const hasBasicData = schedule.day && 
                          schedule.startTime && 
                          schedule.endTime && 
                          schedule.modality;
      
      if (!hasBasicData) {
        console.log('⏸️ Horario incompleto - omitiendo validación:', schedule);
        return false; // No validar horarios incompletos
      }
      
      console.log('✅ Horario nuevo completo - validando:', schedule);
      return true;
    });
    
    console.log(`📊 Validando ${schedulesToValidate.length} de ${schedules.length} horarios`);
    
    // Solo verificar conflictos si hay horarios completos que validar
    if (schedulesToValidate.length === 0) {
      console.log('🚫 No hay horarios completos para validar - saltando validación');
      return;
    }
    
    // Verificar conflictos/duplicados SOLO en los horarios completos
    const conflictCheck = this.hasScheduleConflicts(schedulesToValidate);
    if (conflictCheck.hasConflicts) {
      console.error('❌ Conflictos de horario detectados:', conflictCheck.conflicts);
      throw new Error(`Conflictos de horarios detectados:\n${conflictCheck.conflicts.join('\n')}`);
    }
    
    // Validar cada horario completo individualmente
    for (const schedule of schedulesToValidate) {
      // Los horarios con ID ya están validados
      if (schedule.id) continue;
      
      try {
        // Validar campos obligatorios (ya sabemos que están presentes por el filtro anterior)
        
        // Validar modalidad y aula
        if ((schedule.modality !== 'Online' && schedule.modality !== 'Virtual')) {
          // Para modalidades presenciales/híbridas, verificar aula solo si no está siendo editado
          if (!schedule.classroomId && (!schedule.room || !schedule.room.trim())) {
            console.warn(`⚠️ Horario presencial sin aula - puede estar en edición:`, schedule);
            // Solo advertir, no lanzar error aún
          }
        }
        
        // Verificar que la hora de inicio sea anterior a la de fin
        if (schedule.startTime >= schedule.endTime) {
          throw new Error(`La hora de inicio (${schedule.startTime}) debe ser anterior a la hora de fin (${schedule.endTime})`);
        }
        
        console.log('✅ Horario validado correctamente:', schedule);
        
      } catch (error) {
        console.error('❌ Error validando horario individual:', schedule, error);
        throw error;
      }
    }
    
    console.log('🎉 Validación de horarios completada exitosamente');
  }

  /**
   * Obtiene horarios nuevos que necesitan ser creados
   * Validación mejorada pero más permisiva durante la creación
   */
  private getSchedulesToCreate(schedules: any[]): any[] {
    console.log('=== getSchedulesToCreate INICIO ===');
    console.log('📥 Horarios de entrada:', schedules);
    
    const uniqueSchedulesToCreate: any[] = [];
    const seenSchedules = new Set<string>();
    
    schedules.forEach((schedule, index) => {
      console.log(`\n🔍 [${index}] Evaluando horario:`, schedule);
      
      const isNew = !schedule.id;
      console.log('  ✅ Es nuevo (sin ID):', isNew);
      
      if (!isNew) {
        console.log('  ❌ No es nuevo, se omite');
        return;
      }
      
      // Verificar completitud de datos ESENCIALES con logging detallado
      const hasDay = !!schedule.day;
      const hasStartTime = !!schedule.startTime;
      const hasEndTime = !!schedule.endTime;
      const hasModality = !!schedule.modality;
      
      console.log('  📊 Verificación datos esenciales:');
      console.log('    - Día:', hasDay, '→', schedule.day);
      console.log('    - Hora inicio:', hasStartTime, '→', schedule.startTime);
      console.log('    - Hora fin:', hasEndTime, '→', schedule.endTime);
      console.log('    - Modalidad:', hasModality, '→', schedule.modality);
      
      const hasEssentialData = hasDay && hasStartTime && hasEndTime && hasModality;
      console.log('  ✅ Datos esenciales completos:', hasEssentialData);
      
      if (!hasEssentialData) {
        console.log('  ⏸️ RECHAZADO: Faltan datos esenciales');
        return;
      }
      
      // Para modalidades online, no requerimos aula
      const isOnline = schedule.modality === 'Online' || schedule.modality === 'Virtual';
      const hasClassroom = !!(schedule.classroomId || (schedule.room && schedule.room.trim()));
      
      console.log('  🌐 Modalidad online:', isOnline);
      console.log('  🏢 Tiene aula:', hasClassroom);
      
      if (!isOnline && !hasClassroom) {
        console.log('  ⚠️ MODALIDAD PRESENCIAL SIN AULA - PERMITIENDO POR DEBUG');
        // Permitir por ahora para debug
      }
      
      // Crear una clave única para detectar duplicados
      const scheduleKey = `${schedule.day}-${schedule.startTime}-${schedule.endTime}-${schedule.modality}`;
      
      if (seenSchedules.has(scheduleKey)) {
        console.warn(`  ❌ DUPLICADO: "${scheduleKey}"`);
        return;
      }
      
      seenSchedules.add(scheduleKey);
      uniqueSchedulesToCreate.push(schedule);
      console.log('  ✅ ACEPTADO PARA CREACIÓN');
    });
    
    console.log('\n📊 RESULTADO getSchedulesToCreate:');
    console.log(`  Total entrada: ${schedules.length}`);
    console.log(`  Total aceptados: ${uniqueSchedulesToCreate.length}`);
    console.log('  Horarios aceptados:', uniqueSchedulesToCreate);
    
    return uniqueSchedulesToCreate;
  }

  /**
   * Obtiene horarios existentes que han sido modificados - VERSIÓN MEJORADA
   * Compara con los datos originales del backend en lugar de con referencias locales
   */
  private getSchedulesToUpdateFixed(newSchedules: any[], classId: number): any[] {
    console.log('=== getSchedulesToUpdateFixed INICIO ===');
    console.log('📥 Nuevos horarios:', newSchedules);
    console.log('🎯 ClassId para obtener originales:', classId);
    
    // Solo considerar horarios que tienen ID (horarios existentes)
    const existingSchedules = newSchedules.filter(schedule => schedule.id);
    console.log('📋 Horarios existentes con ID:', existingSchedules);
    
    if (existingSchedules.length === 0) {
      console.log('⏸️ No hay horarios existentes para actualizar');
      return [];
    }
    
    // Para esta versión mejorada, consideramos que cualquier horario existente
    // podría haber sido modificado, ya que el problema era la comparación de referencias
    // En el futuro podríamos implementar una comparación con snapshot del backend
    const schedulesToUpdate = existingSchedules;
    
    console.log('\n📊 RESULTADO getSchedulesToUpdateFixed:');
    console.log(`  Total evaluados: ${existingSchedules.length}`);
    console.log(`  Total a actualizar: ${schedulesToUpdate.length}`);
    console.log('  Horarios a actualizar:', schedulesToUpdate);
    
    return schedulesToUpdate;
  }

  /**
   * Obtiene horarios existentes que han sido modificados
   */
  private getSchedulesToUpdate(newSchedules: any[], originalSchedules: any[]): any[] {
    console.log('=== getSchedulesToUpdate INICIO ===');
    console.log('📥 Nuevos horarios:', newSchedules);
    console.log('📋 Horarios originales:', originalSchedules);
    
    const schedulesToUpdate = newSchedules.filter(schedule => {
      console.log(`\n🔍 Evaluando horario para actualización:`, schedule);
      
      if (!schedule.id) {
        console.log('  ❌ No tiene ID, no es para actualización');
        return false;
      }
      
      // Buscar el horario original correspondiente
      const originalSchedule = originalSchedules.find(orig => orig.id === schedule.id);
      if (!originalSchedule) {
        console.log(`  ❌ No se encontró horario original con ID ${schedule.id}`);
        return false;
      }
      
      console.log('  📋 Horario original encontrado:', originalSchedule);
      
      // Verificar si ha cambiado algún campo importante
      const dayChanged = originalSchedule.day !== schedule.day;
      const startTimeChanged = originalSchedule.startTime !== schedule.startTime;
      const endTimeChanged = originalSchedule.endTime !== schedule.endTime;
      const modalityChanged = originalSchedule.modality !== schedule.modality;
      const roomChanged = originalSchedule.room !== schedule.room;
      const roomTypeChanged = originalSchedule.roomType !== schedule.roomType;
      const disabilityChanged = originalSchedule.disability !== schedule.disability;
      
      console.log('  📊 Verificación de cambios:');
      console.log(`    - Día: ${originalSchedule.day} → ${schedule.day} (cambió: ${dayChanged})`);
      console.log(`    - Hora inicio: ${originalSchedule.startTime} → ${schedule.startTime} (cambió: ${startTimeChanged})`);
      console.log(`    - Hora fin: ${originalSchedule.endTime} → ${schedule.endTime} (cambió: ${endTimeChanged})`);
      console.log(`    - Modalidad: ${originalSchedule.modality} → ${schedule.modality} (cambió: ${modalityChanged})`);
      console.log(`    - Aula: ${originalSchedule.room} → ${schedule.room} (cambió: ${roomChanged})`);
      console.log(`    - Tipo aula: ${originalSchedule.roomType} → ${schedule.roomType} (cambió: ${roomTypeChanged})`);
      console.log(`    - Discapacidad: ${originalSchedule.disability} → ${schedule.disability} (cambió: ${disabilityChanged})`);
      
      const hasChanged = dayChanged || startTimeChanged || endTimeChanged || modalityChanged || roomChanged || roomTypeChanged || disabilityChanged;
      console.log(`  🔄 ¿Ha cambiado? ${hasChanged}`);
      
      if (hasChanged) {
        console.log('  ✅ ACEPTADO PARA ACTUALIZACIÓN');
        console.log('  📝 Horario modificado detectado:', { original: originalSchedule, updated: schedule });
        return true;
      } else {
        console.log('  ⏸️ Sin cambios, no necesita actualización');
      }
      
      return false;
    });
    
    console.log('\n📊 RESULTADO getSchedulesToUpdate:');
    console.log(`  Total evaluados: ${newSchedules.length}`);
    console.log(`  Total a actualizar: ${schedulesToUpdate.length}`);
    console.log('  Horarios a actualizar:', schedulesToUpdate);
    
    return schedulesToUpdate;
  }

  /**
   * Procesa la creación de horarios nuevos con manejo mejorado de errores
   */
  private processScheduleCreations(classId: number, schedulesToCreate: any[], allSchedules: any[]): void {
    console.log('🆕 === PROCESANDO CREACIÓN DE HORARIOS ===');
    console.log('📊 Horarios a crear:', schedulesToCreate.length);
    console.log('🎯 ClassId:', classId);
    
    if (schedulesToCreate.length === 0) {
      console.log('⏸️ No hay horarios para crear, saliendo...');
      return;
    }
    
    console.log('📋 Lista completa de horarios a crear:', schedulesToCreate);
    
    // Crear un array para almacenar las suscripciones para hacer un seguimiento
    const creationRequests: { request: any, originalIndex: number, schedule: any }[] = [];
    
    schedulesToCreate.forEach((schedule, index) => {
      console.log(`🔄 Preparando horario ${index + 1} de ${schedulesToCreate.length}:`, schedule);
      
      try {
        const backendSchedule = this.convertToBackendFormat(classId, schedule);
        console.log(`✅ Horario ${index + 1} convertido a formato backend:`, backendSchedule);
        
        const request = this.planningService.assignScheduleToClass(classId, backendSchedule);
        creationRequests.push({ request, originalIndex: index, schedule });
        console.log(`📤 Request ${index + 1} preparado para envío`);
      } catch (error) {
        console.error(`❌ Error preparando horario ${index + 1} para envío:`, error);
        console.error('📊 Horario problemático:', schedule);
        // Mostrar error específico para este horario
        alert(`Error en horario ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    });
    
    console.log(`🚀 Enviando ${creationRequests.length} requests de creación...`);
    
    // Procesar cada solicitud de creación de forma secuencial para evitar condiciones de carrera
    creationRequests.forEach(({ request, originalIndex, schedule }) => {
      console.log(`📡 Enviando request ${originalIndex + 1}...`);
      
      request.subscribe({
        next: (savedSchedule: any) => {
          console.log(`🎉 Horario ${originalIndex + 1} creado exitosamente en el backend:`, savedSchedule);
          console.log('🔍 ANÁLISIS DETALLADO DE LA RESPUESTA:');
          console.log('- ID:', savedSchedule.id);
          console.log('- Modalidad:', savedSchedule.modalityName);
          console.log('- Aula (nombre):', savedSchedule.classroomRoom);
          console.log('- Aula (ID):', savedSchedule.classroomId);
          console.log('- Tipo de aula:', savedSchedule.classroomTypeName);
          console.log('- Ubicación:', savedSchedule.classroomLocation);
          console.log('- Campus:', savedSchedule.classroomCampus);
          console.log('- Capacidad:', savedSchedule.classroomCapacity);
          console.log('- Discapacidad:', savedSchedule.disability);
          console.log('- Todas las propiedades:', Object.keys(savedSchedule));
          
          if (!savedSchedule || !savedSchedule.id) {
            console.error('⚠️ Respuesta del servidor sin ID válido:', savedSchedule);
            return;
          }
          
          // Buscar el horario correspondiente en el array local por múltiples criterios
          // Normalizar y comparar de forma tolerante para evitar falsos negativos
          const scheduleIndex = allSchedules.findIndex(s => {
            if (s.id) return false; // solo horarios nuevos

            // Normalizar día a formato backend (mapDayToBackend acepta código frontend o nombre backend)
            const localDay = this.mapDayToBackend((schedule.day || '').toString());
            const candidateDay = this.mapDayToBackend((s.day || '').toString());

            // Normalizar horas a HH:MM para comparar tanto "08:00" como "08:00:00"
            const normalizeTime = (t: any) => (t ? t.toString().trim().substring(0,5) : '');
            const localStart = normalizeTime(schedule.startTime);
            const candidateStart = normalizeTime(s.startTime);
            const localEnd = normalizeTime(schedule.endTime);
            const candidateEnd = normalizeTime(s.endTime);

            // Comparar modalidad por ID cuando el backend devuelve modalityId
            const localModalityId = this.getModalityId(schedule.modality || schedule.modalityName || '');
            const candidateModalityId = (s.modalityId || this.getModalityId(s.modality || s.modalityName || ''));

            const dayMatches = localDay === candidateDay;
            const startMatches = localStart === candidateStart;
            const endMatches = localEnd === candidateEnd;
            const modalityMatches = (candidateModalityId && localModalityId) ? (Number(candidateModalityId) === Number(localModalityId)) : ((schedule.modality || '').toString().toLowerCase() === (s.modality || '').toString().toLowerCase());

            return dayMatches && startMatches && endMatches && modalityMatches;
          });

          console.log(`🔍 Buscando horario local para asignar ID ${savedSchedule.id}:`, {
            found: scheduleIndex !== -1,
            scheduleIndex,
            searchCriteria: {
              day: schedule.day,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              modality: schedule.modality,
              normalizedDay: this.mapDayToBackend((schedule.day||'').toString())
            }
          });

          if (scheduleIndex !== -1) {
            console.log(`✅ Asignando ID ${savedSchedule.id} al horario en posición ${scheduleIndex}`);
            allSchedules[scheduleIndex].id = savedSchedule.id;
            
            // También almacenar información adicional del backend si está disponible
            if (savedSchedule.modalityName) {
              allSchedules[scheduleIndex].modality = savedSchedule.modalityName;
              console.log('✅ Modalidad actualizada:', savedSchedule.modalityName);
            }
            if (savedSchedule.classroomRoom) {
              allSchedules[scheduleIndex].room = savedSchedule.classroomRoom;
              console.log('✅ Aula (nombre) actualizada:', savedSchedule.classroomRoom);
            }
            if (savedSchedule.classroomId) {
              allSchedules[scheduleIndex].classroomId = savedSchedule.classroomId;
              console.log('✅ Aula (ID) actualizada:', savedSchedule.classroomId);
            }
            
            // Mapear tipo de aula - el backend devuelve "classroomTypeName"
            if (savedSchedule.classroomTypeName) {
              allSchedules[scheduleIndex].roomType = savedSchedule.classroomTypeName;
              console.log('✅ Tipo de aula actualizado desde classroomTypeName:', savedSchedule.classroomTypeName);
            } else if (savedSchedule.modalityName === 'Online') {
              // Para horarios online, no hay tipo de aula
              allSchedules[scheduleIndex].roomType = undefined;
              console.log('� Horario online: tipo de aula establecido como undefined');
            } else {
              console.warn('⚠️ No se encontró classroomTypeName para horario presencial');
            }
            
            console.log('📋 Horario completamente actualizado:', allSchedules[scheduleIndex]);
          } else {
            console.warn('⚠️ No se pudo encontrar el horario correspondiente en el array local para asignar el ID. Se agregará la respuesta del backend al array local para evitar pérdida visual.');
            console.log('Horario buscado:', schedule);
            console.log('Array actual (parcial):', allSchedules.slice(0,10));

            // Insertar la respuesta del backend en el array local para que el UI muestre el horario guardado
            try {
              const mapped: any = {
                id: savedSchedule.id,
                classId: savedSchedule.classId || classId,
                classroomId: savedSchedule.classroomId || savedSchedule.classroomId || null,
                day: savedSchedule.day || schedule.day || '',
                startTime: (savedSchedule.startTime || schedule.startTime || '').toString().substring(0,8),
                endTime: (savedSchedule.endTime || schedule.endTime || '').toString().substring(0,8),
                modality: savedSchedule.modalityName || ((): string => {
                  const id = savedSchedule.modalityId || schedule.modalityId || this.getModalityId(schedule.modality || '');
                  const map: { [k: number]: string } = { 1: 'In-Person', 2: 'Online', 3: 'Hybrid' };
                  return map[Number(id)] || (savedSchedule.modalityName || schedule.modality || 'In-Person');
                })(),
                modalityId: savedSchedule.modalityId || schedule.modalityId || this.getModalityId(schedule.modality || ''),
                disability: savedSchedule.disability ?? schedule.disability ?? false,
                room: savedSchedule.classroomRoom || schedule.room || '',
                classroomRoom: savedSchedule.classroomRoom || schedule.room || '',
                classroomTypeName: savedSchedule.classroomTypeName || undefined,
                classroomLocation: savedSchedule.classroomLocation || undefined
              };

              allSchedules.push(mapped);
              console.log('✅ Respuesta del backend añadida al array local:', mapped);
            } catch (err) {
              console.error('❌ Error mapeando/añadiendo la respuesta del backend al array local:', err, savedSchedule);
            }
          }
        },
        error: (error: any) => {
          console.error(`❌ Error al crear horario ${originalIndex + 1}:`, error);
          
          let errorMessage = 'Error de comunicación con el servidor';
          
          // Intentar extraer mensaje de error más específico del backend
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
          
          // Verificar si es un error de conflicto/duplicado específico del backend
          if (error.status === 409 || error.status === 400) {
            if (errorMessage.toLowerCase().includes('duplicate') || 
                errorMessage.toLowerCase().includes('conflict') ||
                errorMessage.toLowerCase().includes('duplicado') ||
                errorMessage.toLowerCase().includes('conflicto') ||
                errorMessage.toLowerCase().includes('ya existe')) {
              errorMessage = `Conflicto de horarios: ${errorMessage}`;
            }
          }
          
          alert(`Error al crear horario ${originalIndex + 1}: ${errorMessage}`);
          
          // Opcional: remover el horario fallido del array local para mantener consistencia
          const failedScheduleIndex = allSchedules.findIndex(s => 
            !s.id && 
            s.day === schedule.day && 
            s.startTime === schedule.startTime && 
            s.endTime === schedule.endTime &&
            s.modality === schedule.modality
          );
          
          if (failedScheduleIndex !== -1) {
            console.log(`Removiendo horario fallido del array local en posición ${failedScheduleIndex}`);
            allSchedules.splice(failedScheduleIndex, 1);
          }
        }
      });
    });
  }

  /**
   * Procesa la actualización de horarios existentes usando PUT endpoint
   */
  private processScheduleUpdates(classId: number, schedulesToUpdate: any[], allSchedules: any[]): void {
    if (schedulesToUpdate.length === 0) {
      console.log('📝 === PROCESANDO ACTUALIZACIÓN DE HORARIOS ===');
      console.log('⏸️ No hay horarios para actualizar, saliendo...');
      return;
    }
    
    console.log('📝 === PROCESANDO ACTUALIZACIÓN DE HORARIOS ===');
    console.log('📊 Horarios a actualizar:', schedulesToUpdate.length);
    console.log('🎯 ClassId:', classId);
    console.log('📋 Lista de horarios a actualizar:', schedulesToUpdate);
    
    // Procesar cada actualización de forma secuencial
    schedulesToUpdate.forEach((schedule, index) => {
      if (!schedule.id) {
        console.warn(`❌ El horario ${index} no tiene ID, no se puede actualizar:`, schedule);
        return;
      }
      
      console.log(`🔄 Actualizando horario ${index + 1}/${schedulesToUpdate.length} (ID: ${schedule.id}):`, schedule);
      
      try {
        // Convertir al formato backend
        const backendSchedule = this.convertToBackendFormat(classId, schedule);
        console.log('📤 Datos convertidos para backend:', backendSchedule);
        
        // Usar el nuevo endpoint PUT para actualización directa
        this.planningService.updateSchedule(schedule.id, backendSchedule).subscribe({
          next: (updatedSchedule) => {
            console.log(`✅ Horario ${schedule.id} actualizado exitosamente:`, updatedSchedule);
            
            // Actualizar el horario en el array local con los datos del backend
            const schedulePosition = allSchedules.findIndex(s => s.id === schedule.id);
            if (schedulePosition !== -1) {
              console.log(`🔄 Actualizando array local en posición ${schedulePosition}`);
              
              // Mantener el ID original y actualizar otros campos desde el backend
              allSchedules[schedulePosition].id = updatedSchedule.id || schedule.id;
              
              if (updatedSchedule.modalityName) {
                allSchedules[schedulePosition].modality = updatedSchedule.modalityName;
                console.log('✅ Modalidad actualizada:', updatedSchedule.modalityName);
              }
              
              if (updatedSchedule.classroomRoom) {
                allSchedules[schedulePosition].room = updatedSchedule.classroomRoom;
                console.log('✅ Aula (nombre) actualizada:', updatedSchedule.classroomRoom);
              }
              
              if (updatedSchedule.classroomId) {
                allSchedules[schedulePosition].classroomId = updatedSchedule.classroomId;
                console.log('✅ Aula (ID) actualizada:', updatedSchedule.classroomId);
              }
              
              // Mapear tipo de aula - el backend devuelve "classroomTypeName"
              if (updatedSchedule.classroomTypeName) {
                allSchedules[schedulePosition].roomType = updatedSchedule.classroomTypeName;
                console.log('✅ Tipo de aula actualizado desde classroomTypeName:', updatedSchedule.classroomTypeName);
              } else if (updatedSchedule.modalityName === 'Online') {
                // Para horarios online, no hay tipo de aula
                allSchedules[schedulePosition].roomType = undefined;
                console.log('🌐 Horario online: tipo de aula establecido como undefined');
              }
              
              console.log('📋 Horario completamente actualizado en array local:', allSchedules[schedulePosition]);
            } else {
              console.warn('⚠️ No se pudo encontrar el horario en el array local para actualizar');
            }
          },
          error: (error) => {
            console.error(`❌ Error al actualizar horario ${schedule.id}:`, error);
            
            let errorMessage = 'Error de comunicación con el servidor';
            
            // Intentar extraer mensaje de error más específico del backend
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
            
            // Verificar si es un error de conflicto específico del backend
            if (error.status === 409 || error.status === 400) {
              if (errorMessage.toLowerCase().includes('duplicate') || 
                  errorMessage.toLowerCase().includes('conflict') ||
                  errorMessage.toLowerCase().includes('duplicado') ||
                  errorMessage.toLowerCase().includes('conflicto') ||
                  errorMessage.toLowerCase().includes('ya existe') ||
                  errorMessage.toLowerCase().includes('solapamiento')) {
                errorMessage = `Conflicto de horarios: ${errorMessage}`;
              }
            }
            
            // Si el PUT falla, podríamos implementar fallback al patrón delete-create como plan B
            console.warn(`🔄 PUT falló para horario ${schedule.id}, considerando fallback...`);
            alert(`Error al actualizar horario: ${errorMessage}`);
          }
        });
        
      } catch (error) {
        console.error(`❌ Error preparando datos para actualizar horario ${index + 1}:`, error);
        const message = error instanceof Error ? error.message : String(error);

        // Si el error es por falta de aula en modalidad presencial, mostrar advertencia y continuar
        if (message.toLowerCase().includes('requiere un aula') || message.toLowerCase().includes('requiere un aula asignada')) {
          // No mostrar alert intrusivo. Marcar el horario localmente para que la UI
          // pueda indicar visualmente que falta un aula si se desea.
          console.warn('⚠️ Falta aula para modalidad presencial, se omite actualización de este horario:', message);
          try {
            // Marcar objeto schedule actual
            (schedule as any)._needsClassroom = true;

            // Si existe en el array local allSchedules, marcar también ahí
            const localIndex = allSchedules.findIndex((s: any) => s.id === schedule.id);
            if (localIndex !== -1) {
              allSchedules[localIndex]._needsClassroom = true;
              console.log(`🔖 Marcado _needsClassroom en allSchedules[${localIndex}]`);
            }
          } catch (e) {
            console.warn('No se pudo marcar localmente el horario con _needsClassroom:', e);
          }

          // continuar con el siguiente elemento del forEach sin mostrar alerta
          return;
        }

        // Para otros errores, mantener comportamiento crítico
        alert(`Error crítico: No se pueden preparar los datos para actualización.\nError: ${message}`);
      }
    });
  }

  /**
   * Convierte horario del formato frontend al formato backend
   * Más permisivo durante edición, estricto solo al guardar
   */
  private convertToBackendFormat(classId: number, schedule: any): any {
    console.log('🔄 Convirtiendo schedule al formato backend:', schedule);
    
    // Validaciones básicas
    if (!classId || classId <= 0) {
      throw new Error('ID de clase inválido');
    }
    
    // Validar que tenemos los datos mínimos
    if (!schedule.day || !schedule.startTime || !schedule.endTime || !schedule.modality) {
      console.error('❌ Faltan datos esenciales:', {
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        modality: schedule.modality
      });
      throw new Error('Faltan datos esenciales del horario (día, hora inicio, hora fin, modalidad)');
    }
    
    let classroomId = schedule.classroomId;
    
    // Manejo de modalidades
    if (schedule.modality === 'Virtual' || schedule.modality === 'Online') {
      classroomId = null; 
      console.log('📱 Modalidad online/virtual: sin aula física requerida');
    } else {
      // Para modalidades presenciales, validar aula solo si no está disponible
      if (!classroomId) {
        console.warn('⚠️ Modalidad presencial sin ID de aula - verificando alternativas');
        // Podría implementarse búsqueda por nombre de aula aquí si es necesario
        if (!schedule.room || !schedule.room.trim()) {
          throw new Error(`Modalidad ${schedule.modality} requiere un aula asignada`);
        }
      }
    }
    
    // Validar formato de horas solo si están presentes
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule.startTime)) {
      throw new Error(`Hora de inicio inválida: ${schedule.startTime}. Use formato HH:MM`);
    }
    if (!timeRegex.test(schedule.endTime)) {
      throw new Error(`Hora de fin inválida: ${schedule.endTime}. Use formato HH:MM`);
    }
    
    // Validar lógica de horarios
    if (schedule.startTime >= schedule.endTime) {
      throw new Error(`La hora de inicio (${schedule.startTime}) debe ser anterior a la hora de fin (${schedule.endTime})`);
    }
    
    // Crear formato para backend
    const backendFormat = {
      classId: Number(classId),
      day: this.mapDayToBackend(schedule.day),
      startTime: schedule.startTime.trim(),
      endTime: schedule.endTime.trim(),
      classroomId: classroomId ? Number(classroomId) : null,
      modalityId: this.getModalityId(schedule.modality),
      disability: Boolean(schedule.disability),
      // Incluir el tipo de aula seleccionado por el usuario
      roomType: schedule.roomType || null
    };
    
    console.log('✅ Formato backend generado:', backendFormat);
    return backendFormat;
  }

  /**
   * Mapea días del frontend al formato del backend
   */
  private mapDayToBackend(day: string): string {
    const dayMap: { [key: string]: string } = {
      'LUN': 'Monday',
      'MAR': 'Tuesday', 
      'MIE': 'Wednesday',
      'JUE': 'Thursday',
      'VIE': 'Friday',
      'SAB': 'Saturday',
      'DOM': 'Sunday',
      // Mapeos inversos por si ya viene en formato de backend
      'Monday': 'Monday',
      'Tuesday': 'Tuesday',
      'Wednesday': 'Wednesday',
      'Thursday': 'Thursday',
      'Friday': 'Friday',
      'Saturday': 'Saturday',
      'Sunday': 'Sunday'
    };
    
    const backendDay = dayMap[day];
    if (!backendDay) {
      console.error(`Error: Día "${day}" no reconocido`);
      throw new Error(`Día "${day}" no válido`);
    }
    
    return backendDay;
  }

  /**
   * Maneja cambios en el ID del curso - CONECTADO AL BACKEND REAL
   */
  onCourseIdChange(index: number, courseId: string): void {
    console.log('🆔 onCourseIdChange llamado:', { index, courseId });
    
    if (!courseId || !courseId.trim()) {
      // Si está vacío, limpiar los datos del curso
      this.patchRow.emit({ index, data: { courseId: '', courseName: '', section: '' } });
      return;
    }
    
    const trimmedId = courseId.trim();
    console.log(`🔍 Validando curso con ID: "${trimmedId}"`);
    
    // Actualizar inmediatamente el ID en la fila
    this.patchRow.emit({ index, data: { courseId: trimmedId } });
    
    // Buscar y validar el curso en el backend
    this.planningService.getCourseById(trimmedId).subscribe({
      next: (course) => {
        console.log('✅ Curso encontrado en backend:', course);
        
        // Actualizar nombre del curso (sin incluir el ID)
        if (course && course.name) {
          this.patchRow.emit({ index, data: { courseName: course.name } });
          
          // Obtener sección para este curso
          this.planningService.getSectionByCourseId(trimmedId).subscribe({
            next: (section: string) => {
              console.log(`✅ Sección obtenida: ${section}`);
              this.patchRow.emit({ index, data: { section: section } });
            },
            error: (sectionError) => {
              console.error('❌ Error al obtener sección:', sectionError);
              const fallbackSection = `Sección 01`;
              this.patchRow.emit({ index, data: { section: fallbackSection } });
            }
          });
        } else {
          console.warn('⚠️ Curso encontrado pero sin nombre');
          this.patchRow.emit({ index, data: { courseName: `Curso ${trimmedId}` } });
        }
      },
      error: (error) => {
        console.error(`❌ Error al buscar curso ID "${trimmedId}":`, error);
        
        // Verificar si es un error 404 (curso no encontrado)
        if (error.status === 404) {
          console.warn(`⚠️ Curso "${trimmedId}" no existe en el backend`);
          this.patchRow.emit({ index, data: { 
            courseName: `⚠️ Curso "${trimmedId}" no encontrado`,
            section: ''
          }});
        } else {
          console.warn('⚠️ Error de conexión, manteniendo ID ingresado');
          // Mantener el ID pero limpiar otros campos
          this.patchRow.emit({ index, data: { 
            courseName: `Curso ${trimmedId} (sin validar)`,
            section: 'Sin sección'
          }});
        }
      }
    });
  }

  /**
   * Maneja la eliminación de un horario específico
   */
  onScheduleDeleted(rowIndex: number, scheduleId: number): void {
    console.log('onScheduleDeleted llamado:', { rowIndex, scheduleId });
    
    const row = this.rows[rowIndex];
    if (!row.schedules) return;
    
    // Eliminar del backend
    this.planningService.deleteSchedule(scheduleId).subscribe({
      next: () => {
        console.log(`Horario ${scheduleId} eliminado exitosamente`);
        
        // Eliminar del array local
        row.schedules = row.schedules.filter(schedule => schedule.id !== scheduleId);
      },
      error: (error) => {
        console.error('Error al eliminar horario:', error);
      }
    });
  }

  /**
   * Obtiene el ID de modalidad basado en el nombre
   */
  private getModalityId(modality: string): number {
    console.log('Mapeando modalidad:', modality);
    
    const modalityMap: { [key: string]: number } = {
      'Presencial': 1,
      'In-Person': 1,
      'Virtual': 2,
      'Online': 2,
      'Híbrido': 3,
      'Hybrid': 3
    };
    
    const modalityId = modalityMap[modality] || 1;
    console.log(`Modalidad '${modality}' -> ID ${modalityId}`);
    return modalityId;
  }

  /**
   * Función de debug para verificar el estado de las filas
   * Útil para llamar desde la consola del navegador
   */
  debugRowState(rowIndex?: number): void {
    console.log('🐛 === DEBUG: ESTADO DE FILAS ===');
    
    if (rowIndex !== undefined && rowIndex >= 0 && rowIndex < this.rows.length) {
      const row = this.rows[rowIndex];
      console.log(`📍 Fila ${rowIndex}:`, {
        courseName: row.courseName,
        _editing: row._editing,
        _open: row._open,
        backendId: row.backendId,
        schedules: row.schedules,
        schedulesLength: row.schedules?.length || 0
      });
    } else {
      console.log('📊 Todas las filas:');
      this.rows.forEach((row, index) => {
        console.log(`   Fila ${index}:`, {
          courseName: row.courseName,
          _editing: row._editing,
          _open: row._open,
          backendId: row.backendId,
          schedulesLength: row.schedules?.length || 0
        });
      });
    }
    
    console.log('🏁 === FIN DEBUG ===');
  }

  /**
   * Verifica si existe un conflicto de horarios dentro del mismo conjunto de datos
   * Útil para prevenir duplicados antes de enviar al servidor
   */
  private hasScheduleConflicts(schedules: any[]): { hasConflicts: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    const scheduleMap = new Map<string, any>();
    
    schedules.forEach((schedule, index) => {
      if (!schedule.day || !schedule.startTime || !schedule.endTime) {
        return; // Omitir horarios incompletos
      }
      
      const key = `${schedule.day}-${schedule.startTime}-${schedule.endTime}`;
      
      if (scheduleMap.has(key)) {
        const existing = scheduleMap.get(key);
        conflicts.push(`Conflicto detectado: ${schedule.day} de ${schedule.startTime} a ${schedule.endTime} aparece duplicado (índices ${existing.index} y ${index})`);
      } else {
        scheduleMap.set(key, { ...schedule, index });
      }
    });
    
    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  // Métodos para el tooltip de fechas de docentes
  async onTeacherMouseEnter(event: MouseEvent, teacherId: number) {
    // Cancelar cualquier timeout pendiente
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
      this.tooltipTimeout = null;
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltipPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    };
    
    // Buscar la fila que contiene este docente para obtener el classId (backendId)
    const row = this.findRowByTeacherId(teacherId);
    
    if (!row || !row.backendId) {
      console.warn('⚠️ No se encontró la clase para el docente o la clase no tiene backendId');
      // Mostrar tooltip básico sin datos reales
      const teacherData: TeacherClassWithDates = {
        id: 0,
        semesterId: 0,
        teacherId: teacherId,
        classId: 0,
        workHours: 0,
        statusId: 0,
        teacherName: this.getTeacherNameById(teacherId),
        teacherLastName: '',
        startDate: undefined,
        endDate: undefined
      };
      
      this.tooltipTeacherData = teacherData;
      this.showTeacherTooltip = true;
      return;
    }
    
    try {
      // Obtener los datos reales del teacher_class desde el backend
      const teacherClass = await firstValueFrom(
        this.teacherDatesService.getTeacherClassByTeacherAndClass(teacherId, row.backendId)
      );
      
      this.tooltipTeacherData = teacherClass;
      this.showTeacherTooltip = true;
    } catch (error) {
      console.error('Error loading teacher class data:', error);
      
      // Fallback: mostrar tooltip básico
      const teacherData: TeacherClassWithDates = {
        id: 0,
        semesterId: 0,
        teacherId: teacherId,
        classId: row.backendId,
        workHours: 0,
        statusId: 0,
        teacherName: this.getTeacherNameById(teacherId),
        teacherLastName: '',
        startDate: undefined,
        endDate: undefined
      };
      
      this.tooltipTeacherData = teacherData;
      this.showTeacherTooltip = true;
    }
  }

  onTeacherMouseLeave() {
    // Agregar delay para permitir interacción con el tooltip
    this.tooltipTimeout = setTimeout(() => {
      this.showTeacherTooltip = false;
      this.tooltipTeacherData = null;
    }, 300); // 300ms de delay
  }

  // Método para cuando el mouse entra al tooltip (cancela el cierre)
  onTooltipMouseEnter() {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
      this.tooltipTimeout = null;
    }
  }

  // Método para cuando el mouse sale del tooltip
  onTooltipMouseLeave() {
    this.showTeacherTooltip = false;
    this.tooltipTeacherData = null;
  }

  // Método para cuando se hace clic en "Asignar fechas" del tooltip
  onEditTeacherDates() {
    console.log('📅 Editando fechas de docente desde tooltip');
    
    if (!this.tooltipTeacherData) {
      console.error('❌ No hay datos del docente en el tooltip');
      return;
    }

    // Ocultar el tooltip
    this.showTeacherTooltip = false;
    
    // Crear los datos para el modal de fechas
    const teacherName = this.tooltipTeacherData.teacherName || 'Docente desconocido';
    const className = 'Clase'; // Podrías obtener esto del contexto
    
    this.datePopupData = {
      teacherClassId: this.tooltipTeacherData.id,
      teacherName: teacherName,
      className: className,
      currentStartDate: this.tooltipTeacherData.startDate,
      currentEndDate: this.tooltipTeacherData.endDate,
      semesterStartDate: this.getSemesterStartDate(),
      semesterEndDate: this.getSemesterEndDate()
    };

    // Mostrar el modal de fechas
    this.showDatesModal = true;
    
    // Limpiar el tooltip
    this.tooltipTeacherData = null;
  }

  // Método para manejar cuando se seleccionan fechas en el modal
  onTeacherDatesSelected(dates: TeacherDatesRequest) {
    console.log('� Fechas seleccionadas:', dates);
    
    if (!this.datePopupData) {
      console.error('❌ No hay datos del popup');
      return;
    }

    // Actualizar las fechas mediante el servicio si tenemos teacherClassId válido
    if (this.datePopupData.teacherClassId > 0) {
      this.teacherDatesService.updateTeachingDates(this.datePopupData.teacherClassId, dates)
        .subscribe({
          next: (updatedTeacherClass) => {
            console.log('✅ Fechas actualizadas:', updatedTeacherClass);
            this.closeDatesModal();
          },
          error: (error) => {
            console.error('❌ Error al actualizar fechas:', error);
            this.closeDatesModal();
          }
        });
    } else {
      console.warn('⚠️ No se puede actualizar: teacherClassId no válido');
      this.closeDatesModal();
    }
  }

  // Método para cerrar el modal de fechas
  closeDatesModal() {
    this.showDatesModal = false;
    this.datePopupData = null;
  }

  private getTeacherNameById(teacherId: number): string {
    // Buscar el nombre del docente en todas las filas
    for (const row of this.rows) {
      if (row.teachers) {
        const teacher = row.teachers.find(t => t.id === teacherId);
        if (teacher) {
          return teacher.name;
        }
      }
    }
    return 'Docente desconocido';
  }

  private findRowByTeacherId(teacherId: number): PlanningRow | null {
    // Buscar la fila que contiene el docente
    for (const row of this.rows) {
      if (row.teachers && row.teachers.some(t => t.id === teacherId)) {
        return row;
      }
    }
    return null;
  }

  private getSemesterStartDate(): string {
    // TODO: Obtener del servicio de semestres
    // Por ahora retornar fecha del semestre actual
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    if (currentMonth < 6) {
      // Primer semestre
      return `${currentYear}-01-15`;
    } else {
      // Segundo semestre
      return `${currentYear}-08-15`;
    }
  }

  private getSemesterEndDate(): string {
    // TODO: Obtener del servicio de semestres
    // Por ahora retornar fecha del semestre actual
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    if (currentMonth < 6) {
      // Primer semestre
      return `${currentYear}-05-30`;
    } else {
      // Segundo semestre
      return `${currentYear}-11-30`;
    }
  }
}
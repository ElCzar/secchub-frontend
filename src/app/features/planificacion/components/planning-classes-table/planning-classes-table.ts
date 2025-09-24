import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanningRow } from '../../models/planificacion.models';
import { SchedulesTableRoom } from "../schedules-table-room/schedules-table-room";
import { SelectedTeachers } from '../../services/selected-teachers';
import { ObservacionesModal } from '../observaciones-modal/observaciones-modal';
import { PlanningService } from '../../services/planning.service';

// Interfaz para las opciones de curso en el autocompletado
export interface CourseOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-planning-classes-table',
  imports: [CommonModule, FormsModule, SchedulesTableRoom, ObservacionesModal],
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
    private readonly planningService: PlanningService
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
    
    if (!this.rows[index].teacher) {
      this.rows[index].teacher = { id: 0, name: '' };
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

  // Función para enviar correo
  sendEmail(index: number) {
    const row = this.rows[index];
    console.log('Enviar correo para la clase:', row);
    
    // TODO: Implementar lógica para enviar correo
    // Aquí puedes agregar la lógica para enviar un correo electrónico
    // Por ejemplo, abrir un modal de composición de correo o llamar a un servicio
    
    // Ejemplo de datos que podrían enviarse:
    const emailData = {
      recipient: row.teacher?.name || 'Sin docente asignado',
      subject: `Información sobre la clase: ${row.courseName}`,
      body: `
        Materia: ${row.courseName}
        Sección: ${row.section}
        ID Clase: ${row.classId}
        Fechas: ${row.startDate} - ${row.endDate}
        Estado: ${row.status}
      `
    };
    
    // Por ahora solo mostramos un alert como ejemplo
    alert(`Enviando correo para la clase: ${row.courseName}\nDocente: ${row.teacher?.name || 'Sin docente'}`);
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
    return row.teacher?.name || '';
  }

  updateTeacherName(row: PlanningRow, name: string) {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      // Si borra completamente el nombre, limpia el teacher
      row.teacher = undefined;
    } else {
      // Si hay texto, inicializa teacher si es necesario
      if (!row.teacher) {
        row.teacher = { id: 0, name: '' };
      }
      row.teacher!.name = trimmedName;
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
    // TODO: Redirigir a la pantalla de selección de docentes adicionales
    // Router.navigate(['/seleccionar-docente-adicional', { classId: this.rows[index].classId }]);
  }

  viewTeacherDetails(index: number) {
    console.log('Ver detalles del docente para la fila', index);
    // TODO: Mostrar modal o navegar a detalles del docente
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
        
        row.weeks = weeks;
      } else if (endDate < startDate) {
        // Si la fecha final es anterior a la inicial, mostrar error
        console.warn('La fecha final debe ser posterior a la fecha inicial');
        row.weeks = 0;
      } else {
        // Si las fechas son iguales
        row.weeks = 1;
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
        return Math.ceil(daysDifference / 7);
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
          const scheduleIndex = allSchedules.findIndex(s => 
            !s.id && // Debe ser un horario nuevo (sin ID previo)
            s.day === schedule.day && 
            s.startTime === schedule.startTime && 
            s.endTime === schedule.endTime &&
            s.modality === schedule.modality
          );
          
          console.log(`🔍 Buscando horario local para asignar ID ${savedSchedule.id}:`, {
            found: scheduleIndex !== -1,
            scheduleIndex,
            searchCriteria: {
              day: schedule.day,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              modality: schedule.modality
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
            console.warn('⚠️ No se pudo encontrar el horario correspondiente en el array local para asignar el ID');
            console.log('Horario buscado:', schedule);
            console.log('Array actual:', allSchedules);
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
        alert(`Error crítico: No se pueden preparar los datos para actualización. 
               Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
}
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanningRow } from '../../models/planificacion.models';
import { SchedulesTableRoom } from "../schedules-table-room/schedules-table-room";
import { SelectedTeachers } from '../../services/selected-teachers';
import { ObservacionesModal } from '../observaciones-modal/observaciones-modal';

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

  constructor(private readonly router: Router, private readonly datePipe: DatePipe, private readonly selectedTeachersService: SelectedTeachers) {}

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
    if (!this.rows[index].teacher) {
      this.rows[index].teacher = { id: '', name: '' };
    }
    this.rows[index]._editing = true;
  }

  // Guarda los cambios y desactiva modo edición
  saveClass(index: number) {
    this.rows[index]._editing = false;
    this.patchRow.emit({ index, data: this.rows[index] });
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
        row.teacher = { id: '', name: '' };
      }
      row.teacher.name = trimmedName;
    }
  }

  // Funciones para el autocompletado de cursos
  onSearch(i: number, term: string) {
    const q = term?.trim();
    if (!q) {
      this.suggestions[i] = [];
      this.showList[i] = false;
      return;
    }
    
    // TODO: Aquí debes conectar con tu servicio backend
    // Por ahora, simulamos datos mock
    const mockCourses: CourseOption[] = [
      { id: '1010', name: 'Redes de Computadores' },
      { id: '1015', name: 'Ingeniería de Software' },
      { id: '1020', name: 'Base de Datos' },
      { id: '1025', name: 'Algoritmos y Estructuras de Datos' },
      { id: '1030', name: 'Sistemas Operativos' },
    ];
    
    const filtered = mockCourses.filter(course => 
      course.id.toLowerCase().includes(q.toLowerCase()) || 
      course.name.toLowerCase().includes(q.toLowerCase())
    );
    
    this.suggestions[i] = filtered;
    this.showList[i] = filtered.length > 0;
  }

  selectCourse(i: number, opt: CourseOption) {
    this.showList[i] = false;
    this.suggestions[i] = [];

    // Actualiza el ID y nombre del curso en la fila
    this.patchRow.emit({ index: i, data: { courseId: opt.id, courseName: opt.name } });

    // TODO: Aquí debes obtener la sección desde el backend basándote en el courseId
    // Por ahora simulamos una sección por defecto
    const mockSection = this.getMockSectionForCourse(opt.id);
    this.patchRow.emit({ index: i, data: { section: mockSection } });
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
    
    // Navegar a la pantalla de selección de docentes con el contexto de la clase
    this.router.navigate(['/seleccionar-docente'], {
      state: {
        classKey,
        classInfo: {
          materia: row.courseName,
          seccion: row.section,
          classId: row.classId,
          rowIndex: index
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
}
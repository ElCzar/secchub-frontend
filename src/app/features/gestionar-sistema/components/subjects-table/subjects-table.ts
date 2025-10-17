import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseResponseDTO } from '../../../../shared/model/dto/admin/CourseResponseDTO.model';

@Component({
  selector: 'app-subjects-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects-table.html',
  styleUrl: './subjects-table.scss'
})
export class SubjectsTable {
  @Input() courses: CourseResponseDTO[] = [];
  @Input() loading = false;

  @Output() edit = new EventEmitter<CourseResponseDTO>();
  @Output() delete = new EventEmitter<CourseResponseDTO>();
  @Output() refresh = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  // Estado para nueva materia
  isAddingNew = false;
  editingCourseId: number | null = null;
  originalCourse: CourseResponseDTO | null = null; // Para guardar el estado original
  
  // Estado temporal para edición
  tempEditData: any = {};
  
  newCourse = {
    code: '',
    name: '',
    credits: 0,
    description: '',
    status: 'Active',
    section: ''
  };

  // Opciones para dropdowns
  statusOptions = [
    { value: 'Active', label: 'Activo' },
    { value: 'Inactive', label: 'Inactivo' }
  ];

  sectionOptions = [
    'Sistemas',
    'Industrial',
    'Civil',
    'Electrónica',
    'Mecánica'
  ];

  editCourse(course: CourseResponseDTO): void {
    if (this.editingCourseId === course.id) {
      // Si ya está editando, guardar cambios
      this.saveEditedCourse(course);
    } else {
      // Activar modo edición y guardar copia original
      this.editingCourseId = course.id;
      this.originalCourse = { ...course }; // Crear copia del estado original
      
      // Inicializar datos temporales para edición
      this.tempEditData = {
        status: this.getStatusLabel(course) === 'Activo' ? 'Active' : 'Inactive',
        section: course.semesterName || course.departmentName || ''
      };
    }
  }

  saveEditedCourse(course: CourseResponseDTO): void {
    // Aplicar los cambios temporales al curso
    if (this.tempEditData.section) {
      course.semesterName = this.tempEditData.section;
      course.departmentName = this.tempEditData.section;
    }
    
    // Aquí iría la lógica para guardar en el backend
    console.log('Save edited course:', course);
    this.editingCourseId = null;
    this.originalCourse = null;
    this.tempEditData = {};
    this.edit.emit(course);
  }

  cancelEdit(): void {
    // Restaurar valores originales si hay una copia guardada
    if (this.originalCourse && this.editingCourseId) {
      const courseIndex = this.courses.findIndex(c => c.id === this.editingCourseId);
      if (courseIndex >= 0) {
        this.courses[courseIndex] = { ...this.originalCourse };
      }
    }
    this.editingCourseId = null;
    this.originalCourse = null;
    this.tempEditData = {};
  }

  isEditing(courseId: number): boolean {
    return this.editingCourseId === courseId;
  }

  getStatusLabel(course: CourseResponseDTO): string {
    // Lógica temporal: si tiene departamento, está activo
    if (course.departmentName || course.departmentId) {
      return 'Activo';
    }
    return 'Inactivo';
  }

  getStatusClass(course: CourseResponseDTO): string {
    // Retorna la clase CSS según el estado
    if (course.departmentName || course.departmentId) {
      return 'status-active';
    }
    return 'status-inactive';
  }

  deleteCourse(course: CourseResponseDTO): void {
    this.delete.emit(course);
  }

  startAddingNew(): void {
    this.isAddingNew = true;
    this.resetNewCourse();
  }

  cancelAddingNew(): void {
    this.isAddingNew = false;
    this.resetNewCourse();
  }

  saveNewCourse(): void {
    if (this.validateNewCourse()) {
      this.save.emit(this.newCourse);
      this.isAddingNew = false;
      this.resetNewCourse();
    }
  }

  private resetNewCourse(): void {
    this.newCourse = {
      code: '',
      name: '',
      credits: 0,
      description: '',
      status: 'Active',
      section: ''
    };
  }

  validateNewCourse(): boolean {
    return !!(this.newCourse.code && this.newCourse.name && this.newCourse.credits > 0);
  }

  incrementCredits(): void {
    if (this.newCourse.credits < 10) {
      this.newCourse.credits++;
    }
  }

  decrementCredits(): void {
    if (this.newCourse.credits > 0) {
      this.newCourse.credits--;
    }
  }
}

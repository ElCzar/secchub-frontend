import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseResponseDTO } from '../../../../shared/model/dto/admin/CourseResponseDTO.model';
import { SectionResponseDTO } from '../../../registrar/models/section.models';
import { StatusDTO } from '../../../../shared/model/dto/parametric';
import { CourseChangeService } from '../../services/course-change-service.service';

@Component({
  selector: 'app-subjects-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects-table.html',
  styleUrl: './subjects-table.scss'
})
export class SubjectsTable {
  @Input() courses: CourseResponseDTO[] = [];
  @Input() sections: SectionResponseDTO[] = [];
  @Input() statuses: StatusDTO[] = [];
  @Input() loading = false;

  @Output() edit = new EventEmitter<CourseResponseDTO>();
  @Output() delete = new EventEmitter<CourseResponseDTO>();
  @Output() refresh = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  constructor(private readonly courseChangeService: CourseChangeService) {}

  // Estado para nueva materia
  isAddingNew = false;
  editingCourseId: number | undefined = undefined;
  originalCourse: CourseResponseDTO | null = null; // Para guardar el estado original
  
  // Estado temporal para edición
  tempEditData: any = {};
  
  newCourse = {
    code: '',
    name: '',
    credits: 0,
    description: '',
    status: 'Active',
    sectionId: null as number | null
  };

  // Opciones para dropdowns
  statusOptions = [
    { value: 'Active', label: 'Activo' },
    { value: 'Inactive', label: 'Inactivo' }
  ];

  editCourse(course: CourseResponseDTO): void {
    if (!course.id) {
      console.warn('Cannot edit course without ID');
      return;
    }
    
    if (this.editingCourseId === course.id) {
      // Si ya está editando, guardar cambios
      this.saveEditedCourse(course);
    } else {
      // Entrar en modo edición
      this.editingCourseId = course.id;
      this.originalCourse = { ...course }; // Crear copia del estado original
      
      // Inicializar datos temporales para edición
      this.tempEditData = {
        status: this.getStatusLabel(course) === 'Activo' ? 'Active' : 'Inactive',
        sectionId: course.sectionId || null
      };
    }
  }

  saveEditedCourse(course: CourseResponseDTO): void {
    console.log('Saving edited course:', course);
    console.log('Temp edit data:', this.tempEditData);
    
    // Apply temporary changes to course
    if (this.tempEditData.sectionId) {
      course.sectionId = this.tempEditData.sectionId;
    }
    
    // Check if it has an ID (existing course) to update, otherwise create
    if (course.id) {
      // Update existing course
      const courseRequest = this.courseChangeService.mapToRequestDTO(course);
      
      this.courseChangeService.updateCourse(course.id, courseRequest).subscribe({
        next: (updatedCourse) => {
          console.log('Course updated successfully:', updatedCourse);
          this.editingCourseId = undefined;
          this.originalCourse = null;
          this.tempEditData = {};
          this.edit.emit(updatedCourse);
          this.refresh.emit();
        },
        error: (error) => {
          console.error('Error updating course:', error);
          // Restore original values on error
          this.cancelEdit();
        }
      });
    } else {
      // Create new course
      const selectedStatus = this.statuses.find(s => s.name === this.tempEditData.status);
      
      const courseRequest = this.courseChangeService.createRequestDTO(
        course,
        this.tempEditData.sectionId || undefined,
        selectedStatus?.id || 1
      );
      
      this.courseChangeService.createCourse(courseRequest).subscribe({
        next: (newCourse) => {
          console.log('Course created successfully:', newCourse);
          this.editingCourseId = undefined;
          this.originalCourse = null;
          this.tempEditData = {};
          this.save.emit(newCourse);
          this.refresh.emit();
        },
        error: (error) => {
          console.error('Error creating course:', error);
          this.cancelEdit();
        }
      });
    }
  }

  obtainSectionNameById(sectionId: number): string {
    const section = this.sections.find(sec => sec.id === sectionId);
    return section ? section.name : 'Desconocida';
  }

  cancelEdit(): void {
    // Restaurar valores originales si hay una copia guardada
    if (this.originalCourse && this.editingCourseId) {
      const courseIndex = this.courses.findIndex(c => c.id === this.editingCourseId);
      if (courseIndex >= 0) {
        this.courses[courseIndex] = { ...this.originalCourse };
      }
    }
    this.editingCourseId = undefined;
    this.originalCourse = null;
    this.tempEditData = {};
  }

  isEditing(courseId: number | undefined): boolean {
    return courseId !== undefined && this.editingCourseId === courseId;
  }

  getStatusLabel(course: CourseResponseDTO): string {
    // Lógica temporal: si tiene departamento, está activo
    const status = this.statuses.find(s => s.id === course.statusId);
    if (status?.name === 'Active') {
      return 'Activo';
    }
    return 'Inactivo';
  }

  getStatusClass(course: CourseResponseDTO): string {
    // Retorna la clase CSS según el estado
    const status = this.statuses.find(s => s.id === course.statusId);
    if (status?.name === 'Active') {
      return 'status-active';
    }
    return 'status-inactive';
  }

  deleteCourse(course: CourseResponseDTO): void {
    if (!course.id) {
      console.warn('Cannot delete course without ID');
      return;
    }
    
    // If currently editing this course, cancel edit mode
    if (this.editingCourseId === course.id) {
      this.cancelEdit();
    }
    
    // Confirm deletion
    if (confirm(`¿Está seguro de que desea eliminar el curso "${course.name || 'Sin nombre'}"?`)) {
      this.courseChangeService.deleteCourse(course.id).subscribe({
        next: () => {
          console.log('Course deleted successfully');
          this.delete.emit(course);
          this.refresh.emit();
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Error al eliminar el curso. Por favor, inténtelo de nuevo.');
        }
      });
    }
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
      // Find selected section and status
      const selectedStatus = this.statuses.find(s => s.name === this.newCourse.status);
      
      const courseRequest = this.courseChangeService.createRequestDTO(
        this.newCourse,
        this.newCourse.sectionId || undefined,
        selectedStatus?.id || 1
      );
      
      this.courseChangeService.createCourse(courseRequest).subscribe({
        next: (newCourse) => {
          console.log('New course created successfully:', newCourse);
          this.save.emit(newCourse);
          this.isAddingNew = false;
          this.resetNewCourse();
          this.refresh.emit();
        },
        error: (error) => {
          console.error('Error creating new course:', error);
          alert('Error al crear el curso. Por favor, inténtelo de nuevo.');
        }
      });
    }
  }

  private resetNewCourse(): void {
    this.newCourse = {
      code: '',
      name: '',
      credits: 0,
      description: '',
      status: 'Active',
      sectionId: null
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

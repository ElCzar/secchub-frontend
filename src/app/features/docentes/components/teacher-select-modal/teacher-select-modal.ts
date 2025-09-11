import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Docente } from '../../models/docente.model';
import { ConfirmationTeachers } from '../confirmation-teachers/confirmation-teachers';
import { SelectedTeachers } from '../../../planificacion/services/selected-teachers';

@Component({
  selector: 'app-teacher-select-modal',
  imports: [CommonModule, FormsModule, ConfirmationTeachers],
  templateUrl: './teacher-select-modal.html',
  styleUrls: ['./teacher-select-modal.scss']
})
export class TeacherSelectModal {
  @Input() docente: Docente | null = null;
  @Input() showModal: boolean = false;
  @Input() classKey: string = '';
  @Input() classInfo: any = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() docenteSelected = new EventEmitter<Docente>();
  @Output() showConfirmation = new EventEmitter<Docente>();

  nuevaObservacion: string = '';
  showConfirmationModal: boolean = false;
  selectedDocentes: Docente[] = [];

  constructor(private readonly router: Router, private readonly selectedTeachersService: SelectedTeachers) {}

  get hasClasses(): boolean {
    return !!(this.docente?.classes && this.docente.classes.length > 0);
  }

  get hasObservaciones(): boolean {
    return !!(this.docente?.observaciones && this.docente.observaciones.length > 0);
  }

  get clases() {
    return this.docente?.classes || [];
  }

  get observaciones() {
    return this.docente?.observaciones || [];
  }

  closeModal() {
    this.modalClosed.emit();
  }

  selectDocente() {
    if (this.docente) {
      this.showConfirmationModal = true;
      this.selectedDocentes = [this.docente];
    }
  }

  onConfirmationClosed() {
    this.showConfirmationModal = false;
  }

  onCancelSelection() {
    this.showConfirmationModal = false;
  }

  onAddAnotherTeacher() {
    this.showConfirmationModal = false;
    this.closeModal();
    // Emit event to parent to show docentes page again
    this.showConfirmation.emit(this.docente!);
  }

  onContinueToPlanning(teachers?: Docente[]) {
    this.showConfirmationModal = false;
    
    // Usar los docentes del parámetro o los del estado interno
    const docentesToSave = teachers || this.selectedDocentes;
    
    // Guardamos los docentes seleccionados en el servicio
    if (docentesToSave.length > 0) {
      // Usar el classKey proporcionado o crear uno temporal
      const key = this.classKey || `temp-class-${Date.now()}`;
      console.log('Guardando docentes:', docentesToSave, 'con key:', key);
      
      // Incluir el rowIndex en la información de clase
      const classInfoWithIndex = {
        ...this.classInfo,
        rowIndex: this.classInfo?.rowIndex
      };
      
      this.selectedTeachersService.addSelectedTeachers(key, docentesToSave, classInfoWithIndex);
      
      // Navegamos a la página de planificación
      this.router.navigate(['/planificacion']);
    }
    
    this.closeModal();
  }

  agregarObservacion() {
    if (this.nuevaObservacion.trim() && this.docente) {
      this.docente.observaciones ??= [];
      this.docente.observaciones.push(this.nuevaObservacion.trim());
      this.nuevaObservacion = '';
    }
  }

  eliminarObservacion(index: number) {
    if (this.docente?.observaciones) {
      this.docente.observaciones.splice(index, 1);
    }
  }
}
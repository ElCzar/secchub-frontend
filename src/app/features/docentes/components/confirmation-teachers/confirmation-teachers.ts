import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Docente } from '../../models/docente.model';

@Component({
  selector: 'app-confirmation-teachers',
  imports: [CommonModule],
  templateUrl: './confirmation-teachers.html',
  styleUrls: ['./confirmation-teachers.scss']
})
export class ConfirmationTeachers {
  @Input() showModal: boolean = false;
  @Input() selectedDocentes: Docente[] = [];
  @Output() modalClosed = new EventEmitter<void>();
  @Output() cancelSelection = new EventEmitter<void>();
  @Output() addAnotherTeacher = new EventEmitter<void>();
  @Output() continueToPlanning = new EventEmitter<Docente[]>();

  get docenteNames(): string {
    return this.selectedDocentes.map(d => d.name).join(', ');
  }

  closeModal() {
    this.modalClosed.emit();
  }

  onCancel() {
    this.cancelSelection.emit();
    this.closeModal();
  }

  onAddAnother() {
    this.addAnotherTeacher.emit();
    this.closeModal();
  }

  onContinue() {
    this.continueToPlanning.emit(this.selectedDocentes);
    this.closeModal();
  }
}

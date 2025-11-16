import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Docente } from '../../models/docente.model';

@Component({
  selector: 'app-hour-limit',
  imports: [CommonModule],
  templateUrl: './hour-limit.html',
  styleUrl: './hour-limit.scss'
})
export class HourLimit {
  @Input() showModal: boolean = false;
  @Input() docente: Docente | null = null;
  @Input() currentHours: number = 0;
  @Input() contractualLimit: number = 40; // Horas contractuales por defecto
  @Input() additionalHours: number = 0;
  
  @Output() modalClosed = new EventEmitter<void>();
  @Output() assignmentCanceled = new EventEmitter<void>();
  @Output() assignmentConfirmed = new EventEmitter<void>();

  get teacherName(): string {
    return this.docente?.name || 'Profesor';
  }

  get excessHours(): number {
    return this.currentHours - this.contractualLimit;
  }

  closeModal() {
    this.modalClosed.emit();
  }

  onCancel() {
    this.assignmentCanceled.emit();
    this.closeModal();
  }

  onConfirm() {
    this.assignmentConfirmed.emit();
    this.closeModal();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Docente } from '../../models/docente.model';

@Component({
  selector: 'app-hour-limit-warning',
  imports: [CommonModule],
  templateUrl: './hour-limit-warning.html',
  styleUrls: ['./hour-limit-warning.scss']
})
export class HourLimitWarning {
  @Input() showModal: boolean = false;
  @Input() docente: Docente | null = null;
  @Input() workHoursToAssign: number = 4; // Horas que se van a asignar
  @Output() modalClosed = new EventEmitter<void>();
  @Output() confirmAssignment = new EventEmitter<void>();
  @Output() cancelAssignment = new EventEmitter<void>();

  get warningLevel(): 'warning' | 'danger' | 'info' {
    if (!this.docente) return 'info';
    
    const availableHours = this.docente.availableHours || 0;
    
    if (availableHours <= 0) return 'danger';
    if (availableHours <= 4) return 'warning';
    return 'info';
  }

  get warningMessage(): string {
    if (!this.docente) return '';
    
    const maxHours = this.docente.maxHours || 0;
    const totalHours = this.docente.assignedHours || 0;
    const availableHours = this.docente.availableHours || 0;
    
    switch (this.warningLevel) {
      case 'danger':
        return `¡ADVERTENCIA! El profesor ${this.docente.name} ya ha alcanzado o superado su límite de horas. 
                Horas máximas: ${maxHours}, Horas asignadas: ${totalHours}, 
                Horas disponibles: ${availableHours}. 
                Ten en cuenta que al asignar horarios específicos en Class Schedule, 
                este profesor podría exceder su capacidad.`;
      
      case 'warning':
        return `ATENCIÓN: El profesor ${this.docente.name} tiene pocas horas disponibles. 
                Horas máximas: ${maxHours}, Horas asignadas: ${totalHours}, 
                Horas disponibles: ${availableHours}. 
                Considera esto al momento de asignar horarios específicos en Class Schedule.`;
      
      default:
        return `El profesor ${this.docente.name} tiene suficientes horas disponibles. 
                Horas máximas: ${maxHours}, Horas asignadas: ${totalHours}, 
                Horas disponibles: ${availableHours}. 
                Podrás asignar horarios específicos en Class Schedule.`;
    }
  }

  get warningIcon(): string {
    switch (this.warningLevel) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  }

  get confirmButtonText(): string {
    switch (this.warningLevel) {
      case 'danger': return 'Asignar profesor de todas formas';
      case 'warning': return 'Continuar con asignación';
      default: return 'Confirmar asignación';
    }
  }

  closeModal() {
    this.modalClosed.emit();
  }

  onConfirm() {
    this.confirmAssignment.emit();
    this.closeModal();
  }

  onCancel() {
    this.cancelAssignment.emit();
    this.closeModal();
  }
}

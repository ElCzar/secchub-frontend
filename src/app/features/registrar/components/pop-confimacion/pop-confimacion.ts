import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RegistrationResult {
  success: boolean;
  message: string;
  details?: string;
}

@Component({
  selector: 'app-pop-confimacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-confimacion.html',
  styleUrl: './pop-confimacion.scss'
})
export class PopConfimacion {
  
  @Input() isVisible: boolean = false;
  @Input() result: RegistrationResult | null = null;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() retryRegistration = new EventEmitter<void>();

  constructor() {}

  onClose(): void {
    this.closeModal.emit();
  }

  onRetry(): void {
    this.retryRegistration.emit();
  }

  // Detectar clics en el backdrop para cerrar el modal
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  // Prevenir que los clics dentro del modal cierren el popup
  onModalClick(event: Event): void {
    event.stopPropagation();
  }
}

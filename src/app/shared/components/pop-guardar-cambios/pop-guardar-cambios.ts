import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pop-guardar-cambios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-guardar-cambios.html',
  styleUrl: './pop-guardar-cambios.scss'
})
export class PopGuardarCambios {
  @Input() visible = false;
  @Input() isSuccess = true; // true para éxito, false para error
  @Input() successMessage = 'Cambios guardados correctamente';
  @Input() errorMessage = 'No se pudieron guardar los cambios. Inténtelo nuevamente.';
  @Input() okText = 'Aceptar';
  @Input() retryText = 'Intentar otra vez';
  @Output() closed = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  onClose() {
    this.closed.emit();
  }

  onRetry() {
    this.retry.emit();
  }

  get currentTitle() {
    return this.isSuccess ? 'Guardado exitoso' : 'Error al guardar';
  }

  get currentMessage() {
    return this.isSuccess ? this.successMessage : this.errorMessage;
  }
}

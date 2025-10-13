import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pop-enviar-cambios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-enviar-cambios.html',
  styleUrl: './pop-enviar-cambios.scss'
})
export class PopEnviarCambios {
  @Input() visible = false;
  @Input() title = '¿Seguro deseas enviar cambios al administrador?';
  @Input() message = 'Una vez enviados, los cambios serán revisados por el administrador y no podrás editarlos hasta recibir una respuesta.';
  @Input() confirmText = 'Sí, enviar';
  @Input() cancelText = 'Cancelar';
  @Input() cambiosCount = 0;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  get dynamicMessage() {
    if (this.cambiosCount > 0) {
      return `${this.message}\n\nSe enviarán ${this.cambiosCount} cambio${this.cambiosCount > 1 ? 's' : ''} al administrador.`;
    }
    return this.message;
  }
}

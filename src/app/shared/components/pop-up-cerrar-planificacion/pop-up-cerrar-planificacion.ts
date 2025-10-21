import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pop-up-cerrar-planificacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-up-cerrar-planificacion.html',
  styleUrl: './pop-up-cerrar-planificacion.scss'
})
export class PopUpCerrarPlanificacion {
  @Input() visible = false;
  @Input() title = 'Cerrar Planificación';
  @Input() confirmText = 'Sí, cerrar';
  @Input() cancelText = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}

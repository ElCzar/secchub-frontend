import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pop-eliminar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-eliminar.html',
  styleUrl: './pop-eliminar.scss'
})
export class PopEliminar {
  @Input() visible = false;
  @Input() title = '¿Estás seguro de que deseas eliminar al monitor?';
  @Input() monitorNombre = '';
  @Input() monitorApellido = '';
  @Input() message = 'Esta acción no se puede deshacer. El monitor será eliminado permanentemente del sistema.';
  @Input() confirmText = 'Sí, eliminar';
  @Input() cancelText = 'Cancelar';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  get fullName() {
    if (this.monitorNombre && this.monitorApellido) {
      return `${this.monitorNombre} ${this.monitorApellido}`;
    }
    return '';
  }

  get dynamicTitle() {
    if (this.fullName) {
      return `¿Estás seguro de que deseas eliminar al monitor ${this.fullName}?`;
    }
    return this.title;
  }
}

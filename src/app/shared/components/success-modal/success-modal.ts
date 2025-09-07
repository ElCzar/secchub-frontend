import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-modal.html',
  styleUrls: ['./success-modal.scss']
})
export class SuccessModal {
  @Input() visible = false;
  @Input() title = 'Envío exitoso';
  @Input() message = '';
  @Input() okText = 'Aceptar';
  @Output() closed = new EventEmitter<void>();

  onClose() {
    this.closed.emit();
  }

  backdropClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains('overlay')) {
      this.onClose();
    }
  }
}

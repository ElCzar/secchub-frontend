import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.html',
  styleUrls: ['./error-modal.scss']
})
export class ErrorModal {
  @Input() visible = false;
  @Input() title = 'Error';
  @Input() message = '';
  @Input() okText = 'Aceptar';
  @Output() closed = new EventEmitter<void>();

  onClose() {
    this.closed.emit();
  }
}

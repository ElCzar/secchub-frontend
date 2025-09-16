import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pop-message',
  imports: [CommonModule, FormsModule],
  templateUrl: './pop-message.html',
  styleUrl: './pop-message.scss'
})
export class PopMessage {
  @Input() visible: boolean = false;
  @Input() title: string = 'Dejar Mensaje';
  @Input() placeholder: string = 'Escribe tu mensaje aquí...';
  @Input() maxLength: number = 500;
  
  @Output() close = new EventEmitter<void>();
  @Output() messageChange = new EventEmitter<string>();
  
  message: string = '';

  onClose() {
    this.visible = false;
    this.message = '';
    this.close.emit();
  }

  onMessageChange() {
    this.messageChange.emit(this.message);
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-send-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-send-popup.component.html',
  styleUrls: ['./confirm-send-popup.component.scss']
})
export class ConfirmSendPopupComponent {
  @Input() visible = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onDecline() {
    this.decline.emit();
  }
}

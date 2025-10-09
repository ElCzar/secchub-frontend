import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-monitor-row-actions',
  imports: [],
  templateUrl: './monitor-row-actions.html',
  styleUrl: './monitor-row-actions.scss'
})
export class MonitorRowActions {
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onEdit() {
    this.edit.emit();
  }

  onDelete() {
    this.delete.emit();
  }

}


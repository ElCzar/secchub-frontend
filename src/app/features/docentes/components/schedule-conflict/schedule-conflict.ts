import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule-conflict',
  imports: [CommonModule],
  templateUrl: './schedule-conflict.html',
  styleUrl: './schedule-conflict.scss'
})
export class ScheduleConflict {
  @Input() showModal: boolean = false;
  @Input() teacherName: string = '';
  @Input() conflictSchedule: string = '';
  @Input() conflictSubject: string = '';
  @Input() newSchedule: string = '';
  @Input() newSubject: string = '';

  @Output() modalClosed = new EventEmitter<void>();
  @Output() assignDifferentTeacher = new EventEmitter<void>();

  closeModal() {
    this.modalClosed.emit();
  }

  onAssignDifferentTeacher() {
    this.assignDifferentTeacher.emit();
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}

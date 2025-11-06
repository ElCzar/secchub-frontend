import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherClassWithDates } from '../../models/teacher-dates.model';
import { TeacherDatesService } from '../../services/teacher-dates.service';

@Component({
  selector: 'app-teacher-dates-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dates-tooltip.component.html',
  styleUrls: ['./teacher-dates-tooltip.component.scss']
})
export class TeacherDatesTooltipComponent {
  @Input() teacherClass: TeacherClassWithDates | null = null;
  @Input() isVisible: boolean = false;
  @Input() position: { x: number; y: number } = { x: 0, y: 0 };
  @Output() editDatesClicked = new EventEmitter<void>();

  constructor(private readonly teacherDatesService: TeacherDatesService) {}

  get hasDateAssigned(): boolean {
    return !!(this.teacherClass?.startDate && this.teacherClass?.endDate);
  }

  get teacherName(): string {
    if (!this.teacherClass) return '';
    return `${this.teacherClass.teacherName || ''} ${this.teacherClass.teacherLastName || ''}`.trim();
  }

  formatDate(dateString: string): string {
    return this.teacherDatesService.formatDate(dateString);
  }

  onEditDatesClick(event: Event) {
    event.stopPropagation();
    this.editDatesClicked.emit();
  }
}
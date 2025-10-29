import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherDatePopupData, TeacherDatesRequest } from '../../models/teacher-dates.model';
import { TeacherDatesService } from '../../services/teacher-dates.service';

@Component({
  selector: 'app-teacher-dates-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-dates-modal.component.html',
  styleUrls: ['./teacher-dates-modal.component.scss']
})
export class TeacherDatesModalComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() data: TeacherDatePopupData | null = null;
  @Output() datesSelected = new EventEmitter<TeacherDatesRequest>();
  @Output() modalClosed = new EventEmitter<void>();

  startDate: string = '';
  endDate: string = '';
  error: string = '';

  constructor(private readonly teacherDatesService: TeacherDatesService) {}

  ngOnInit() {
    this.initializeDates();
  }

  ngOnChanges() {
    if (this.isVisible && this.data) {
      this.initializeDates();
    }
  }

  private initializeDates() {
    if (this.data) {
      this.startDate = this.data.currentStartDate || this.data.semesterStartDate;
      this.endDate = this.data.currentEndDate || this.data.semesterEndDate;
    }
    this.error = '';
  }

  onStartDateChange() {
    this.validateDates();
  }

  onEndDateChange() {
    this.validateDates();
  }

  private validateDates() {
    if (!this.data || !this.startDate || !this.endDate) {
      this.error = '';
      return;
    }

    const isValid = this.teacherDatesService.validateDates(
      this.startDate,
      this.endDate,
      this.data.semesterStartDate,
      this.data.semesterEndDate
    );

    if (!isValid) {
      if (new Date(this.endDate) <= new Date(this.startDate)) {
        this.error = 'La fecha de fin debe ser posterior a la fecha de inicio';
      } else if (new Date(this.startDate) < new Date(this.data.semesterStartDate) || 
                 new Date(this.endDate) > new Date(this.data.semesterEndDate)) {
        this.error = 'Las fechas deben estar dentro del período del semestre';
      } else {
        this.error = 'Las fechas ingresadas no son válidas';
      }
    } else {
      this.error = '';
    }
  }

  onConfirm() {
    if (!this.startDate || !this.endDate) {
      this.error = 'Debe seleccionar ambas fechas';
      return;
    }

    this.validateDates();
    
    if (this.error) {
      return;
    }

    const dates: TeacherDatesRequest = {
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.datesSelected.emit(dates);
  }

  onCancel() {
    this.modalClosed.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  formatDate(dateString: string): string {
    return this.teacherDatesService.formatDate(dateString);
  }
}
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulesTableComponent } from '../../../../shared/components/schedules-table/schedules-table.component';
import { ScheduleRow, newSchedule } from '../../../programas/models/schedule.models';

interface AvailableSchedule extends ScheduleRow {
  sourceProgram?: string;
  sourceMateria?: string;
  selected?: boolean;
}

@Component({
  selector: 'app-combine-popup',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule, SchedulesTableComponent],
  templateUrl: './combine-popup.component.html',
  styleUrls: ['./combine-popup.component.scss']
})
export class CombinePopupComponent implements OnChanges {
  @Input() visible = false;
  @Input() items: Array<any> = [];
  @Output() combine = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  // Editable cupos (sum by default)
  combinedCupos = 0;
  // All available schedules from the items being combined
  availableSchedules: AvailableSchedule[] = [];
  // Selected schedules that will be used in the combined request
  selectedSchedules: ScheduleRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.items && this.items.length) {
      this.combinedCupos = this.items.reduce((s, it) => s + (it.cupos || 0), 0);
      
      // Collect all schedules from all items being combined
      this.availableSchedules = [];
      this.items.forEach(item => {
        if (Array.isArray(item.schedules) && item.schedules.length > 0) {
          item.schedules.forEach((schedule: any) => {
            this.availableSchedules.push({
              ...schedule,
              sourceProgram: item.program,
              sourceMateria: item.materia,
              selected: false
            });
          });
        }
      });

      // If no schedules available, add a new empty schedule
      if (this.availableSchedules.length === 0) {
        this.selectedSchedules = [newSchedule()];
      } else {
        // Pre-select the first schedule as default
        if (this.availableSchedules.length > 0) {
          this.availableSchedules[0].selected = true;
          this.updateSelectedSchedules();
        }
      }
    }
    
    if (!this.items || this.items.length === 0) {
      this.combinedCupos = 0;
      this.availableSchedules = [];
      this.selectedSchedules = [newSchedule()];
    }
  }

  // Update selected schedules based on user selection
  updateSelectedSchedules(): void {
    this.selectedSchedules = this.availableSchedules
      .filter(schedule => schedule.selected)
      .map(schedule => ({
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        disability: schedule.disability,
        modality: schedule.modality,
        roomType: schedule.roomType
      }));

    // Ensure at least one schedule exists
    if (this.selectedSchedules.length === 0) {
      this.selectedSchedules = [newSchedule()];
    }
  }

  // Toggle schedule selection
  toggleScheduleSelection(index: number): void {
    if (this.availableSchedules[index]) {
      this.availableSchedules[index].selected = !this.availableSchedules[index].selected;
      this.updateSelectedSchedules();
    }
  }

  confirm(): void {
    const payload = {
      programs: this.items.map(i => i.program),
      materias: this.items.map(i => i.materia),
      cupos: this.combinedCupos,
      sourceIds: this.items.map(i => i.id),
      schedules: this.selectedSchedules
    };
    this.combine.emit(payload);
  }

  close(): void {
    this.closed.emit();
  }

  onSchedulesChange(rows: ScheduleRow[]) {
    this.selectedSchedules = rows;
  }
}

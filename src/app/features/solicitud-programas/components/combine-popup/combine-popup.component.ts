import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulesTableComponent } from '../../../../shared/components/schedules-table/schedules-table.component';
import { ScheduleRow, newSchedule } from '../../../programas/models/schedule.models';

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
  // Editable schedules - popup will show an editable schedules table
  schedules: ScheduleRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.items && this.items.length) {
      this.combinedCupos = this.items.reduce((s, it) => s + (it.cupos || 0), 0);
      // Initialize schedules: if first item has schedules, clone them; otherwise add an empty row
      const firstWithSchedules = this.items.find(i => Array.isArray(i.schedules) && i.schedules.length > 0);
      if (firstWithSchedules) {
        // deep copy to avoid mutating original inputs
        this.schedules = JSON.parse(JSON.stringify(firstWithSchedules.schedules));
      } else {
        this.schedules = [newSchedule()];
      }
    }
    if (!this.items || this.items.length === 0) {
      this.combinedCupos = 0;
      this.schedules = [newSchedule()];
    }
  }

  confirm(): void {
    const payload = {
      programs: this.items.map(i => i.program),
      materias: this.items.map(i => i.materia),
      cupos: this.combinedCupos,
      sourceIds: this.items.map(i => i.id),
      schedules: this.schedules
    };
    this.combine.emit(payload);
  }

  close(): void {
    this.closed.emit();
  }

  onSchedulesChange(rows: ScheduleRow[]) {
    this.schedules = rows;
  }
}

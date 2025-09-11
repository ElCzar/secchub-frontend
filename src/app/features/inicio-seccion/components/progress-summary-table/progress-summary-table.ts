import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ProgressStatus } from '../../models/section-dashboard.models';

@Component({
  selector: 'app-progress-summary-table',
  imports: [CommonModule],
  templateUrl: './progress-summary-table.html',
  styleUrls: ['./progress-summary-table.scss']
})
export class ProgressSummaryTable {
  data = input.required<ProgressStatus>();

}


import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { TaskStatusSummary } from '../../models/section-dashboard.models';

@Component({
  selector: 'app-task-status-card',
  imports: [CommonModule],
  templateUrl: './task-status-card.html',
  styleUrls: ['./task-status-card.scss']
})
export class TaskStatusCard {
  data = input.required<TaskStatusSummary>();

}



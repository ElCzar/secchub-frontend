import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SystemStatusSummary } from '../../models/dashboard.models';

@Component({
  selector: 'app-system-status-card',
  imports: [CommonModule],
  templateUrl: './system-status-card.html',
  styleUrls: ['./system-status-card.scss']
})
export class SystemStatusCard {
  @Input() data!: SystemStatusSummary;
}



import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogEntry } from '../../pages/log-auditoria-page/log-auditoria-page';

@Component({
  selector: 'app-log-auditoria-table',
  imports: [CommonModule],
  templateUrl: './log-auditoria-table.html',
  styleUrl: './log-auditoria-table.scss'
})
export class LogAuditoriaTable {
  @Input() logEntries: LogEntry[] = [];
  @Input() loading = false;
  @Output() refresh = new EventEmitter<void>();
}

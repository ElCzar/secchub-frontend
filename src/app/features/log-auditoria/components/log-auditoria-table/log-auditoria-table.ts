import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogResponseDTO } from '../../../../shared/model/dto/log/AuditLogResponseDTO.model';

@Component({
  selector: 'app-log-auditoria-table',
  imports: [CommonModule],
  templateUrl: './log-auditoria-table.html',
  styleUrl: './log-auditoria-table.scss'
})
export class LogAuditoriaTable {
  @Input() logEntries: AuditLogResponseDTO[] = [];
  @Input() loading = false;
  @Input() currentPage = 0;
  @Input() totalEntries = 0;
  @Input() hasMorePages = true;
  @Output() refresh = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  getFormattedDate(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  }

  getFormattedTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    this.pageChange.emit(this.currentPage + 1);
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 0;
  }

  get canGoNext(): boolean {
    return this.hasMorePages;
  }
}

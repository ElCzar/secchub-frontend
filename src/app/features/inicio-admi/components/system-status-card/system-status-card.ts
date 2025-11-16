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

  isAllSectionsCompleted(): boolean {
    if (!this.data?.activePlannings) return false;
    return this.data.activePlannings.completedSections === this.data.activePlannings.totalSections;
  }

  getCompletionPercentage(): number {
    if (!this.data?.activePlannings || this.data.activePlannings.totalSections === 0) return 0;
    return Math.round((this.data.activePlannings.completedSections / this.data.activePlannings.totalSections) * 100);
  }

  formatDeadline(deadline: string): string {
    if (!deadline) return 'No definido';
    
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const formattedDate = date.toLocaleDateString('es-ES', options);
    
    if (diffDays < 0) {
      return `${formattedDate} (Vencido)`;
    } else if (diffDays === 0) {
      return `${formattedDate} (Hoy)`;
    } else if (diffDays === 1) {
      return `${formattedDate} (Mañana)`;
    } else if (diffDays <= 7) {
      return `${formattedDate} (En ${diffDays} días)`;
    } else {
      return formattedDate;
    }
  }

  isDeadlineNear(deadline: string): boolean {
    if (!deadline) return false;
    
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7 && diffDays >= 0;
  }

  isDeadlinePassed(deadline: string): boolean {
    if (!deadline) return false;
    
    const date = new Date(deadline);
    const now = new Date();
    
    return date.getTime() < now.getTime();
  }

  getDeadlineStatus(deadline: string): string {
    if (!deadline) return 'No definido';
    
    if (this.isDeadlinePassed(deadline)) {
      return '❌ Vencido';
    } else if (this.isDeadlineNear(deadline)) {
      return '⚠ Próximo';
    } else {
      return '✅ A tiempo';
    }
  }
}



import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActionsSummary, ActionRow } from '../../models/dashboard.models';

@Component({
  selector: 'app-action-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-summary-card.html',
  styleUrl: './action-summary-card.scss'
})
export class ActionSummaryCard {
  @Input() data!: ActionsSummary;

  private MAX_VISIBLE_ITEMS = 5;

  constructor(private readonly router: Router) {}

  /**
   * Get the rows to display (limited to first 5)
   */
  get visibleRows(): ActionRow[] {
    if (!this.data?.rows) return [];
    return this.data.rows.slice(0, this.MAX_VISIBLE_ITEMS);
  }

  /**
   * Check if there are more items than the visible limit
   */
  get hasMoreItems(): boolean {
    return this.data?.rows?.length > this.MAX_VISIBLE_ITEMS;
  }

  /**
   * Get count of remaining items
   */
  get remainingItemsCount(): number {
    if (!this.data?.rows) return 0;
    return Math.max(0, this.data.rows.length - this.MAX_VISIBLE_ITEMS);
  }

  /**
   * Set to see all actions
   */
  viewAllActions(): void {
    this.MAX_VISIBLE_ITEMS = Infinity;
  }

  /**
   * Get display title based on action type
   */
  getActionTitle(type: ActionRow['type']): string {
    const titles: Record<ActionRow['type'], string> = {
      'CLASSROOM_SCHEDULE': 'Conflicto de Horario en Aula',
      'TEACHER_SCHEDULE': 'Conflicto de Horario de Docente',
      'TEACHING_ASSISTANT_SCHEDULE': 'Conflicto de Horario de Monitor',
      'MISSING_TEACHER': 'Clase Sin Docente Asignado',
      'MISSING_CLASSROOM': 'Clase Sin Aula Asignada'
    };
    return titles[type];
  }

  /**
   * Get icon based on action type
   */
  getActionIcon(row: ActionRow): string {
    if (row.isConflict) {
      return '⚠️';
    }
    return '📋';
  }

  /**
   * Get CSS class for badge styling based on type
   */
  getActionClass(row: ActionRow): string {
    if (row.isConflict) {
      return 'action-hero--conflict';
    }
    return 'action-hero--missing';
  }

  /**
   * Navigate to appropriate page based on action type
   */
  handleActionClick(row: ActionRow): void {
    if (row.type === 'TEACHING_ASSISTANT_SCHEDULE') {
      this.router.navigate(['/solicitud-monitores']);
    } else {
      this.router.navigate(['/planificacion']);
    }
  }

  /**
   * Get route label for display
   */
  getRouteLabel(row: ActionRow): string {
    if (row.type === 'TEACHING_ASSISTANT_SCHEDULE') {
      return 'Ir a Monitores';
    }
    return 'Ir a Planificación';
  }
}

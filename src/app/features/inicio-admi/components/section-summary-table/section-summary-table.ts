import { CommonModule, NgClass } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SectionRow, SectionsSummary } from '../../models/dashboard.models';

@Component({
  selector: 'app-section-summary-table',
  imports: [CommonModule, NgClass],
  templateUrl: './section-summary-table.html',
  styleUrls: ['./section-summary-table.scss']
})
export class SectionSummaryTable {
  private router = inject(Router);
  @Input() data!: SectionsSummary;

  onView(row: SectionRow) {
    // Navegar a la pantalla de planificación del jefe de sección
    this.router.navigate(['/inicio-seccion']);
  }

  onEnter(row: SectionRow) {
    // Navegar a la pantalla de planificación del jefe de sección
    this.router.navigate(['/inicio-seccion']);
  }

}

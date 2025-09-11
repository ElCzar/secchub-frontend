import { CommonModule, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SectionRow, SectionsSummary } from '../../models/dashboard.models';

@Component({
  selector: 'app-section-summary-table',
  imports: [CommonModule, NgClass],
  templateUrl: './section-summary-table.html',
  styleUrls: ['./section-summary-table.scss']
})
export class SectionSummaryTable {
  @Input() data!: SectionsSummary;

  onView(row: SectionRow) {
    // Navegación según tu app (puedes inyectar Router si prefieres):
    window.location.href = `/sections/${row.sectionCode}`;
  }

  onEnter(row: SectionRow) {
    window.location.href = `/sections/${row.sectionCode}/edit`;
  }

}

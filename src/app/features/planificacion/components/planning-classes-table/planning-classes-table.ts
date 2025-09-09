import { Component, EventEmitter, Input, Output, output } from '@angular/core';
import { PlanningRow } from '../../models/planificacion.models';

@Component({
  selector: 'app-planning-classes-table',
  imports: [],
  templateUrl: './planning-classes-table.html',
  styleUrl: './planning-classes-table.scss'
})
export class PlanningClassesTable {
  @Input() rows: PlanningRow[] = [];

  @Output() patchRow = new EventEmitter<{ index: number; data: Partial<PlanningRow> }>();
  @Output() addRow = new EventEmitter<void>();
  @Output() removeRow = new EventEmitter<number>();

}

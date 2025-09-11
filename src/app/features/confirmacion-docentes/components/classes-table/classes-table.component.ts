import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TeacherClassRow } from '../../models/class.models';

@Component({
  selector: 'app-classes-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classes-table.component.html',
  styleUrls: ['./classes-table.component.scss'],
})
export class ClassesTableComponent {
  @Input() rows: TeacherClassRow[] = [];
  @Input() selectable = false;                   // muestra u oculta columna “Seleccionar”
  @Input() selectedIds = new Set<string>();      // ids seleccionados (solo cuando selectable=true)

  @Output() selectedIdsChange = new EventEmitter<Set<string>>();

  isChecked(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggle(id: string): void {
    if (!this.selectable) return;
    const copy = new Set(this.selectedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    this.selectedIds = copy;
    this.selectedIdsChange.emit(copy);
  }

  trackById(_: number, r: TeacherClassRow) { return r.id; }
}


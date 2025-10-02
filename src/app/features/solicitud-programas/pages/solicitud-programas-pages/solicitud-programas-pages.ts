import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { CombinePopupComponent } from '../../components/combine-popup/combine-popup.component';
import { SchedulesTableComponent } from '../../../../shared/components/schedules-table/schedules-table.component';
import { newSchedule, ScheduleRow } from '../../../programas/models/schedule.models';
import { SolicitudProgramasService, SolicitudDto } from '../../services/solicitud-programas.service';

type RowState = 'new' | 'existing' | 'deleted';

interface SolicitudRow {
  id: string | number;
  program: string;
  materia: string;
  cupos: number;
  startDate: string;
  endDate: string;
  comments?: string;
  comentarios?: string;
  selected?: boolean;
  _state?: RowState;
  schedules?: ScheduleRow[];
}

interface CombinedRequest {
  id: string | number;
  programs: string[];
  materias: string[];
  cupos: number;
  startDate?: string;
  endDate?: string;
  sourceIds: Array<string | number>;
  editable?: boolean;
}

@Component({
  selector: 'app-solicitud-programas-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, AccesosRapidosSeccion, CombinePopupComponent, SchedulesTableComponent],
  templateUrl: './solicitud-programas-pages.html',
  styleUrls: ['./solicitud-programas-pages.scss']
})
export class SolicitudProgramasPages implements OnInit {
  rows: SolicitudRow[] = [];
  combined: CombinedRequest[] = [];

  // Popup control
  combinePopupVisible = false;
  selectedForCombine: SolicitudRow[] = [];

  searchQuery = '';

  get filteredRows(): SolicitudRow[] {
    const q = this.searchQuery?.trim().toLowerCase();
    if (!q) return this.rows.filter(r => r._state !== 'deleted');
    return this.rows.filter(r => r._state !== 'deleted' && (
      (r.program || '').toString().toLowerCase().includes(q) ||
      (r.materia || '').toString().toLowerCase().includes(q) ||
      (r.comments || r.comentarios || '').toString().toLowerCase().includes(q)
    ));
  }

  get allSelected(): boolean {
    const visible = this.filteredRows;
    if (!visible.length) return false;
    return visible.every(r => r.selected === true);
  }

  constructor(private readonly service: SolicitudProgramasService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  private loadRequests(): void {
    this.service.getRequestsForSection().subscribe((list: SolicitudDto[]) => {
      this.rows = list.map((r: SolicitudDto) => ({
        ...r,
        selected: false,
        _state: 'existing',
        // copy comments if the backend uses either naming
        comments: (r as any).comments || (r as any).comentarios,
        comentarios: (r as any).comentarios || (r as any).comments,
        // ensure schedules property exists for display
        schedules: r.schedules?.length ? r.schedules : [newSchedule()]
      }));
    });
  }

  toggleSelectAll(): void {
    const visible = this.filteredRows;
    const someSelected = visible.every(r => r.selected);
    visible.forEach(r => r.selected = !someSelected);
  }

  canCombine(): boolean {
    return this.rows.filter(r => r.selected && r._state !== 'deleted').length >= 2;
  }

  combineRequests(): void {
    this.selectedForCombine = this.rows.filter(r => r.selected && r._state !== 'deleted');
    if (this.selectedForCombine.length < 2) return;
    this.combinePopupVisible = true;
  }

  onCombineConfirmed(payload: { programs: string[]; materias: string[]; cupos: number; sourceIds: Array<string | number> }) {
    // Hide popup
    this.combinePopupVisible = false;

    const combined: CombinedRequest = {
      id: 'c-' + Date.now(),
      programs: payload.programs,
      materias: payload.materias,
      cupos: payload.cupos,
      sourceIds: payload.sourceIds,
      startDate: undefined,
      endDate: undefined,
      editable: false
    };

    // Mark source rows as deleted/merged
    for (const sid of payload.sourceIds) {
      const r = this.rows.find(x => x.id === sid);
      if (r) r._state = 'deleted';
    }

    this.combined.push(combined);
    // clear selection
    this.rows.forEach(r => r.selected = false);
  }

  cancelCombine(): void {
    this.combinePopupVisible = false;
  }

  removeRow(index: number): void {
    const row = this.rows[index];
    if (!row) return;
    if (row._state === 'new') {
      this.rows.splice(index, 1);
    } else {
      this.rows[index]._state = 'deleted';
    }
  }

  undoCombination(index: number): void {
    const combo = this.combined[index];
    if (!combo) return;
    // restore source rows
    for (const sid of combo.sourceIds) {
      const r = this.rows.find(x => x.id === sid);
      if (r) r._state = 'existing';
    }
    this.combined.splice(index, 1);
  }

  editCombinedToggle(index: number): void {
    const c = this.combined[index];
    if (!c) return;
    c.editable = !c.editable;
  }

  applyChanges(): void {
    // Prepare payload: original non-deleted rows + combined entries
    const individual = this.rows.filter(r => r._state !== 'deleted');
    const payload = {
      individual,
      combined: this.combined
    };

    this.service.applyRequests(payload).subscribe({
      next: () => alert('Solicitudes aplicadas correctamente.'),
      error: () => alert('Error al aplicar solicitudes.')
    });
  }

  isFormValid(): boolean {
    // Basic validation: at least one individual or combined
    return this.rows.some(r => r._state !== 'deleted') || this.combined.length > 0;
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseOption, ProgramasService } from '../../services/programas.service';

/** Row mínima para este paso (luego añadimos cupos/fechas/… ) */
export interface ClaseRowView {
  courseId: string;
  courseName: string;
  section: string;
  seats: number;        
  startDate: string;    
  endDate: string;      
  weeks: number;       
  _state: 'new' | 'existing' | 'deleted';
}


@Component({
  selector: 'app-classes-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classes-table.component.html',
  styleUrls: ['./classes-table.component.scss'],
})

export class ClassesTableComponent {

  @Input() rows: ClaseRowView[] = [];

  /** Eventos hacia la page */
  @Output() add    = new EventEmitter<void>();
  @Output() remove = new EventEmitter<number>();
  @Output() patch  = new EventEmitter<{ index: number; data: Partial<ClaseRowView> }>();

  /** Sugerencias por fila (autocomplete) */
  suggestions: CourseOption[][] = [];
  showList: boolean[] = [];

  constructor(private api: ProgramasService) {}

  // Abre búsqueda al escribir en ID o Nombre
  onSearch(i: number, term: string) {
    const q = term?.trim();
    if (!q) {
      this.suggestions[i] = [];
      this.showList[i] = false;
      return;
    }
    this.api.searchCourses(q).subscribe(list => {
      this.suggestions[i] = list;
      this.showList[i] = list.length > 0;
    });
  }

  // Seleccionar una materia de las sugerencias
  selectCourse(i: number, opt: CourseOption) {
    this.showList[i] = false;
    this.suggestions[i] = [];

    // setea ID y Nombre
    this.patch.emit({ index: i, data: { courseId: opt.id, courseName: opt.name } });

    // pide sección por defecto y setea
    this.api.getDefaultSection(opt.id).subscribe(sec => {
      this.patch.emit({ index: i, data: { section: sec ?? '' } });
    });
  }

  // close al salir de foco
  closeList(i: number) {
    setTimeout(() => (this.showList[i] = false), 120); // pequeño delay para permitir click
  }


  changeSeats(i: number, delta: number) {
  const r = this.rows[i];
  if (!r) return;
  const next = Math.max(0, (r.seats ?? 0) + delta);
  this.patch.emit({ index: i, data: { seats: next } });
}

onSeatsInput(i: number, value: string) {
  const n = Math.max(0, Number(value) || 0);
  this.patch.emit({ index: i, data: { seats: n } });
}

onStartChange(i: number, value: string) {
  this.patch.emit({ index: i, data: { startDate: value } });
  this.recalcWeeks(i, value, this.rows[i].endDate);
}

onEndChange(i: number, value: string) {
  this.patch.emit({ index: i, data: { endDate: value } });
  this.recalcWeeks(i, this.rows[i].startDate, value);
}

private recalcWeeks(i: number, start?: string, end?: string) {
  if (!start || !end) {
    this.patch.emit({ index: i, data: { weeks: 0 } });
    return;
  }
  const d1 = new Date(start);
  const d2 = new Date(end);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) {
    this.patch.emit({ index: i, data: { weeks: 0 } });
    return;
  }
  // semanas aproximadas: ceil(diferencia días / 7)
  const diffMs = d2.getTime() - d1.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  const weeks = Math.ceil(days / 7);
  this.patch.emit({ index: i, data: { weeks } });
}

}
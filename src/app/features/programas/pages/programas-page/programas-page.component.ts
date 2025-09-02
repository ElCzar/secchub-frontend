import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProgramaContextDto } from '../../models/context.models';
import { ProgramaRowDto, ProgramasService } from '../../services/programas.service';
import { HeaderComponent } from '../../../../layouts/header/header.component';



type RowState = 'new' | 'existing' | 'deleted';

interface ClaseRow extends ProgramaRowDto {
  _state: RowState;
}

@Component({
  selector: 'app-programas-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './programas-page.component.html',
  styleUrls: ['./programas-page.component.scss'],
})
export class ProgramasPageComponent implements OnInit {

  // Contexto general del backend (id carrera, carrera, semestre…)
  context$!: Observable<ProgramaContextDto>;

  // Filas locales (se cargan desde el backend y se manipulan en el front)
  rows: ClaseRow[] = [];

  constructor(private programas: ProgramasService) {}

  ngOnInit(): void {
    this.context$ = this.programas.getContext();
  }

  /** Contador calculado siempre en el front */
  get totalCount(): number {
    return this.rows.filter(r => r._state !== 'deleted').length;
  }

  /** Cargar clases del semestre anterior */
  loadPrevious(): void {
    this.programas.getPreviousSemesterClasses().subscribe({
      next: (list: ProgramaRowDto[]) => {
        this.rows = list.map(r => ({ ...r, _state: 'existing' }));
      },
      error: (e) => {
        console.error('Error al cargar semestre anterior', e);
        // TODO: mostrar mensaje de error en UI (toast/snackbar)
      }
    });
  }

  /** Agregar fila manualmente */
  addRow(): void {
    this.rows.push(this.emptyRow());
  }

  /** Quitar fila */
  removeRow(index: number): void {
    const row = this.rows[index];
    if (!row) return;

    if (row._state === 'new') {
      // Si la fila es nueva y no existe en backend, se borra de una
      this.rows.splice(index, 1);
    } else {
      // Si viene del backend, se marca como eliminada
      this.rows[index]._state = 'deleted';
    }
  }

  /** Plantilla de fila vacía */
  private emptyRow(): ClaseRow {
    return {
      courseId: '',
      courseName: '',
      section: '',
      roomType: '',
      seats: 0,
      startDate: '',
      endDate: '',
      weeks: 0,
      _state: 'new',
    };
  }
}

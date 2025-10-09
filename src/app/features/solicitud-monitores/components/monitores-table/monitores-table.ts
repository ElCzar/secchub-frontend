import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Monitor } from '../../models/monitor.model';
import { HorariosMonitores } from '../horarios-monitores/horarios-monitores';
import { MonitorRowActions } from '../monitor-row-actions/monitor-row-actions';

@Component({
  selector: 'app-monitores-table',
  imports: [CommonModule, FormsModule, HorariosMonitores, MonitorRowActions],
  templateUrl: './monitores-table.html',
  styleUrl: './monitores-table.scss'
})
export class MonitoresTable {
  @Input() monitores: Monitor[] = [];
  @Output() update = new EventEmitter<Monitor[]>();

  toggleSelection(monitor: Monitor) {
    monitor.seleccionado = !monitor.seleccionado;
    this.update.emit(this.monitores);
  }

  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.monitores.forEach(monitor => {
      monitor.seleccionado = isChecked;
    });
    this.update.emit(this.monitores);
  }

  editMonitor(index: number) {
    // Aquí puedes agregar lógica de edición si la necesitas
    console.log('Editando monitor:', index);
  }

  deleteMonitor(index: number) {
    this.monitores.splice(index, 1);
    this.update.emit(this.monitores);
  }

  calcularTotal(m: Monitor) {
    m.totalHoras = m.horasSemanales * m.semanas;
  }

}


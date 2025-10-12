import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Monitor } from '../../models/monitor.model';
import { HorariosMonitores } from '../horarios-monitores/horarios-monitores';

@Component({
  selector: 'app-monitores-table',
  imports: [CommonModule, FormsModule, HorariosMonitores],
  templateUrl: './monitores-table.html',
  styleUrl: './monitores-table.scss'
})
export class MonitoresTable {
  @Input() monitores: Monitor[] = [];
  @Output() update = new EventEmitter<Monitor[]>();

  // Acciones de aprobar/rechazar
  aceptarMonitor(monitor: Monitor) {
    // Si ya estaba aceptado, volver a pendiente (restablecer)
    monitor.estado = monitor.estado === 'aceptado' ? 'pendiente' : 'aceptado';
    this.update.emit(this.monitores);
  }

  rechazarMonitor(monitor: Monitor) {
    // Si ya estaba rechazado, volver a pendiente (restablecer)
    monitor.estado = monitor.estado === 'rechazado' ? 'pendiente' : 'rechazado';
    this.update.emit(this.monitores);
  }

  // Acciones de edición/eliminación removidas para esta pantalla

  calcularTotal(m: Monitor) {
    m.totalHoras = m.horasSemanales * m.semanas;
  }

}


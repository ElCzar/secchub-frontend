import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Monitor } from '../../models/monitor.model';
import { HorariosMonitores } from '../horarios-monitores/horarios-monitores';
import { PopEliminar } from '../pop-eliminar/pop-eliminar';

@Component({
  selector: 'app-monitores-table',
  imports: [CommonModule, FormsModule, HorariosMonitores, PopEliminar],
  templateUrl: './monitores-table.html',
  styleUrl: './monitores-table.scss'
})
export class MonitoresTable {
  @Input() monitores: Monitor[] = [];
  @Output() update = new EventEmitter<Monitor[]>();
  // Configuración visual para reutilizar el mismo componente en ambos casos
  @Input() adminMode = false; // oculta profesor, noClase, asignatura, nota; muestra sección académica
  @Input() showMonitorAdministrativo = true; // mostrar/ocultar columna "Monitor Administrativo"

  // Popup de eliminar
  showDeleteModal = false;
  monitorToDelete: Monitor | null = null;

  // Acción de eliminar monitor (para admin)
  eliminarMonitor(monitor: Monitor) {
    this.monitorToDelete = monitor;
    this.showDeleteModal = true;
  }

  // Acciones de aprobar/rechazar (para jefes de sección - mantenidas por compatibilidad)
  aceptarMonitor(monitor: Monitor) {
    // Si ya estaba aceptado, volver a pendiente (restablecer)
    monitor.estado = monitor.estado === 'aceptado' ? 'pendiente' : 'aceptado';
  }

  rechazarMonitor(monitor: Monitor) {
    // Si ya estaba rechazado, volver a pendiente (restablecer)
    monitor.estado = monitor.estado === 'rechazado' ? 'pendiente' : 'rechazado';
  }

  // Acciones de edición/eliminación removidas para esta pantalla

  calcularTotal(m: Monitor) {
    m.totalHoras = m.horasSemanales * m.semanas;
  }

  // Calcula el colspan correcto del expander/horarios según las columnas visibles
  getColspan(): number {
    let count = 0;
    // comunes al inicio
    count += 7; // Acciones, ID, Nombre, Apellido, Carrera, Semestre, Promedio
    // bloque central segun modo
    if (this.adminMode) {
      count += 1; // Sección Académica
    } else {
      count += 4; // Profesor, No. Clase, Asignatura, Nota
    }
    // comunes al final
    count += 5; // Horas, Semanas, Total Horas, Correo, ANTIGUO
    if (this.showMonitorAdministrativo) count += 1; // Monitor Administrativo (si aplica)
    return count;
  }

  // Métodos para el popup de eliminar
  onConfirmDelete() {
    if (this.monitorToDelete) {
      const index = this.monitores.findIndex(m => m.id === this.monitorToDelete!.id);
      if (index !== -1) {
        this.monitores.splice(index, 1);
        this.update.emit(this.monitores);
      }
    }
    this.showDeleteModal = false;
    this.monitorToDelete = null;
  }

  onCancelDelete() {
    this.showDeleteModal = false;
    this.monitorToDelete = null;
  }
}


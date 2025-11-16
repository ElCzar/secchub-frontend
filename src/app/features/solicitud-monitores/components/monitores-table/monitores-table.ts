import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Monitor } from '../../model/monitor.model';
import { HorariosMonitores } from '../horarios-monitores/horarios-monitores';
import { ClassResponseDTO } from '../../../../shared/model/dto/planning/ClassResponseDTO.model';

@Component({
  selector: 'app-monitores-table',
  imports: [CommonModule, FormsModule, HorariosMonitores],
  templateUrl: './monitores-table.html',
  styleUrl: './monitores-table.scss'
})
export class MonitoresTable implements OnChanges {
  @Input() monitores: Monitor[] = [];
  @Input() classes: ClassResponseDTO[] = [];
  @Output() update = new EventEmitter<Monitor[]>();
  // Configuración visual para reutilizar el mismo componente en ambos casos
  @Input() adminMode = false; // oculta profesor, noClase, asignatura, nota; muestra sección académica
  @Input() showMonitorAdministrativo = true; // mostrar/ocultar columna "Monitor Administrativo"

  ngOnChanges(changes: SimpleChanges): void {
    // Calculate weekly hours for all monitors when they are loaded or changed
    if (changes['monitores'] && this.monitores) {
      for (const monitor of this.monitores) {
        this.calculateWeeklyHoursFromSchedules(monitor);
      }
    }
  }

  // Acciones de aprobar/rechazar
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
    m.totalHoras = (m.horasSemanales || 0) * (m.semanas || 0);
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

  // Filter classes by course ID for the dropdown
  getClassesByCourse(courseId: number | undefined): ClassResponseDTO[] {
    if (!courseId) {
      console.log('No courseId provided');
      return [];
    }
    const filtered = this.classes.filter(c => c.courseId === courseId);
    console.log(`CourseId: ${courseId}, Total classes: ${this.classes.length}, Filtered: ${filtered.length}`, filtered);
    return filtered;
  }

  // Calculate weekly hours from schedule total hours
  private calculateWeeklyHoursFromSchedules(monitor: Monitor) {
    const totalScheduleHours = (monitor.horarios || [])
      .reduce((sum, horario) => sum + (horario.totalHoras || 0), 0);
    
    monitor.horasSemanales = Math.round(totalScheduleHours * 100) / 100;
    this.calcularTotal(monitor);
  }

  // Calculate weekly hours from schedule total hours when schedules change
  onHorariosChange(monitor: Monitor) {
    this.calculateWeeklyHoursFromSchedules(monitor);
  }

}


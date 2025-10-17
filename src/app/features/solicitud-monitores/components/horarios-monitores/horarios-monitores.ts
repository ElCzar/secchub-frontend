import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioMonitor } from '../../model/horario-monitor.model';

@Component({
  selector: 'app-horarios-monitores',
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios-monitores.html',
  styleUrl: './horarios-monitores.scss'
})
export class HorariosMonitores implements OnInit {

  @Input() horarios: HorarioMonitor[] = [];

  ngOnInit() {
    // Ensure there's always at least one empty row
    this.ensureEmptyRow();
  }

  days = [
    { v: 'Lunes', t: 'Lunes' },
    { v: 'Martes', t: 'Martes' },
    { v: 'Miércoles', t: 'Miércoles' },
    { v: 'Jueves', t: 'Jueves' },
    { v: 'Viernes', t: 'Viernes' },
    { v: 'Sábado', t: 'Sábado' }
  ];

  trackByFn(index: number, item: HorarioMonitor): any {
    return index;
  }

  addHorario() {
    this.horarios.push({
      dia: '', horaInicio: '', horaFinal: '', totalHoras: 0,
      id: 0
    });
  }

  deleteHorario(index: number) {
    this.horarios.splice(index, 1);
    // Ensure there's always at least one empty row
    this.ensureEmptyRow();
  }

  /**
   * Ensures there's at least one empty row when no rows exist
   */
  private ensureEmptyRow() {
    // Only add an empty row if there are no rows at all
    if (this.horarios.length === 0) {
      this.addHorario();
    }
  }



  calculateTotalHours(horario: HorarioMonitor) {
    if (horario.horaInicio && horario.horaFinal) {
      const inicio = this.timeStringToMinutes(horario.horaInicio);
      const fin = this.timeStringToMinutes(horario.horaFinal);
      
      if (fin > inicio) {
        const totalMinutes = fin - inicio;
        horario.totalHoras = Math.round((totalMinutes / 60) * 100) / 100; // Redondear a 2 decimales
      } else {
        horario.totalHoras = 0;
      }
    } else {
      horario.totalHoras = 0;
    }
  }

  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(num => Number.parseInt(num));
    return hours * 60 + minutes;
  }

}
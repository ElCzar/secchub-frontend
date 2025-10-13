import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioMonitor } from '../../models/horario-monitor.model';

@Component({
  selector: 'app-horarios-monitores',
  imports: [CommonModule, FormsModule],
  templateUrl: './horarios-monitores.html',
  styleUrl: './horarios-monitores.scss'
})
export class HorariosMonitores {

  @Input() horarios: HorarioMonitor[] = [];

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
    this.horarios.push({ dia: '', horaInicio: '', horaFinal: '', totalHoras: 0 });
  }

  deleteHorario(index: number) {
    this.horarios.splice(index, 1);
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
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
    return hours * 60 + minutes;
  }

}
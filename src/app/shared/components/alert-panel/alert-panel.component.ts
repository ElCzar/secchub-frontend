import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AlertPanelService, AlertPanelData } from '../../../core/services/alert-panel.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="alerts$ | async as alerts" class="alert-panel-box">
      <div class="alert-panel-title">Resumen de alertas y tareas pendientes</div>
      <ul class="alert-list">
        <li *ngIf="alerts.missingRooms > 0" class="alert-list-item alert-danger">
          <span class="alert-icon">❗</span>
          {{ alerts.missingRooms }} {{ alerts.missingRooms === 1 ? 'Clase' : 'Clases' }} sin salón asignado
        </li>
        <li *ngIf="alerts.missingTeachers > 0" class="alert-list-item alert-normal">
          <span class="alert-icon">🚩</span>
          {{ alerts.missingTeachers }} {{ alerts.missingTeachers === 1 ? 'Clase' : 'Clases' }} sin docente asignado
        </li>
        <li *ngIf="alerts.scheduleConflicts > 0" class="alert-list-item alert-warning">
          <span class="alert-icon">⚠️</span>
          Conflicto de horario en {{ alerts.scheduleConflicts }} clase(s)
        </li>
        <li *ngIf="alerts.pendingConfirmations > 0" class="alert-list-item alert-info">
          <span class="alert-icon">🕑</span>
          {{ alerts.pendingConfirmations }} {{ alerts.pendingConfirmations === 1 ? 'Docente' : 'Docentes' }} sin confirmar disponibilidad
            (<span class="ver-detalles" (click)="verDetalles()">ver detalles</span>)
        </li>
        <li class="alert-list-item alert-date">
          <span class="alert-icon">📅</span>
          Fecha límite de cierre de planificación: <strong>&nbsp;{{ fechaCierre }} </strong> &nbsp; (Faltan {{ alerts.daysLeft }} días)
        </li>
      </ul>
      <div class="alert-panel-actions">
        <button class="btn btn--secondary btn--small">Ver más</button>
      </div>
    </div>
  `,
  styles: [
    `.alert-panel-box { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .alert-panel-title { font-size: 1.15rem; font-weight: 600; color: #c41d1d; margin-bottom: 1rem; }
    .alert-list { list-style: none; padding: 0; margin: 0 0 1rem 0; }
    .alert-list-item { display: flex; align-items: center; font-size: 1rem; margin-bottom: 0.5rem; }
    .alert-icon { font-size: 1.2rem; margin-right: 0.5rem; }
    .alert-danger,
    .alert-warning,
    .alert-info,
    .alert-date,
    .alert-normal {
      color: #222;
    }
    .alert-panel-title { color: #c41d1d; }
    .alert-panel-actions { text-align: right; }
      .btn--secondary { background: #1890ff; color: #fff; border: none; border-radius: 4px; padding: 0.3rem 1rem; font-size: 0.95rem; cursor: pointer; }
      .btn--secondary:hover { background: #40a9ff; }
      .ver-detalles {
        color: #0a6bc7ff;
        cursor: pointer;
        margin-left: 0.5em;
        text-decoration: underline;
        font-weight: 500;
      }
      .ver-detalles:hover {
        color: #40a9ff;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertPanelComponent {
  alerts$: Observable<AlertPanelData | null>;
  fechaCierre: string = '';

  constructor(private alertPanelService: AlertPanelService, private router: Router) {
    this.alerts$ = this.alertPanelService.alerts$;
    this.alerts$.subscribe(alerts => {
      if (alerts) {
        if ((alerts as any).endDate) {
          this.fechaCierre = this.formatFechaCierre((alerts as any).endDate);
        } else {
          this.fechaCierre = '';
        }
      }
    });
  }

  verDetalles() {
    this.router.navigate(['/planificacion']);
  }

  formatFechaCierre(fecha: string): string {
    // Formatea la fecha a 'DD de mes' en español
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dateObj = new Date(fecha);
    const dia = dateObj.getDate();
    const mes = meses[dateObj.getMonth()];
    return `${dia} de ${mes}`;
  }
}

import { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AlertPanelService, AlertPanelData, DynamicTeacherResponseAlert } from '../../../core/services/alert-panel.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="alerts$ | async as alerts" class="alert-panel-box">
      <div class="alert-panel-title">Resumen de alertas y tareas pendientes</div>
      <ul class="alert-list">
        <ng-container *ngFor="let alert of visibleAlerts; let i = index">
          <li *ngIf="alert.type === 'static' && alert.class.includes('alert-date')" class="alert-list-item alert-black" [ngClass]="alert.class">
            <span class="alert-icon">{{ alert.icon }}</span>
            <span class="alert-text" [innerHTML]="alert.text"></span>
          </li>
          <li *ngIf="alert.type === 'static' && !alert.class.includes('alert-date')" class="alert-list-item alert-black" [ngClass]="alert.class">
            <span class="alert-icon">{{ alert.icon }}</span>
            <span class="alert-text" [innerHTML]="alert.text"></span>
          </li>
          <li *ngIf="alert.type === 'dynamic'" class="alert-list-item alert-black" [ngClass]="{'alert-success': alert.data.type === 'accepted', 'alert-danger': alert.data.type === 'rejected'}">
            <span class="alert-icon">
              <ng-container *ngIf="alert.data.type === 'accepted'; else rejectedIcon">
                ✅
              </ng-container>
              <ng-template #rejectedIcon>
                ❌
              </ng-template>
            </span>
            <span class="alert-text" [innerHTML]="alert.data.message"></span>
            <span class="alert-spacer"></span>
            <button class="btn btn--close-green" (click)="dismissDynamicAlert(alert.data.id)" title="Cerrar alerta">
              <span class="close-red-box">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="18" height="18" rx="6" fill="rgba(220, 38, 38, 0.18)"/>
                  <path d="M7 7l8 8M15 7l-8 8" stroke="#c41d1d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </li>
        </ng-container>
      </ul>

      <div class="alert-panel-actions" style="margin-top: 1.5rem;">
  <button class="btn btn--secondary btn--small" *ngIf="showVerMas && !verMasActivo" (click)="verMasAlertas()">Ver más</button>
  <button class="btn btn--secondary btn--small" *ngIf="showVerMas && verMasActivo" (click)="verMenosAlertas()">Ver menos</button>
      </div>
    </div>
  `,
  styles: [
    `.alert-panel-box { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .close-red-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border-radius: 6px;
      height: 22px;
      width: 22px;
    }
    .alert-panel-title { font-size: 1.15rem; font-weight: 600; color: #c41d1d; margin-bottom: 1rem; }
    .alert-list { list-style: none; padding: 0; margin: 0 0 1rem 0; }
    .alert-list-item {
      display: flex;
      align-items: flex-start;
      font-size: 1rem;
      margin-bottom: 0;
      padding-bottom: 0.85rem;
      padding-top: 0.85rem;
      color: #222;
      position: relative;
      background: none;
      border-bottom: 1px solid #e5e5e5;
      min-height: 28px;
    }
    .alert-list-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .alert-list-item:first-child {
      padding-top: 0;
    }
    .alert-icon {
      font-size: 1.2rem;
      margin-right: 0.7rem;
      flex-shrink: 0;
    }
    .alert-text {
      margin-left: 0.1rem;
      display: inline-block;
      flex: 1;
      line-height: 1.5;
    }
    .alert-black { color: #222 !important; background: none !important; }
    .alert-success, .alert-danger, .alert-warning, .alert-info, .alert-date, .alert-normal {
      color: #222;
      background: none !important;
    }
    .alert-spacer { flex: 1; }
    .btn--close-green { background: none; border: none; margin-left: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: flex-end; padding: 0; }
    .close-green-box { display: flex; align-items: center; justify-content: center; background: transparent; border-radius: 6px; }
    .btn--close-green:hover .close-green-box rect { fill: #b2e6c7; }
    .btn--close-green:active .close-green-box rect { fill: #1a7f37; }
    .alert-panel-title { color: #c41d1d; }
    .alert-panel-actions { text-align: right; }
    .btn--secondary { background: #1890ff; color: #fff; border: none; border-radius: 4px; padding: 0.3rem 1rem; font-size: 0.95rem; cursor: pointer; }
    .btn--secondary:hover { background: #40a9ff; }
    a.ver-detalles {
      color: #0a6bc7;
      cursor: pointer;
      margin-left: 0.5em;
      text-decoration: underline;
      font-weight: 500;
      background: none;
      border: none;
    }
    a.ver-detalles:hover {
      color: #40a9ff;
    }
    :host ::ng-deep .ver-detalles {
      color: #1976d2 !important;
      cursor: pointer;
      text-decoration: underline;
    }
    :host ::ng-deep .ver-detalles:hover {
      color: #40a9ff !important;
    }
    .alert-list-item .btn--close-green {
      margin-left: auto;
      margin-right: 0.2rem;
      position: relative;
      right: 0;
    }
    .alert-list { margin-bottom: 0; }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertPanelComponent implements OnInit {
  ngOnInit(): void {
    // Forzar recarga instantánea de alertas estáticas al cargar el panel
    this.alertPanelService.updateAlerts();
  }
  alerts$: Observable<AlertPanelData | null>;
  dynamicAlerts$: Observable<DynamicTeacherResponseAlert[]>;
  visibleAlerts: any[] = [];
  allAlerts: any[] = [];
  showVerMas = false;
  verMasActivo = false;
  fechaCierre: string = '';
  private maxVisible = 5;

  constructor(private alertPanelService: AlertPanelService, private router: Router) {
    this.alerts$ = this.alertPanelService.alerts$;
    this.dynamicAlerts$ = this.alertPanelService.dynamicAlerts$;
    this.alerts$.subscribe(alerts => {
      this.updateAlerts(alerts, this.allAlerts.filter(a => a.type === 'dynamic').map(a => a.data));
    });
    this.dynamicAlerts$.subscribe(alerts => {
      this.updateAlerts(null, alerts || []);
    });
    // Delegar el click en el span.ver-detalles aunque esté en innerHTML
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        document.addEventListener('click', (event: any) => {
          if (event.target && event.target.classList && event.target.classList.contains('ver-detalles')) {
            event.preventDefault();
            this.verDetalles();
          }
        });
      }, 0);
    }
  }


  updateAlerts(alerts: AlertPanelData | null, dynamicAlerts: DynamicTeacherResponseAlert[]) {
    // Construye lista de alertas estáticas
    const staticAlerts: any[] = [];
    if (alerts) {
      if ((alerts as any).endDate) {
        this.fechaCierre = this.formatFechaCierre((alerts as any).endDate);
      } else {
        this.fechaCierre = '';
      }
      if (alerts.missingRooms > 0) {
        staticAlerts.push({ type: 'static', icon: '❗', text: `${alerts.missingRooms} ${alerts.missingRooms === 1 ? 'Clase' : 'Clases'} sin salón asignado (<span class='ver-detalles'>ver detalles</span>)`, class: 'alert-danger alert-black' });
      }
      if (alerts.missingTeachers > 0) {
        staticAlerts.push({ type: 'static', icon: '🚩', text: `${alerts.missingTeachers} ${alerts.missingTeachers === 1 ? 'Clase' : 'Clases'} sin docente asignado (<span class='ver-detalles'>ver detalles</span>)`, class: 'alert-normal alert-black' });
      }
      
      // Agregar alertas detalladas de conflictos de planificación
      if (alerts.scheduleConflictDetails && alerts.scheduleConflictDetails.length > 0) {
        alerts.scheduleConflictDetails.forEach((conflict: any) => {
          if (conflict.type === 'teacher') {
            // Conflicto de docente
            const numClases = conflict.conflictingClasses.length;
            const firstClass = conflict.conflictingClasses[0];
            const daySpanish = this.translateDay(firstClass.day);
            
            // Calcular el intervalo de conflicto (intersección de horarios)
            const conflictInterval = this.calculateConflictInterval(conflict.conflictingClasses);
            
            // Construir lista de clases con sus horarios individuales
            const classList = conflict.conflictingClasses
              .map((c: any) => `<br>&nbsp;&nbsp;&nbsp;&nbsp;- ${c.className} (${this.formatTime(c.startTime)} a ${this.formatTime(c.endTime)})`)
              .join('');
            
            staticAlerts.push({ 
              type: 'static', 
              icon: '👨‍🏫', 
              text: `Docente <b>${conflict.resourceName}</b> tiene ${numClases} clases simultáneas el ${daySpanish} de ${conflictInterval.start} a ${conflictInterval.end} (<span class='ver-detalles'>ver detalles</span>)${classList}`, 
              class: 'alert-warning alert-black' 
            });
          } else if (conflict.type === 'classroom') {
            // Conflicto de salón
            const numClases = conflict.conflictingClasses.length;
            const firstClass = conflict.conflictingClasses[0];
            const daySpanish = this.translateDay(firstClass.day);
            
            // Calcular el intervalo de conflicto (intersección de horarios)
            const conflictInterval = this.calculateConflictInterval(conflict.conflictingClasses);
            
            // Construir lista de clases con sus horarios individuales
            const classList = conflict.conflictingClasses
              .map((c: any) => `<br>&nbsp;&nbsp;&nbsp;&nbsp;- ${c.className} (${this.formatTime(c.startTime)} a ${this.formatTime(c.endTime)})`)
              .join('');
            
            staticAlerts.push({ 
              type: 'static', 
              icon: '🏫', 
              text: `Salón <b>${conflict.resourceName}</b> tiene ${numClases} clases simultáneas el ${daySpanish} de ${conflictInterval.start} a ${conflictInterval.end} (<span class='ver-detalles'>ver detalles</span>)${classList}`, 
              class: 'alert-warning alert-black' 
            });
          }
        });
      } else if (alerts.scheduleConflicts > 0) {
        // Fallback: si no hay detalles pero sí hay conflictos, mostrar alerta genérica
        staticAlerts.push({ type: 'static', icon: '⚠️', text: `Conflicto de horario en ${alerts.scheduleConflicts} clase(s)`, class: 'alert-warning alert-black' });
      }
      
      if (alerts.pendingConfirmations > 0) {
        staticAlerts.push({ type: 'static', icon: '🕑', text: `${alerts.pendingConfirmations} ${alerts.pendingConfirmations === 1 ? 'Docente' : 'Docentes'} sin confirmar disponibilidad (<span class='ver-detalles'>ver detalles</span>)`, class: 'alert-info alert-black' });
      }
      staticAlerts.push({ type: 'static', icon: '📅', text: `Fecha límite de cierre de planificación: <strong>&nbsp;${this.fechaCierre} </strong> &nbsp; (Faltan ${alerts.daysLeft} días)`, class: 'alert-date alert-black' });
    }
    // Dinámicas
    const dynamicAlertObjs = (dynamicAlerts || []).map(a => ({ type: 'dynamic', data: a }));
    this.allAlerts = [...staticAlerts, ...dynamicAlertObjs];
    if (this.verMasActivo) {
      this.visibleAlerts = this.allAlerts;
    } else {
      this.visibleAlerts = this.allAlerts.slice(0, this.maxVisible);
    }
    this.showVerMas = this.allAlerts.length > this.maxVisible;
  }

  verMasAlertas() {
  this.visibleAlerts = this.allAlerts;
  this.verMasActivo = true;
  }

  dismissDynamicAlert(id: string) {
    this.alertPanelService.dismissDynamicAlert(id);
    // Actualiza la lista visible después de cerrar
    this.allAlerts = this.allAlerts.filter(a => !(a.type === 'dynamic' && a.data.id === id));
    if (this.verMasActivo) {
      this.visibleAlerts = this.allAlerts;
    } else {
      this.visibleAlerts = this.allAlerts.slice(0, this.maxVisible);
    }
    if (this.allAlerts.length > this.maxVisible) {
      this.showVerMas = true;
    } else {
      this.showVerMas = false;
    }
  }

  verMenosAlertas() {
    this.visibleAlerts = this.allAlerts.slice(0, this.maxVisible);
    this.verMasActivo = false;
  }

  verDetalles() {
    this.router.navigate(['/planificacion']);
  }

  translateDay(day: string): string {
    const daysMap: { [key: string]: string } = {
      'Monday': 'lunes',
      'Tuesday': 'martes',
      'Wednesday': 'miércoles',
      'Thursday': 'jueves',
      'Friday': 'viernes',
      'Saturday': 'sábado',
      'Sunday': 'domingo'
    };
    return daysMap[day] || day;
  }

  formatTime(time: string): string {
    // Convierte "10:00:00" a "10:00"
    if (!time) return '';
    return time.substring(0, 5);
  }

  calculateConflictInterval(classes: any[]): { start: string; end: string } {
    // Calcula la intersección de horarios para encontrar el intervalo exacto del conflicto
    // El conflicto empieza en el máximo de los startTime y termina en el mínimo de los endTime
    
    let maxStart = classes[0].startTime;
    let minEnd = classes[0].endTime;
    
    classes.forEach((c: any) => {
      if (c.startTime > maxStart) {
        maxStart = c.startTime;
      }
      if (c.endTime < minEnd) {
        minEnd = c.endTime;
      }
    });
    
    return {
      start: this.formatTime(maxStart),
      end: this.formatTime(minEnd)
    };
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

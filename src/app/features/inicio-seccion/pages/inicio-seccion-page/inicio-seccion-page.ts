import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SectionDashboardService } from '../../services/section-dashboard.service';
import { TaskStatusCard } from '../../components/task-status-card/task-status-card';
import { ProgressSummaryTable } from '../../components/progress-summary-table/progress-summary-table';
import { ProgressStatus, TaskStatusSummary } from '../../models/section-dashboard.models';
import { map, Observable } from 'rxjs';
import { AccesosRapidosSeccion } from "../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion";
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { PopUpCerrarPlanificacion } from "../../../../shared/components/pop-up-cerrar-planificacion/pop-up-cerrar-planificacion";
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio-seccion-page',
  imports: [CommonModule, TaskStatusCard, ProgressSummaryTable, AccesosRapidosSeccion, SidebarToggleButtonComponent, HeaderComponent, PopUpCerrarPlanificacion],
  templateUrl: './inicio-seccion-page.html',
  styleUrls: ['./inicio-seccion-page.scss']
})
export class InicioSeccionPage implements OnInit {
  private readonly sectionDashboardService = inject(SectionDashboardService);
  private readonly router = inject(Router);

  taskStatus$!: Observable<TaskStatusSummary>;
  progressStatus$!: Observable<ProgressStatus>;
  
  // Control del popup
  mostrarPopupCerrar = false;

  ngOnInit(): void {
    this.taskStatus$ = this.sectionDashboardService.getSectionDashboard().pipe(map(res => res.taskStatus));
    this.progressStatus$ = this.sectionDashboardService.getSectionDashboard().pipe(map(res => res.progressStatus));
  }

  cerrarPlanificacion(): void {
    this.mostrarPopupCerrar = true;
  }

  confirmarCierrePlanificacion(): void {
    this.mostrarPopupCerrar = false;
    this.sectionDashboardService.closeSectionPlanning().subscribe({
      next: () => {
        console.log('Planificación cerrada con éxito.');
        this.router.navigate(['/inicio-seccion-deshabilitada']);
      },
      error: (err) => {
        console.error('Error al cerrar la planificación:', err);
      }
    });
  }

  cancelarCierrePlanificacion(): void {
    this.mostrarPopupCerrar = false;
  }

}
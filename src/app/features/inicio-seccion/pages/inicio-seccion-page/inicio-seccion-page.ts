import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SectionDashboardService } from '../../services/section-dashboard.service';
import { TaskStatusCard } from '../../components/task-status-card/task-status-card';
import { ProgressSummaryTable } from '../../components/progress-summary-table/progress-summary-table';
import { ProgressStatus, TaskStatusSummary } from '../../models/section-dashboard.models';
import { map, Observable } from 'rxjs';
import { AccesosRapidosSeccion } from "../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion";

@Component({
  selector: 'app-inicio-seccion-page',
  imports: [CommonModule, TaskStatusCard, ProgressSummaryTable, AccesosRapidosSeccion],
  templateUrl: './inicio-seccion-page.html',
  styleUrls: ['./inicio-seccion-page.scss']
})
export class InicioSeccionPage {
  private sectionDashboardService = inject(SectionDashboardService);

  taskStatus$!: Observable<TaskStatusSummary>;
  progressStatus$!: Observable<ProgressStatus>;

  ngOnInit(): void {
    this.taskStatus$ = this.sectionDashboardService.getSectionDashboard().pipe(map(res => res.taskStatus));
    this.progressStatus$ = this.sectionDashboardService.getSectionDashboard().pipe(map(res => res.progressStatus));
  }

  cerrarPlanificacion(): void {
    // TODO: Implementar lógica para cerrar planificación
    // Por ahora solo mostramos un alert como simulación
    alert('Funcionalidad de cerrar planificación será implementada próximamente');
    
    // Aquí iría la llamada al backend:
    // this.sectionDashboardService.cerrarPlanificacion().subscribe({
    //   next: () => {
    //     // Mostrar mensaje de éxito y recargar datos
    //     this.ngOnInit();
    //   },
    //   error: (error) => {
    //     // Manejar error
    //     console.error('Error al cerrar planificación:', error);
    //   }
    // });
  }

}

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { SectionsSummary, SystemStatusSummary } from '../../models/dashboard.models';
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { SystemStatusCard } from '../../components/system-status-card/system-status-card';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { AlertPanelComponent } from '../../../../shared/components/alert-panel/alert-panel.component';
import { SectionSummaryTable } from '../../components/section-summary-table/section-summary-table';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-inicio-admi-page',
  imports: [CommonModule, AccesosRapidosAdmi, SidebarToggleButtonComponent, SystemStatusCard, HeaderComponent, AlertPanelComponent, SectionSummaryTable],
  templateUrl: './inicio-admi-page.html',
  styleUrls: ['./inicio-admi-page.scss']
})
export class InicioAdmiPage implements OnInit {
  private dashboardService = inject(DashboardService);

  systemStatus: SystemStatusSummary | null = null;
  sectionsSummary: SectionsSummary = {
    rows: []
  };

  ngOnInit(): void {
    // Datos mock para mostrar la pantalla
    this.systemStatus = {
      activePlannings: { 
        completedSections: 8, 
        totalSections: 10 
      },
      pendingTeachers: 2,
      scheduleConflicts: 1,
      nextDeadline: '2025-08-15'
    };

    // Cargar resumen de secciones desde el backend
    this.dashboardService.getSectionsSummary().subscribe({
      next: (data) => {
        this.sectionsSummary = data;
      },
      error: (err) => {
        console.error('Error al cargar el resumen de secciones:', err);
        // Datos de respaldo en caso de error
        this.sectionsSummary = {
          rows: []
        };
      }
    });
  }
}


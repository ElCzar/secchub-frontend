import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SectionsSummary, SystemStatusSummary } from '../../models/dashboard.models';
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { SystemStatusCard } from '../../components/system-status-card/system-status-card';
import { SectionSummaryTable } from '../../components/section-summary-table/section-summary-table';
import { HeaderComponent } from "../../../../layouts/header/header.component";

@Component({
  selector: 'app-inicio-admi-page',
  imports: [CommonModule, AccesosRapidosAdmi, SidebarToggleButtonComponent, SystemStatusCard, SectionSummaryTable, HeaderComponent],
  templateUrl: './inicio-admi-page.html',
  styleUrls: ['./inicio-admi-page.scss']
})
export class InicioAdmiPage implements OnInit {

  systemStatus: SystemStatusSummary | null = null;
  sectionsSummary: SectionsSummary | null = null;

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

    this.sectionsSummary = {
      rows: [
        {
          sectionCode: 'Sis-01',
          status: 'CLOSED',
          assignedClasses: 12,
          unconfirmedTeachers: 0
        },
        {
          sectionCode: 'Sis-02',
          status: 'EDITING',
          assignedClasses: 10,
          unconfirmedTeachers: 3
        },
        {
          sectionCode: 'Sis-03',
          status: 'CLOSED',
          assignedClasses: 11,
          unconfirmedTeachers: 0
        },
        {
          sectionCode: 'Sis-04',
          status: 'EDITING',
          assignedClasses: 8,
          unconfirmedTeachers: 2
        }
      ]
    };
  }
}


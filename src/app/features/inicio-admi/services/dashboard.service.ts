import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardResponse, SystemStatusSummary, SectionsSummary } from '../models/dashboard.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<DashboardResponse> {
    const mockData: DashboardResponse = {
      system: this.getMockSystemStatus(),
      sections: this.getMockSectionsSummary()
    };
    return of(mockData);
  }

  getSystemStatus(): Observable<SystemStatusSummary> {
    return of(this.getMockSystemStatus());
  }

  /**
   * Obtiene el resumen de todas las secciones desde el backend
   */
  getSectionsSummary(): Observable<SectionsSummary> {
    const token = localStorage.getItem('accessToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    
    return this.http.get<any[]>(`${environment.apiUrl}/sections/summary`, { headers }).pipe(
      map((sections: any[]) => ({
        rows: sections.map(s => ({
          sectionCode: s.name || s.sectionCode || 'N/A',
          status: s.planningClosed ? 'CLOSED' : 'EDITING',
          assignedClasses: s.assignedClasses || 0,
          unconfirmedTeachers: s.unconfirmedTeachers || 0
        }))
      }))
    );
  }

  private getMockSystemStatus(): SystemStatusSummary {
    return {
      activePlannings: { 
        completedSections: 8, 
        totalSections: 10 
      },
      pendingTeachers: 2,
      scheduleConflicts: 1,
      nextDeadline: '2025-08-15'
    };
  }

  private getMockSectionsSummary(): SectionsSummary {
    return {
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

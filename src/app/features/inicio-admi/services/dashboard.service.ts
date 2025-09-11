import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardResponse, SystemStatusSummary, SectionsSummary } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {

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

  getSectionsSummary(): Observable<SectionsSummary> {
    return of(this.getMockSectionsSummary());
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

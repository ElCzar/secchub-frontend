// src/app/features/inicio-seccion/services/section-dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SectionDashboardResponse } from '../models/section-dashboard.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SectionDashboardService {
  private readonly http = inject(HttpClient);
  private baseUrl = '/api/section-dashboard'; // ajusta a tu URL real
  private readonly sectionCloseUrl = environment.apiUrl + '/sections/close-planning';

  getSectionDashboard(): Observable<SectionDashboardResponse> {
    // Comentando la llamada real al backend por ahora
    // return this.http.get<SectionDashboardResponse>(`${this.baseUrl}`);
    
    // Datos simulados para mostrar la funcionalidad
    const mockData: SectionDashboardResponse = {
      taskStatus: {
        classesWithoutRoom: 2,
        classesWithoutTeacher: 3,
        scheduleConflicts: {
          count: 1,
          details: 'Redes'
        },
        unconfirmedTeachers: {
          count: 3,
          details: 'ver detalles'
        },
        deadline: {
          date: '2024-08-15',
          daysRemaining: 5
        }
      },
      progressStatus: {
        requestsReceived: 'completed',
        roomsAssigned: 'incomplete',
        teachersAssigned: 'incomplete',
        confirmationsSent: 'sent',
        confirmationsReceived: {
          status: 'pending',
          count: 3
        },
        scheduleConflicts: {
          status: 'conflict',
          count: 1
        },
        planningClosed: 'no'
      }
    };

    return of(mockData);
  }

  closeSectionPlanning(): Observable<void> {
    return this.http.post<void>(`${this.sectionCloseUrl}`, {
      observe: 'response'
    });
  }
}

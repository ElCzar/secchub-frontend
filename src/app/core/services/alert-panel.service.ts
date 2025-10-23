import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { PlanningService } from '../../features/planificacion/services/planning.service';

export interface AlertPanelData {
  missingTeachers: number;
  missingRooms: number;
  pendingConfirmations: number;
  scheduleConflicts: number;
  daysLeft: number;
  endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertPanelService {
  private alertsSubject = new BehaviorSubject<AlertPanelData | null>(null);
  public alerts$: Observable<AlertPanelData | null> = this.alertsSubject.asObservable();

  constructor(private planningService: PlanningService) {
    interval(30000)
      .pipe(switchMap(() => this.fetchAlerts()))
      .subscribe((data) => this.alertsSubject.next(data));
    this.fetchAlerts().subscribe((data) => this.alertsSubject.next(data));
  }

  private fetchAlerts(): Observable<AlertPanelData> {
    // Consultar cantidad de clases sin docente y sin salón para la sección del jefe autenticado
    return this.planningService.getMissingTeachersCountForSectionChief().pipe(
      switchMap((missingTeachers: number) =>
        this.planningService.getMissingRoomsCountForSectionChief().pipe(
          switchMap((missingRooms: number) =>
            this.planningService.getDashboardAlerts().pipe(
              map((alerts: AlertPanelData) => ({
                ...alerts,
                missingTeachers,
                missingRooms
              }))
            )
          )
        )
      )
    );
  }
}

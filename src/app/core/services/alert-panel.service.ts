export interface DynamicTeacherResponseAlert {
  id: string; // Un identificador único (por ejemplo, teacherClassId + status)
  message: string;
  type: 'accepted' | 'rejected';
}
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  // Alertas dinámicas de respuestas docentes
  private dynamicAlertsSubject = new BehaviorSubject<DynamicTeacherResponseAlert[]>([]);
  public dynamicAlerts$ = this.dynamicAlertsSubject.asObservable();
  private dismissedAlertIds = new Set<string>(JSON.parse(localStorage.getItem('dismissedDynamicAlertIds') || '[]'));

  private alertsSubject = new BehaviorSubject<AlertPanelData | null>(null);
  public alerts$: Observable<AlertPanelData | null> = this.alertsSubject.asObservable();

  constructor(private planningService: PlanningService) {
    // Polling de respuestas docentes cada 1s
    interval(1000).subscribe(() => {
      console.log('[AlertPanelService] Polling: fetchTeacherResponses');
      this.fetchTeacherResponses();
    });
    console.log('[AlertPanelService] Init: fetchTeacherResponses');
    this.fetchTeacherResponses();
    // Polling de alertas generales cada 1s
    interval(1000).subscribe(() => {
      console.log('[AlertPanelService] Polling: fetchAlerts');
      this.updateAlerts();
    });
    this.updateAlerts();
  }

  // Obtiene y actualiza las alertas dinámicas de respuestas docentes
  private fetchTeacherResponses() {
    this.planningService.getAllClassesWithSchedules().pipe(
      switchMap((classes: any[]) => {
        const classIdToName = new Map<number, string>();
        classes.forEach(cls => {
          if (cls.id && cls.courseName) {
            classIdToName.set(cls.id, cls.courseName);
          }
        });
        const classIds = classes.map(cls => cls.id);
        const requests = classIds.map(classId =>
          this.planningService.http.get<any[]>(`${environment.apiUrl}/teachers/classes/class/${classId}`).pipe(
            catchError(() => of([]))
          )
        );
        return forkJoin(requests).pipe(
          map((responses: any[][]) => ({ responses, classIdToName, classIds }))
        );
      }),
      map(({ responses, classIdToName, classIds }) => {
        const alerts: DynamicTeacherResponseAlert[] = [];
        responses.forEach((teacherClassList: any[], idx: number) => {
          if (!Array.isArray(teacherClassList)) return;
          const classId = classIds[idx];
          const className = classIdToName.get(classId) || classId;
          teacherClassList.forEach((tc: any) => {
            // Solo mostrar alertas si el docente ha aceptado o rechazado
            const isAccepted = tc.statusId === 8 || tc.status === 'ACCEPTED';
            const isRejected = tc.statusId === 9 || tc.status === 'REJECTED';
            if (!isAccepted && !isRejected) return;
            const id = `${tc.teacherId ?? tc.id}-${isAccepted ? '8' : '9'}-${tc.classId ?? idx}`;
            // Si el usuario ya cerró la alerta, no la vuelve a mostrar hasta que cambie el status
            if (this.dismissedAlertIds.has(id)) return;
            const type = isAccepted ? 'accepted' : 'rejected';
            const message = isAccepted
              ? `El docente <b>${tc.teacherName ?? tc.name}</b> aceptó la asignación de la clase <b>${className}</b>.`
              : `El docente <b>${tc.teacherName ?? tc.name}</b> rechazó la asignación de la clase <b>${className}</b>.`;
            alerts.push({ id, message, type });
          });
        });
        return alerts;
      })
    ).subscribe((alerts: DynamicTeacherResponseAlert[] | undefined) => {
      if (alerts) {
        this.dynamicAlertsSubject.next(alerts);
      }
    });
  }

  public updateAlerts() {
    this.fetchAlerts().subscribe({
      next: (data) => {
        console.log('[AlertPanelService] Emite alerts:', data);
        this.alertsSubject.next(data);
      },
      error: (err) => {
        console.error('[AlertPanelService] Error al obtener alerts:', err);
      }
    });
  }

  // Elimina una alerta dinámica (por id)
  dismissDynamicAlert(id: string) {
  this.dismissedAlertIds.add(id);
  localStorage.setItem('dismissedDynamicAlertIds', JSON.stringify(Array.from(this.dismissedAlertIds)));
  const current = this.dynamicAlertsSubject.getValue();
  this.dynamicAlertsSubject.next(current.filter(a => a.id !== id));
  }

  // Llama al endpoint de teacher_class para una clase y statusId (8=aceptado, 9=rechazado)
  private getTeacherClassResponses(classId: number, statusId: number) {
    const token = localStorage.getItem('accessToken');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const url = `${environment.apiUrl}/teachers/classes/class/${classId}`;
    return this.planningService.http.get<any[]>(url, headers).pipe(
      map((teacherClassList: any[]) => teacherClassList.filter(tc => tc.statusId === statusId)),
      catchError(() => of([]))
    );
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

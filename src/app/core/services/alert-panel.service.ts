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

export interface ScheduleConflict {
  type: 'teacher' | 'classroom';
  resourceId: number;
  resourceName: string;
  conflictingClasses: {
    classId: number;
    className: string;
    day: string;
    startTime: string;
    endTime: string;
    section?: number;
    sectionName?: string;
  }[];
}

export interface ClassWithoutResource {
  id: number;
  courseName: string;
  section: number;
  sectionName?: string;
}

export interface PendingConfirmation {
  teacherName: string;
  className: string;
  section: number;
  sectionName?: string;
}

export interface AlertPanelData {
  missingTeachers: number;
  missingRooms: number;
  pendingConfirmations: number;
  scheduleConflicts: number;
  scheduleConflictDetails?: ScheduleConflict[];
  classesWithoutTeacher?: ClassWithoutResource[];
  classesWithoutRoom?: ClassWithoutResource[];
  pendingConfirmationDetails?: PendingConfirmation[];
  daysLeft: number;
  endDate?: string;
  planningStatus?: {
    closedCount: number;
    totalSections: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AlertPanelService {
  // Alertas dinámicas de respuestas docentes
  private dynamicAlertsSubject = new BehaviorSubject<DynamicTeacherResponseAlert[]>([]);
  public dynamicAlerts$ = this.dynamicAlertsSubject.asObservable();
  private dismissedAlertIds = new Set<string>(JSON.parse(localStorage.getItem('dismissedDynamicAlertIds') || '[]'));

  private alertsSubject = new BehaviorSubject<AlertPanelData | null>(null);
  public alerts$: Observable<AlertPanelData | null> = this.alertsSubject.asObservable();
  
  // Guardar el estado de isAdmin para el polling
  private isAdminMode: boolean = false;

  constructor(private planningService: PlanningService) {
    // Polling de respuestas docentes cada 30s
    interval(30000).subscribe(() => {
      this.fetchTeacherResponses();
    });
    this.fetchTeacherResponses();
    // Polling de alertas generales cada 30s
    interval(30000).subscribe(() => {
      this.updateAlerts(this.isAdminMode);
    });
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

  public updateAlerts(isAdmin: boolean = false) {
    // Guardar el modo actual para el polling
    this.isAdminMode = isAdmin;
    this.fetchAlerts(isAdmin).subscribe({
      next: (data) => {
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

  private fetchAlerts(isAdmin: boolean = false): Observable<AlertPanelData> {
    // Si es administrador, usar endpoints globales; si no, usar endpoints de sección
    const missingTeachers$ = isAdmin 
      ? this.planningService.getMissingTeachersCountForAdmin()
      : this.planningService.getMissingTeachersCountForSectionChief();
    
    const missingRooms$ = isAdmin
      ? this.planningService.getMissingRoomsCountForAdmin()
      : this.planningService.getMissingRoomsCountForSectionChief();
    
    const conflicts$ = isAdmin
      ? this.planningService.getScheduleConflictsForAdmin()
      : this.planningService.getScheduleConflicts();
    
    const dashboardAlerts$ = isAdmin
      ? this.planningService.getDashboardAlertsForAdmin()
      : this.planningService.getDashboardAlerts();

    // Si es admin, obtener listas detalladas
    const classesWithoutTeacher$ = isAdmin
      ? this.planningService.getClassesWithoutTeacherForAdmin()
      : of([]);
    
    const classesWithoutRoom$ = isAdmin
      ? this.planningService.getClassesWithoutRoomForAdmin()
      : of([]);
    
    const pendingConfirmations$ = isAdmin
      ? this.planningService.getPendingConfirmationsForAdmin()
      : of([]);
    
    const planningStatus$ = isAdmin
      ? this.planningService.getPlanningStatusStats()
      : of(null);
    
    return forkJoin({
      missingTeachers: missingTeachers$,
      missingRooms: missingRooms$,
      conflicts: conflicts$.pipe(catchError(() => of([]))),
      dashboardAlerts: dashboardAlerts$,
      classesWithoutTeacher: classesWithoutTeacher$,
      classesWithoutRoom: classesWithoutRoom$,
      pendingConfirmations: pendingConfirmations$,
      planningStatus: planningStatus$
    }).pipe(
      switchMap(results => {
        // Enriquecer con nombres de sección si es admin
        if (!isAdmin) {
          return of({
            ...results.dashboardAlerts,
            missingTeachers: results.missingTeachers,
            missingRooms: results.missingRooms,
            scheduleConflictDetails: results.conflicts
          });
        }

        // El backend ya devuelve sectionName, solo necesitamos usar ese campo directamente
        
        // Enriquecer clases sin docente
        const enrichedWithoutTeacher = results.classesWithoutTeacher.map((c: any) => ({
          id: c.id,
          courseName: c.courseName || 'Sin nombre',
          section: c.section,
          sectionName: c.sectionName ? `Sección ${c.sectionName}` : `Sección ${c.section}`
        }));

        // Enriquecer clases sin salón
        const enrichedWithoutRoom = results.classesWithoutRoom.map((c: any) => ({
          id: c.id,
          courseName: c.courseName || 'Sin nombre',
          section: c.section,
          sectionName: c.sectionName ? `Sección ${c.sectionName}` : `Sección ${c.section}`
        }));

        // Enriquecer confirmaciones pendientes
        const enrichedPendingConfirmations = results.pendingConfirmations.map((p: any) => ({
          teacherName: p.teacherName || 'Docente',
          className: p.className || 'Clase',
          section: p.section,
          sectionName: p.sectionName ? `Sección ${p.sectionName}` : `Sección ${p.section}`
        }));

        // Enriquecer conflictos
        const enrichedConflicts = results.conflicts.map((conflict: any) => ({
          ...conflict,
          conflictingClasses: conflict.conflictingClasses?.map((c: any) => ({
            ...c,
            sectionName: c.sectionName ? `Sección ${c.sectionName}` : `Sección ${c.section}`
          }))
        }));

        return of({
          ...results.dashboardAlerts,
          missingTeachers: results.missingTeachers,
          missingRooms: results.missingRooms,
          scheduleConflictDetails: enrichedConflicts,
          classesWithoutTeacher: enrichedWithoutTeacher,
          classesWithoutRoom: enrichedWithoutRoom,
          pendingConfirmationDetails: enrichedPendingConfirmations,
          planningStatus: results.planningStatus ? {
            closedCount: results.planningStatus.closedCount,
            totalSections: results.planningStatus.totalSections
          } : undefined
        });
      })
    );
  }
}

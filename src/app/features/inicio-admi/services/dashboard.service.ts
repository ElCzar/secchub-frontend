import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SectionsSummary } from '../models/dashboard.models';
import { environment } from '../../../../environments/environment';
import { ClassResponseDTO } from '../../../shared/model/dto/planning/ClassResponseDTO.model';
import { ClassroomScheduleConflictResponseDTO } from '../../../shared/model/dto/planning/ClassroomScheduleConflictResponseDTO.model';
import { TeacherScheduleConflictResponseDTO } from '../../../shared/model/dto/planning/TeacherScheduleConflictResponseDTO.model';
import { TeachingAssistantScheduleConflictResponseDTO } from '../../../shared/model/dto/planning/TeachingAssistantScheduleConflictResponseDTO.model';
import { TeacherClassResponseDTO } from '../../../shared/model/dto/admin/TeacherClassResponseDTO.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  /**
   * Obtiene el resumen de todas las secciones desde el backend
   */
  getSectionsSummary(): Observable<SectionsSummary> {
    return this.http.get<any[]>(`${environment.apiUrl}/sections/summary`).pipe(
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

  /**
   * Obtains all pending teacher confirmations
   */
  countPendingTeacherConfirmations(): Observable<number> {
    return this.http.get<TeacherClassResponseDTO[]>(`${environment.apiUrl}/teachers/classes/pending-decision`).pipe(
      map((teachers: TeacherClassResponseDTO[]) => teachers.length)
    );
  }

  /**
   * Obtains classes without a teacher
   */
  getClassesWithoutTeacher(): Observable<ClassResponseDTO[]> {
    return this.http.get<ClassResponseDTO[]>(`${environment.apiUrl}/planning/classes/current-semester/no-teacher`);
  }

  /**
   * Obtains classes without a class
   */
  getClassesWithoutClassroom(): Observable<ClassResponseDTO[]> {
    return this.http.get<ClassResponseDTO[]>(`${environment.apiUrl}/planning/classes/current-semester/no-classroom`);
  }

  /**
   * Obtains classroom conflicts
   */
  getClassroomConflicts(): Observable<ClassroomScheduleConflictResponseDTO[]> {
    return this.http.get<ClassroomScheduleConflictResponseDTO[]>(`${environment.apiUrl}/planning/conflicts/classrooms`);
  }

  /**
   * Obtains teacher conflicts
   */
  getTeacherConflicts(): Observable<TeacherScheduleConflictResponseDTO[]> {
    return this.http.get<TeacherScheduleConflictResponseDTO[]>(`${environment.apiUrl}/planning/conflicts/teachers`);
  }

  /**
   * Obtains teaching assistant conflicts
   */
  getTeachingAssistantConflicts(): Observable<TeachingAssistantScheduleConflictResponseDTO[]> {
    return this.http.get<TeachingAssistantScheduleConflictResponseDTO[]>(`${environment.apiUrl}/teaching-assistants/conflicts`);
  }
}
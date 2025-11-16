import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeacherResponseDTO } from '../../../shared/model/dto/admin/TeacherResponseDTO.model';
import { TeacherClassResponseDTO } from '../../../shared/model/dto/admin/TeacherClassResponseDTO.model';
import { TeacherClassRow } from '../models/class.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherClassDecisionService {
  private readonly apiUrl = `${environment.apiUrl}/teachers`;
  private readonly classApiUrl = `${environment.apiUrl}/planning/classes`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Gets a teacher by user ID
   * @param userId User ID
   * @returns Observable with the teacher associated with the user
   */
  getTeacherByUserId(userId: number): Observable<TeacherResponseDTO> {
    return this.http.get<TeacherResponseDTO>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Gets current semester teacher classes by teacher ID
   * @param teacherId Teacher ID
   * @returns Observable with list of current semester teacher classes
   */
  getCurrentSemesterTeacherClassesByTeacher(teacherId: number): Observable<TeacherClassResponseDTO[]> {
    return this.http.get<TeacherClassResponseDTO[]>(`${this.apiUrl}/classes/current-semester/${teacherId}`);
  }

  /**
   * Accept a class assignment for a teacher with an optional observation
   * @param teacherClassId Class ID
   * @param observation Optional observation text
   * @returns Observable with updated class assignment
   */
  acceptTeacherClass(teacherClassId: number, observation?: string): Observable<TeacherClassResponseDTO> {
    const body = observation ? { observation } : {};
    return this.http.patch<TeacherClassResponseDTO>(`${this.apiUrl}/classes/${teacherClassId}/accept`, body);
  }

  /**
   * Reject a class assignment for a teacher with an optional observation
   * @param teacherClassId Class ID
   * @param observation Optional observation text
   * @returns Observable with updated class assignment
   */
  rejectTeacherClass(teacherClassId: number, observation?: string): Observable<TeacherClassResponseDTO> {
    const body = observation ? { observation } : {};
    return this.http.patch<TeacherClassResponseDTO>(`${this.apiUrl}/classes/${teacherClassId}/reject`, body);
  }

  /**
   * Gets a class by id
   * @param classId Class ID
   * @returns Observable with class information
   */
  getClassById(classId: number): Observable<any> {
    return this.http.get<any>(`${this.classApiUrl}/${classId}`);
  }

  /**
   * Process accept decision for multiple teacher classes
   * @param teacherClassRows Array of teacher class rows to accept
   * @param observations Optional observations mapped by teacherClassId
   * @returns Observable with array of updated teacher class assignments
   */
  processAcceptDecisions(
    teacherClassRows: TeacherClassRow[], 
    observations?: Record<string, string>
  ): Observable<TeacherClassResponseDTO[]> {
    const requests = teacherClassRows.map(row => {
      const observation = observations?.[row.teacherClassId.toString()];
      return this.acceptTeacherClass(row.teacherClassId, observation);
    });

    return new Observable(observer => {
      let completed = 0;
      const results: TeacherClassResponseDTO[] = [];
      
      for (let index = 0; index < requests.length; index++) {
        const request = requests[index];
        request.subscribe({
          next: (result) => {
            results[index] = result;
            completed++;
            if (completed === requests.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      }
      
      if (requests.length === 0) {
        observer.next([]);
        observer.complete();
      }
    });
  }

  /**
   * Process reject decision for multiple teacher classes
   * @param teacherClassRows Array of teacher class rows to reject
   * @param observations Optional observations mapped by teacherClassId
   * @returns Observable with array of updated teacher class assignments
   */
  processRejectDecisions(
    teacherClassRows: TeacherClassRow[], 
    observations?: Record<string, string>
  ): Observable<TeacherClassResponseDTO[]> {
    const requests = teacherClassRows.map(row => {
      const observation = observations?.[row.teacherClassId.toString()];
      return this.rejectTeacherClass(row.teacherClassId, observation);
    });

    return new Observable(observer => {
      let completed = 0;
      const results: TeacherClassResponseDTO[] = [];
      
      for (let index = 0; index < requests.length; index++) {
        const request = requests[index];
        request.subscribe({
          next: (result) => {
            results[index] = result;
            completed++;
            if (completed === requests.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      }
      
      if (requests.length === 0) {
        observer.next([]);
        observer.complete();
      }
    });
  }

  /**
   * Process mixed decisions (accept/reject/review) based on pending states
   * @param teacherClassRows Array of all teacher class rows
   * @param pendingStates States mapped by class id (not teacherClassId)
   * @param commentRequests Comment requests mapped by class id
   * @returns Observable with processing results
   */
  processMixedDecisions(
    teacherClassRows: TeacherClassRow[],
    pendingStates: Record<string, 'accept' | 'reject' | 'review' | 'none'>,
    commentRequests: Record<string, string>
  ): Observable<{
    accepted: TeacherClassResponseDTO[];
    rejected: TeacherClassResponseDTO[];
    reviewed: { classId: string; message: string }[];
  }> {
    const toAccept: TeacherClassRow[] = [];
    const toReject: TeacherClassRow[] = [];
    const toReview: { classId: string; message: string }[] = [];
    const acceptObservations: Record<string, string> = {};
    const rejectObservations: Record<string, string> = {};

    // Categorize actions based on states
    for (const row of teacherClassRows) {
      const state = pendingStates[row.id.toString()] || 'none';
      const comment = commentRequests[row.id.toString()] || '';

      switch (state) {
        case 'accept':
          toAccept.push(row);
          if (comment) {
            acceptObservations[row.teacherClassId.toString()] = comment;
          }
          break;
        case 'reject':
          toReject.push(row);
          if (comment) {
            rejectObservations[row.teacherClassId.toString()] = comment;
          }
          break;
        case 'review':
          toReview.push({
            classId: row.id.toString(),
            message: comment
          });
          break;
      }
    }

    return new Observable(observer => {
      let completedOperations = 0;
      const totalOperations = (toAccept.length > 0 ? 1 : 0) + (toReject.length > 0 ? 1 : 0);
      let acceptedResults: TeacherClassResponseDTO[] = [];
      let rejectedResults: TeacherClassResponseDTO[] = [];

      const checkCompletion = () => {
        if (completedOperations === totalOperations) {
          observer.next({
            accepted: acceptedResults,
            rejected: rejectedResults,
            reviewed: toReview
          });
          observer.complete();
        }
      };

      if (toAccept.length > 0) {
        this.processAcceptDecisions(toAccept, acceptObservations).subscribe({
          next: (results) => {
            acceptedResults = results;
            completedOperations++;
            checkCompletion();
          },
          error: (error) => observer.error(error)
        });
      }

      if (toReject.length > 0) {
        this.processRejectDecisions(toReject, rejectObservations).subscribe({
          next: (results) => {
            rejectedResults = results;
            completedOperations++;
            checkCompletion();
          },
          error: (error) => observer.error(error)
        });
      }

      if (totalOperations === 0) {
        observer.next({
          accepted: [],
          rejected: [],
          reviewed: toReview
        });
        observer.complete();
      }
    });
  }

  /**
   * Process accept decision with confirmation dialog
   * @param teacherClassRows Array of teacher class rows to accept
   * @param observations Optional observations
   * @returns Observable with results or null if cancelled
   */
  processAcceptWithConfirmation(
    teacherClassRows: TeacherClassRow[],
    observations?: Record<string, string>
  ): Observable<TeacherClassResponseDTO[] | null> {
    const classNames = teacherClassRows.map(row => row.subject).join(', ');
    const count = teacherClassRows.length;
    
    const confirmMessage = `¿Está seguro de que desea aceptar ${count} clase${count > 1 ? 's' : ''}?\n\n` +
      `Clases: ${classNames}\n\n` +
      'Esta acción no se puede deshacer.';
    
    if (confirm(confirmMessage)) {
      return this.processAcceptDecisions(teacherClassRows, observations);
    }
    
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }

  /**
   * Process reject decision with confirmation dialog
   * @param teacherClassRows Array of teacher class rows to reject
   * @param observations Optional observations
   * @returns Observable with results or null if cancelled
   */
  processRejectWithConfirmation(
    teacherClassRows: TeacherClassRow[],
    observations?: Record<string, string>
  ): Observable<TeacherClassResponseDTO[] | null> {
    const classNames = teacherClassRows.map(row => row.subject).join(', ');
    const count = teacherClassRows.length;
    
    const confirmMessage = `¿Está seguro de que desea rechazar ${count} clase${count > 1 ? 's' : ''}?\n\n` +
      `Clases: ${classNames}\n\n` +
      'Esta acción no se puede deshacer.';
    
    if (confirm(confirmMessage)) {
      return this.processRejectDecisions(teacherClassRows, observations);
    }
    
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }

  /**
   * Get statistics for teacher class decisions
   * @param teacherClassRows Array of teacher class rows
   * @returns Statistics object
   */
  getTeacherClassStatisticsFromRows(teacherClassRows: TeacherClassRow[]): {
    total: number;
    accepted: number;
    pending: number;
  } {
    return {
      total: teacherClassRows.length,
      accepted: teacherClassRows.filter(row => row.accepted === true).length,
      pending: teacherClassRows.filter(row => row.accepted === undefined || row.accepted === false).length
    };
  }
}

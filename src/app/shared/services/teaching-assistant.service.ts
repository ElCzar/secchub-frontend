import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TeachingAssistantRequestDTO } from '../model/dto/planning/TeachingAssistantRequestDTO.model';
import { TeachingAssistantResponseDTO } from '../model/dto/planning/TeachingAssistantResponseDTO.model';
import { TeachingAssistantScheduleRequestDTO } from '../model/dto/planning/TeachingAssistantScheduleRequestDTO.model';
import { TeachingAssistantScheduleResponseDTO } from '../model/dto/planning/TeachingAssistantScheduleResponseDTO.model';

@Injectable({
  providedIn: 'root'
})
export class TeachingAssistantService {
  private readonly baseUrl = `${environment.apiUrl}/teaching-assistants`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Creates a new teaching assistant assignment.
   * @param teachingAssistantRequestDTO DTO with assignment data
   * @returns Observable with full HTTP response
   */
  createTeachingAssistant(teachingAssistantRequestDTO: TeachingAssistantRequestDTO): Observable<any> {
    return this.http.post<TeachingAssistantResponseDTO>(this.baseUrl, teachingAssistantRequestDTO, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error('Error creating teaching assistant:', error);
        return of(null);
      })
    );
  }

  /**
   * Updates an existing teaching assistant assignment.
   * @param id Teaching assistant ID
   * @param teachingAssistantRequestDTO DTO with updated data
   * @returns Observable with full HTTP response
   */
  updateTeachingAssistant(id: number, teachingAssistantRequestDTO: TeachingAssistantRequestDTO): Observable<any> {
    return this.http.put<TeachingAssistantResponseDTO>(`${this.baseUrl}/${id}`, teachingAssistantRequestDTO, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error(`Error updating teaching assistant ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Deletes a teaching assistant assignment.
   * @param id Teaching assistant ID
   * @returns Observable with full HTTP response
   */
  deleteTeachingAssistant(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error(`Error deleting teaching assistant ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Gets a teaching assistant assignment by its ID.
   * @param id Teaching assistant ID
   * @returns Observable<TeachingAssistantResponseDTO | null> with the found assignment
   */
  getTeachingAssistantById(id: number): Observable<TeachingAssistantResponseDTO | null> {
    return this.http.get<TeachingAssistantResponseDTO>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error loading teaching assistant ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Gets teaching assistant assignments by student application ID.
   * @param studentApplicationId Student application ID
   * @returns Observable<TeachingAssistantResponseDTO[]> for the student application
   */
  getTeachingAssistantsByStudentApplication(studentApplicationId: number): Observable<TeachingAssistantResponseDTO[]> {
    return this.http.get<TeachingAssistantResponseDTO[]>(`${this.baseUrl}/student-application/${studentApplicationId}`).pipe(
      catchError((error) => {
        console.error(`Error loading teaching assistants for student application ${studentApplicationId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Gets all teaching assistant assignments for the current semester.
   * @returns Observable<TeachingAssistantResponseDTO[]> for the current semester
   */
  getCurrentSemesterTeachingAssistants(): Observable<TeachingAssistantResponseDTO[]> {
    return this.http.get<TeachingAssistantResponseDTO[]>(`${this.baseUrl}/current-semester`).pipe(
      catchError((error) => {
        console.error('Error loading current semester teaching assistants:', error);
        return of([]);
      })
    );
  }

  /**
   * Gets all teaching assistant assignments.
   * @returns Observable<TeachingAssistantResponseDTO[]>
   */
  getAllTeachingAssistants(): Observable<TeachingAssistantResponseDTO[]> {
    return this.http.get<TeachingAssistantResponseDTO[]>(this.baseUrl).pipe(
      catchError((error) => {
        console.error('Error loading all teaching assistants:', error);
        return of([]);
      })
    );
  }

  /**
   * Creates a new schedule for a teaching assistant.
   * @param teachingAssistantId Teaching assistant ID
   * @param scheduleRequestDTO DTO with schedule data
   * @returns Observable with full HTTP response
   */
  createSchedule(teachingAssistantId: number, scheduleRequestDTO: TeachingAssistantScheduleRequestDTO): Observable<any> {
    return this.http.post<TeachingAssistantScheduleResponseDTO>(`${this.baseUrl}/${teachingAssistantId}/schedules`, scheduleRequestDTO, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error(`Error creating schedule for teaching assistant ${teachingAssistantId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Updates an existing teaching assistant schedule.
   * @param scheduleId Schedule ID
   * @param scheduleRequestDTO DTO with updated schedule data
   * @returns Observable with full HTTP response
   */
  updateSchedule(scheduleId: number, scheduleRequestDTO: TeachingAssistantScheduleRequestDTO): Observable<any> {
    return this.http.put<TeachingAssistantScheduleResponseDTO>(`${this.baseUrl}/schedules/${scheduleId}`, scheduleRequestDTO, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error(`Error updating schedule ${scheduleId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Deletes a teaching assistant schedule.
   * @param scheduleId Schedule ID
   * @returns Observable with full HTTP response
   */
  deleteSchedule(scheduleId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/schedules/${scheduleId}`, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error(`Error deleting schedule ${scheduleId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Generates payroll for teaching assistants.
   * @returns Observable with full HTTP response
   */
  generatePayroll(): Observable<any> {
    return this.http.post(`${this.baseUrl}/payroll`, null, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error('Error generating payroll:', error);
        return of(null);
      })
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StudentApplicationRequestDTO } from '../model/dto/integration/StudentApplicationRequestDTO.model';
import { StudentApplicationResponseDTO } from '../model/dto/integration/StudentApplicationResponseDTO.model';

@Injectable({
  providedIn: 'root'
})
export class StudentApplicationService {
  private readonly baseUrl = `${environment.apiUrl}/student-applications`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Creates a new student application.
   * @param studentApplicationRequestDTO DTO with request data
   * @returns Observable with full HTTP response
   */
  createStudentApplication(studentApplicationRequestDTO: StudentApplicationRequestDTO): Observable<any> {
    return this.http.post<StudentApplicationResponseDTO>(this.baseUrl, studentApplicationRequestDTO, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error('Error creating student application:', error);
        return of(null);
      })
    );
  }

  /**
   * Gets all student applications for the current semester.
   * @returns Observable<StudentApplicationResponseDTO[]> with applications for the current semester
   */
  getCurrentSemesterStudentApplications(): Observable<StudentApplicationResponseDTO[]> {
    return this.http.get<StudentApplicationResponseDTO[]>(`${this.baseUrl}/current-semester`).pipe(
      catchError((error) => {
        console.error('Error loading current semester student applications:', error);
        return of([]);
      })
    );
  }

  /**
   * Gets all student applications.
   * @returns Observable<StudentApplicationResponseDTO[]> with all applications
   */
  getAllStudentApplications(): Observable<StudentApplicationResponseDTO[]> {
    return this.http.get<StudentApplicationResponseDTO[]>(this.baseUrl).pipe(
      catchError((error) => {
        console.error('Error loading all student applications:', error);
        return of([]);
      })
    );
  }

  /**
   * Gets a student application by its ID.
   * @param studentApplicationId Application ID
   * @returns Observable<StudentApplicationResponseDTO | null> with the found application
   */
  getStudentApplicationById(studentApplicationId: number): Observable<StudentApplicationResponseDTO | null> {
    return this.http.get<StudentApplicationResponseDTO>(`${this.baseUrl}/${studentApplicationId}`).pipe(
      catchError((error) => {
        console.error(`Error loading student application ${studentApplicationId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Approves a student application.
   * @param studentApplicationId Application ID
   * @returns Observable with full HTTP response
   */
  approveStudentApplication(studentApplicationId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentApplicationId}/approve`, null, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error(`Error approving student application ${studentApplicationId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Rejects a student application.
   * @param studentApplicationId Application ID
   * @returns Observable with full HTTP response
   */
  rejectStudentApplication(studentApplicationId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentApplicationId}/reject`, null, {
      observe: 'response'
    }).pipe(
      catchError((error) => {
        console.error(`Error rejecting student application ${studentApplicationId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Gets student applications by status.
   * @param statusId Status ID
   * @returns Observable<StudentApplicationResponseDTO[]> with applications in that status
   */
  getStudentApplicationsByStatus(statusId: number): Observable<StudentApplicationResponseDTO[]> {
    return this.http.get<StudentApplicationResponseDTO[]>(`${this.baseUrl}/status/${statusId}`).pipe(
      catchError((error) => {
        console.error(`Error loading student applications by status ${statusId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Gets student applications for a specific section.
   * @param sectionId Section ID
   * @returns Observable<StudentApplicationResponseDTO[]> with applications in that section
   */
  getStudentApplicationsBySection(sectionId: number): Observable<StudentApplicationResponseDTO[]> {
    return this.http.get<StudentApplicationResponseDTO[]>(`${this.baseUrl}/section/${sectionId}`).pipe(
      catchError((error) => {
        console.error(`Error loading student applications by section ${sectionId}:`, error);
        return of([]);
      })
    );
  }
}
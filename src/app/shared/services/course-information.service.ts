import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CourseResponseDTO } from '../model/dto/admin/CourseResponseDTO.model';

/**
 * Shared service for course information management
 * Provides access to course data using admin endpoints
 */
@Injectable({
    providedIn: 'root'
})
export class CourseInformationService {
    private readonly baseUrl = `${environment.apiUrl}/courses`;

    constructor(private readonly http: HttpClient) {}

    /**
     * List all existing courses.
     * @returns Observable<CourseResponseDTO[]> with all courses
     */
    findAllCourses(): Observable<CourseResponseDTO[]> {
    return this.http.get<CourseResponseDTO[]>(this.baseUrl).pipe(
        catchError((error) => {
        console.error('Error loading all courses:', error);
        return of([]);
        })
    );
    }

    /**
     * Get a course by its ID.
     * @param courseId Course ID
     * @returns Observable<CourseResponseDTO | null> with the course data
     */
    findCourseById(courseId: number): Observable<CourseResponseDTO | null> {
    return this.http.get<CourseResponseDTO>(`${this.baseUrl}/${courseId}`).pipe(
        catchError((error) => {
        console.error(`Error loading course ${courseId}:`, error);
        return of(null);
        })
    );
    }
}
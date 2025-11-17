import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SectionResponseDTO } from '../model/dto/admin/SectionResponseDTO.model';

/**
 * Shared service for section information management
 * Provides access to section data using admin endpoints
 */
@Injectable({
    providedIn: 'root'
})
export class SectionInformationService {
    private readonly baseUrl = `${environment.apiUrl}/sections`;

    constructor(private readonly http: HttpClient) {}

    /**
     * List all existing sections.
     * @returns Observable<SectionResponseDTO[]> with all sections
     */
    findAllSections(): Observable<SectionResponseDTO[]> {
    return this.http.get<SectionResponseDTO[]>(this.baseUrl).pipe(
        catchError((error) => {
        console.error('Error loading all sections:', error);
        return of([]);
        })
    );
    }

    /**
     * Get a section by its ID.
     * @param sectionId Section ID
     * @returns Observable<SectionResponseDTO | null> with the section data
     */
    findSectionById(sectionId: number): Observable<SectionResponseDTO | null> {
    return this.http.get<SectionResponseDTO>(`${this.baseUrl}/${sectionId}`).pipe(
        catchError((error) => {
        console.error(`Error loading section ${sectionId}:`, error);
        return of(null);
        })
    );
    }

    /**
     * Get section by user ID.
     * @param userId User ID
     * @returns Observable<SectionResponseDTO | null> with the section data
     */
    findSectionByUserId(userId: number): Observable<SectionResponseDTO | null> {
    return this.http.get<SectionResponseDTO>(`${this.baseUrl}/user/${userId}`).pipe(
        catchError((error) => {
        console.error(`Error loading section for user ${userId}:`, error);
        return of(null);
        })
    );
    }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UserInformationResponseDTO } from '../model/dto/user/UserInformationResponseDTO.model';

@Injectable({
    providedIn: 'root'
})
export class UserInformationService {
    private readonly baseUrl = `${environment.apiUrl}/user`;

    constructor(private readonly http: HttpClient) {}

    /**
     * Get logged-in user information.
     * @returns Observable<UserInformationResponseDTO | null> with current user details
     */
    getUserInformation(): Observable<UserInformationResponseDTO | null> {
    return this.http.get<UserInformationResponseDTO>(this.baseUrl).pipe(
        catchError((error) => {
        console.error('Error loading current user information:', error);
        return of(null);
        })
    );
    }

    /**
     * Get user information by email.
     * @param email User email address
     * @returns Observable<UserInformationResponseDTO | null> with user details
     */
    getUserInformationByEmail(email: string): Observable<UserInformationResponseDTO | null> {
    const params = new HttpParams().set('email', email);

    return this.http.get<UserInformationResponseDTO>(`${this.baseUrl}/email`, { params }).pipe(
        catchError((error) => {
        console.error(`Error loading user information for email ${email}:`, error);
        return of(null);
        })
    );
    }

    /**
     * Get user information by user ID.
     * @param userId User ID
     * @returns Observable<UserInformationResponseDTO | null> with user details
     */
    getUserInformationById(userId: number): Observable<UserInformationResponseDTO | null> {
    return this.http.get<UserInformationResponseDTO>(`${this.baseUrl}/id/${userId}`).pipe(
        catchError((error) => {
        console.error(`Error loading user information for ID ${userId}:`, error);
        return of(null);
        })
    );
    }

    /**
     * Utility method to get current user information with full response details.
     * Useful when you need access to HTTP status codes or headers.
     * @returns Observable with full HTTP response
     */
    getUserInformationWithResponse(): Observable<any> {
    return this.http.get<UserInformationResponseDTO>(this.baseUrl, { 
        observe: 'response' 
    }).pipe(
        catchError((error) => {
        console.error('Error loading current user information with response:', error);
        return of(null);
        })
    );
    }

    /**
     * Get user information by email with full response details.
     * @param email User email address
     * @returns Observable with full HTTP response
     */
    getUserInformationByEmailWithResponse(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);

    return this.http.get<UserInformationResponseDTO>(`${this.baseUrl}/email`, { 
        params,
        observe: 'response' 
    }).pipe(
        catchError((error) => {
        console.error(`Error loading user information for email ${email} with response:`, error);
        return of(null);
        })
    );
    }

    /**
     * Get user information by ID with full response details.
     * @param userId User ID
     * @returns Observable with full HTTP response
     */
    getUserInformationByIdWithResponse(userId: number): Observable<any> {
    return this.http.get<UserInformationResponseDTO>(`${this.baseUrl}/id/${userId}`, { 
        observe: 'response' 
    }).pipe(
        catchError((error) => {
        console.error(`Error loading user information for ID ${userId} with response:`, error);
        return of(null);
        })
    );
    }

    /**
     * Check if current user exists and is valid.
     * @returns Observable<boolean> indicating if user information is available
     */
    isCurrentUserValid(): Observable<boolean> {
    return this.getUserInformation().pipe(
        map(user => user !== null && user.id > 0)
    );
    }

    /**
     * Get current user's role ID.
     * @returns Observable<number | null> with user's role ID
     */
    getCurrentUserRoleId(): Observable<number | null> {
    return this.getUserInformation().pipe(
        map(user => user?.roleId || null)
    );
    }

    /**
     * Get current user's status ID.
     * @returns Observable<number | null> with user's status ID
     */
    getCurrentUserStatusId(): Observable<number | null> {
    return this.getUserInformation().pipe(
        map(user => user?.statusId || null)
    );
    }

    /**
     * Get current user's full name.
     * @returns Observable<string | null> with user's full name
     */
    getCurrentUserFullName(): Observable<string | null> {
    return this.getUserInformation().pipe(
        map(user => user ? `${user.name} ${user.lastName}` : null)
    );
    }
}
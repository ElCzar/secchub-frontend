import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Section {
  id: number;
  name: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class SectionsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.baseUrl}/sections`).pipe(
      catchError((error) => {
        console.error('Error cargando secciones:', error);
        return of([]);
      })
    );
  }

  getSectionById(id: number): Observable<Section | null> {
    return this.http.get<Section>(`${this.baseUrl}/sections/${id}`).pipe(
      catchError(() => of(null))
    );
  }
}
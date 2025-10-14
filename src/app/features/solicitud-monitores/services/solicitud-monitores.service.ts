import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudMonitoresService {
  private readonly baseUrl = environment.apiUrl;
  private readonly studentApplicationsEndpoint = '/student-applications';
  private readonly teachingAssistantsEndpoint = '/teaching-assistants';

  constructor(private readonly http: HttpClient) {}

  getMonitores(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.studentApplicationsEndpoint}/current-semester`,{
      observe: 'response'
    });
  }

  updateMonitores(monitores: any[]): Observable<void> {
    console.log('Guardando monitores:', monitores);
    
    // Simular guardado exitoso - reemplazar con llamada HTTP real
    return of(void 0);
    
    // Descomenta para usar la llamada HTTP real:
    // return this.http.put<void>(`${this.baseUrl}/actualizar`, monitores);
  }
}

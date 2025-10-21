import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudMonitoresService {
  private readonly baseUrl = environment.apiUrl;
  private readonly studentApplicationsEndpoint = '/student-applications';
  private readonly teachingAssistantsEndpoint = '/teaching-assistants';
  private readonly classesAvailableEndpoint = '/planning/classes';

  constructor(private readonly http: HttpClient) {}

  getStudentApplications(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.studentApplicationsEndpoint}/current-semester`,{
      observe: 'response'
    });
  }

  approveStudentApplication(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${this.studentApplicationsEndpoint}/${id}/approve`, null,{
      observe: 'response'
    });
  }

  rejectStudentApplication(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${this.studentApplicationsEndpoint}/${id}/reject`, null,{
      observe: 'response'
    });
  }

  getTeachingAssistantByStudentApplicationId(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.teachingAssistantsEndpoint}/student-application/${id}`,{
      observe: 'response'
    });
  }

  getTeachingAssistantById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.teachingAssistantsEndpoint}/${id}`,{
      observe: 'response'
    });
  }

  getTeachingAssistants(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.teachingAssistantsEndpoint}/current-semester`,{
      observe: 'response'
    });
  }

  createTeachingAssistant(teachingAssistantRequestDTO: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${this.teachingAssistantsEndpoint}`, teachingAssistantRequestDTO,{
      observe: 'response'
    });
  }

  updateTeachingAssistant(id: number, teachingAssistantRequestDTO: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${this.teachingAssistantsEndpoint}/${id}`, teachingAssistantRequestDTO,{
      observe: 'response'
    });
  }

  deleteTeachingAssistant(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}${this.teachingAssistantsEndpoint}/${id}`,{
      observe: 'response'
    });
  }

  getCurrentSemesterClassesAvailable(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${this.classesAvailableEndpoint}/current-semester`,{
      observe: 'response'
    });
  }
}

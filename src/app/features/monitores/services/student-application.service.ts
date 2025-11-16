import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StudentApplicationRequestDTO } from '../../../shared/model/dto/integration';

@Injectable({
  providedIn: 'root'
})
export class StudentApplicationService {
  private readonly baseUrl = environment.apiUrl + '/student-applications';

  constructor(private readonly http: HttpClient) {}

  submitApplication(application: StudentApplicationRequestDTO): Observable<any> {
    console.log("Submitting application:", application);
    return this.http.post(`${this.baseUrl}`, application);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentApplicationRequest {
  // === DATOS PERSONALES ===
  program: string;
  semester: number;
  academicAverage: number;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  address: string;
  personalEmail: string;
  wasTeachingAssistant: boolean;

  // === MONITOR ACADÉMICO ===
  courseId?: number;
  courseAverage?: number;
  courseTeacher?: string;

  // === MONITOR ADMINISTRATIVO ===
  sectionId?: number;

  // === HORARIOS ===
  schedules?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentApplicationService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  submitApplication(application: StudentApplicationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/students-applications`, application);
  }
}
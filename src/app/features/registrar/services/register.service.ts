import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRegisterRequestDTO } from '../models/user.model';
import { TeacherRegisterRequestDTO, TeacherResponseDTO } from '../models/teacher.model';
import { SectionRegisterRequestDTO, SectionResponseDTO } from '../models/section.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Crear Administrador
  registerAdmin(payload: UserRegisterRequestDTO): Observable<number> {
    return this.http.post<number>(`${this.base}/admin/register/admin`, payload);
  }

  // Crear Estudiante
  registerStudent(payload: UserRegisterRequestDTO): Observable<number> {
    return this.http.post<number>(`${this.base}/admin/register/student`, payload);
  }

  // Crear Programa
  registerProgram(payload: UserRegisterRequestDTO): Observable<number> {
    return this.http.post<number>(`${this.base}/admin/register/program`, payload);
  }

  // Crear Profesor
  registerTeacher(payload: TeacherRegisterRequestDTO): Observable<TeacherResponseDTO> {
    return this.http.post<TeacherResponseDTO>(`${this.base}/admin/register/teacher`, payload);
  }

  // Crear Jefe de Sección (crea la sección y asigna al usuario como jefe)
  registerSectionHead(payload: SectionRegisterRequestDTO): Observable<SectionResponseDTO> {
    return this.http.post<SectionResponseDTO>(`${this.base}/admin/register/section`, payload);
  }
}

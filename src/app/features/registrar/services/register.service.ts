import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRegisterRequestDTO, UserCreatedResponse } from '../models/user.models';
import { SectionRegisterRequestDTO, SectionResponseDTO } from '../models/section.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Crear Administrador
  registerAdmin(payload: UserRegisterRequestDTO): Observable<UserCreatedResponse> {
    return this.http.post<UserCreatedResponse>(`${this.base}/admin/register/admin`, payload);
  }

  // Crear Jefe de Sección (crea la sección y asigna al profesor como jefe)
  registerSectionHead(payload: SectionRegisterRequestDTO): Observable<SectionResponseDTO> {
    return this.http.post<SectionResponseDTO>(`${this.base}/admin/register/section`, payload);
  }
}

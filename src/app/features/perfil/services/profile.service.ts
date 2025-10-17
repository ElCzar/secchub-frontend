import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserProfile, EditUserProfileRequest } from '../models/user-profile.models';
import { UserInformationResponseDTO } from '../../../shared/model/dto/user/UserInformationResponseDTO.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  // Obtener el perfil del usuario actual
  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserInformationResponseDTO>(`${this.baseUrl}/user/me`)
      .pipe(
        map(dto => this.mapDTOToUserProfile(dto))
      );
  }

  // Obtener perfil por ID
  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserInformationResponseDTO>(`${this.baseUrl}/user/${userId}`)
      .pipe(
        map(dto => this.mapDTOToUserProfile(dto))
      );
  }

  // Actualizar perfil del usuario actual
  updateUserProfile(profileData: EditUserProfileRequest): Observable<UserProfile> {
    const updateDTO = {
      name: profileData.name,
      lastName: profileData.lastName,
      email: profileData.correo,
      documentType: Number.parseInt(profileData.documentType, 10),
      documentNumber: profileData.documentNumber
    };

    return this.http.put<UserInformationResponseDTO>(`${this.baseUrl}/user/me`, updateDTO)
      .pipe(
        map(dto => this.mapDTOToUserProfile(dto))
      );
  }

  // Verificar si el usuario puede editar el perfil
  canEditProfile(role: string): boolean {
    return role === 'administrador';
  }

  // Mapear DTO a modelo local
  private mapDTOToUserProfile(dto: UserInformationResponseDTO): UserProfile {
    return {
      id: dto.id,
      username: dto.username,
      faculty: dto.faculty,
      nombreCompleto: `${dto.name} ${dto.lastName}`,
      correo: dto.email,
      documentType: dto.documentType.toString(),
      documentNumber: dto.documentNumber,
      isActive: dto.statusId === 1,
      rol: dto.roleId === 1 ? 'administrador' : 'jefe_seccion'
    };
  }
}
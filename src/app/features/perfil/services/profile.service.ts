import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserProfile, EditUserProfileRequest } from '../models/user-profile.models';
import { UserProfileResponseDTO, UserProfileUpdateRequestDTO } from '../../../model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  // Obtener el perfil del usuario actual
  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfileResponseDTO>(`${this.baseUrl}/profile/me`)
      .pipe(
        map(dto => this.mapDTOToUserProfile(dto))
      );
  }

  // Obtener perfil por ID
  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfileResponseDTO>(`${this.baseUrl}/profile/${userId}`)
      .pipe(
        map(dto => this.mapDTOToUserProfile(dto))
      );
  }

  // Actualizar perfil del usuario actual
  updateUserProfile(profileData: EditUserProfileRequest): Observable<UserProfile> {
    const updateDTO: UserProfileUpdateRequestDTO = {
      name: profileData.name,
      lastName: profileData.lastName,
      email: profileData.correo,
      documentTypeId: profileData.documentType,
      documentNumber: profileData.documentNumber
    };

    return this.http.put<UserProfileResponseDTO>(`${this.baseUrl}/profile/me`, updateDTO)
      .pipe(
        map(dto => this.mapDTOToUserProfile(dto))
      );
  }

  // Verificar si el usuario puede editar el perfil
  canEditProfile(role: string): boolean {
    return role === 'administrador';
  }

  // Mapear DTO a modelo local
  private mapDTOToUserProfile(dto: UserProfileResponseDTO): UserProfile {
    return {
      id: dto.id,
      username: dto.username,
      faculty: dto.faculty,
      nombreCompleto: `${dto.name} ${dto.lastName}`,
      correo: dto.email,
      documentType: dto.documentTypeId,
      documentNumber: dto.documentNumber,
      isActive: dto.isActive,
      createdDate: dto.createdDate,
      updatedDate: dto.updatedDate,
      rol: dto.role === 'ADMIN' ? 'administrador' : 'jefe_seccion',
      seccion: dto.sectionInfo ? {
        id: dto.sectionInfo.id,
        name: dto.sectionInfo.name,
        description: dto.sectionInfo.description
      } : undefined
    };
  }
}
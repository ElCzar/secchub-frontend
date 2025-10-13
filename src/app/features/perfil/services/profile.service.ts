import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserProfile, EditUserProfileRequest } from '../models/user-profile.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor() { }

  // Simular obtener el perfil del usuario actual
  getCurrentUserProfile(): Observable<UserProfile> {
    // En una implementación real, esto vendría de una API
    const mockProfile: UserProfile = {
      id: '1',
      nombreCompleto: 'Juan Carlos Pérez',
      correo: 'juan.perez@universidad.edu.co',
      rol: 'administrador'
    };

    return of(mockProfile);
  }

  // Simular obtener perfil por ID
  getUserProfile(userId: string): Observable<UserProfile> {
    // En una implementación real, esto vendría de una API
    const mockProfile: UserProfile = {
      id: userId,
      nombreCompleto: 'María García López',
      correo: 'maria.garcia@universidad.edu.co',
      rol: 'jefe_seccion',
      seccion: 'Ingeniería de Sistemas'
    };

    return of(mockProfile);
  }

  // Actualizar perfil del usuario
  updateUserProfile(profileData: EditUserProfileRequest): Observable<UserProfile> {
    // En una implementación real, esto sería una llamada HTTP
    const updatedProfile: UserProfile = {
      id: profileData.id,
      nombreCompleto: profileData.nombreCompleto,
      correo: profileData.correo,
      rol: 'administrador' // Este dato vendría del backend
    };

    return of(updatedProfile);
  }

  // Verificar si el usuario puede editar perfil
  canEditProfile(userRole: string): boolean {
    return userRole === 'administrador';
  }
}
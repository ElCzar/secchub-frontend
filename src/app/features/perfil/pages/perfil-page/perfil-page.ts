import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopPerfilComponent } from '../../components/pop-perfil/pop-perfil';
import { UserProfile } from '../../models/user-profile.models';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, PopPerfilComponent],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.scss'
})
export class PerfilPageComponent {
  showProfilePopup = false;
  selectedUserId?: string;

  // Ejemplo de usuarios
  users = [
    { id: '1', name: 'Juan Carlos Pérez', role: 'Administrador' },
    { id: '2', name: 'María García López', role: 'Jefe de Sección - Ingeniería de Sistemas' },
    { id: '3', name: 'Carlos Rodríguez', role: 'Jefe de Sección - Matemáticas' }
  ];

  openMyProfile() {
    this.selectedUserId = undefined; // Mi propio perfil
    this.showProfilePopup = true;
  }

  openUserProfile(userId: string) {
    this.selectedUserId = userId;
    this.showProfilePopup = true;
  }

  onCloseProfile() {
    this.showProfilePopup = false;
    this.selectedUserId = undefined;
  }

  onProfileUpdated(updatedProfile: UserProfile) {
    console.log('Perfil actualizado:', updatedProfile);
    // Aquí puedes actualizar la información en tu aplicación
  }
}

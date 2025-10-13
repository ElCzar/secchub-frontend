import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfile, EditUserProfileRequest } from '../../models/user-profile.models';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-pop-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pop-perfil.html',
  styleUrl: './pop-perfil.scss'
})
export class PopPerfilComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() userId?: string; // Si se proporciona, muestra el perfil de ese usuario
  @Output() closeModal = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<UserProfile>();

  userProfile: UserProfile | null = null;
  isEditing = false;
  editForm: EditUserProfileRequest = {
    id: '',
    nombreCompleto: '',
    correo: ''
  };
  isLoading = false;
  canEdit = false;

  constructor(private readonly profileService: ProfileService) {}

  ngOnInit() {
    if (this.isVisible) {
      this.loadUserProfile();
    }
  }

  ngOnChanges() {
    if (this.isVisible && !this.userProfile) {
      this.loadUserProfile();
    }
  }

  loadUserProfile() {
    this.isLoading = true;
    
    const profileObservable = this.userId 
      ? this.profileService.getUserProfile(this.userId)
      : this.profileService.getCurrentUserProfile();

    profileObservable.subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.canEdit = this.profileService.canEditProfile(profile.rol);
        this.resetEditForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
      }
    });
  }

  private resetEditForm() {
    if (this.userProfile) {
      this.editForm = {
        id: this.userProfile.id,
        nombreCompleto: this.userProfile.nombreCompleto,
        correo: this.userProfile.correo
      };
    }
  }

  onClose() {
    this.isEditing = false;
    this.resetEditForm();
    this.closeModal.emit();
  }

  onEditProfile() {
    this.isEditing = true;
  }

  onCancelEdit() {
    this.isEditing = false;
    this.resetEditForm();
  }

  onSaveProfile() {
    if (!this.editForm.nombreCompleto.trim() || !this.editForm.correo.trim()) {
      return;
    }

    this.isLoading = true;
    
    this.profileService.updateUserProfile(this.editForm).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.isEditing = false;
        this.isLoading = false;
        this.profileUpdated.emit(updatedProfile);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isLoading = false;
      }
    });
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getRolText(): string {
    if (!this.userProfile) return '';
    
    switch (this.userProfile.rol) {
      case 'administrador':
        return 'Administrador';
      case 'jefe_seccion':
        return `Jefe de Sección - ${this.userProfile.seccion}`;
      default:
        return this.userProfile.rol;
    }
  }
}

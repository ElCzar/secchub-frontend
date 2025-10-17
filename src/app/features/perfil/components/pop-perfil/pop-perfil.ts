import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserInformationResponseDTO } from '../../../../shared/model/dto/user/UserInformationResponseDTO.model';
import { UserInformationService } from '../../../../shared/services/user-information.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';

@Component({
  selector: 'app-pop-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pop-perfil.html',
  styleUrl: './pop-perfil.scss'
})
export class PopPerfilComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() userId?: number; // Si se proporciona, muestra el perfil de ese usuario
  @Output() closeModal = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<UserInformationResponseDTO>();

  userProfile: UserInformationResponseDTO | null = null;
  isEditing = false;
  editForm: {
    name: string;
    lastName: string;
    email: string;
    documentType: string;
    documentNumber: string;
  } = {
    name: '',
    lastName: '',
    email: '',
    documentType: '',
    documentNumber: ''
  };
  isLoading = false;
  canEdit = false;

  constructor(
    private readonly userInformationService: UserInformationService,
    private readonly authService: AuthStateService
  ) {}

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
      ? this.userInformationService.getUserInformationById(this.userId)
      : this.userInformationService.getUserInformation();

    profileObservable.subscribe({
      next: (profile: UserInformationResponseDTO | null) => {
        this.userProfile = profile;
        // Solo los administradores pueden editar su perfil (roleId 1 = admin)
        this.canEdit = profile?.roleId === 1 && this.isCurrentUserProfile();
        this.resetEditForm();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
      }
    });
  }

  private resetEditForm() {
    if (this.userProfile) {
      this.editForm = {
        name: this.userProfile.name,
        lastName: this.userProfile.lastName,
        email: this.userProfile.email,
        documentType: this.userProfile.documentType.toString(),
        documentNumber: this.userProfile.documentNumber
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
    if (!this.editForm.name.trim() || !this.editForm.lastName.trim() || !this.editForm.email.trim()) {
      return;
    }

    this.isLoading = true;
    
    // For now, just update the local profile since we don't have an update service
    // In a real implementation, you'd call a service to update the profile
    console.log('Profile update not implemented yet:', this.editForm);
    
    // Simulate update
    if (this.userProfile) {
      this.userProfile = {
        ...this.userProfile,
        name: this.editForm.name,
        lastName: this.editForm.lastName,
        email: this.editForm.email,
        documentType: Number.parseInt(this.editForm.documentType),
        documentNumber: this.editForm.documentNumber
      };
      this.isEditing = false;
      this.isLoading = false;
      this.profileUpdated.emit(this.userProfile);
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getRolText(): string {
    if (!this.userProfile) return '';
    
    switch (this.userProfile.roleId) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Jefe de Sección';
      default:
        return `Rol ID: ${this.userProfile.roleId}`;
    }
  }

  private isCurrentUserProfile(): boolean {
    // Si no se especifica userId, significa que está viendo su propio perfil
    // Los jefes de sección solo pueden ver su perfil, no editarlo
    return !this.userId;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInformationResponseDTO } from '../../../../shared/model/dto/user/UserInformationResponseDTO.model';

// Enhanced User interface for display
interface EnhancedUser extends UserInformationResponseDTO {
  roleName?: string;
  statusName?: string;
  documentTypeName?: string;
  sectionName?: string;
}

import { UserCardActions } from '../base/base-user-card.component';

@Component({
  selector: 'app-user-card-container',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './user-card-container.component.html',
  styleUrl: './user-card-container.component.scss'
})
export class UserCardContainerComponent {
  @Input() user!: EnhancedUser;
  @Input() actions: UserCardActions = {};
  @Input() showActions: boolean = true;
  @Input() loading: boolean = false;
  
  @Output() userSelected = new EventEmitter<EnhancedUser>();
  @Output() editUser = new EventEmitter<EnhancedUser>();
  @Output() deleteUser = new EventEmitter<EnhancedUser>();
  @Output() cardClick = new EventEmitter<EnhancedUser>();
  @Output() editClick = new EventEmitter<EnhancedUser>();
  @Output() deleteClick = new EventEmitter<EnhancedUser>();

  /**
   * Type guards para verificar el tipo de usuario basado en roleId
   */
  isTeacher(user: EnhancedUser): boolean {
    return user.roleId === 2; // Teacher role ID
  }

  isSectionHead(user: EnhancedUser): boolean {
    return user.roleId === 3; // Section Head role ID
  }

  isAdmin(user: EnhancedUser): boolean {
    return user.roleId === 1; // Admin role ID
  }

  /**
   * Métodos de casting seguro (adaptados para EnhancedUser)
   */
  asTeacher(user: EnhancedUser): EnhancedUser {
    return user;
  }

  asSectionHead(user: EnhancedUser): EnhancedUser {
    return user;
  }

  asAdmin(user: EnhancedUser): EnhancedUser {
    return user;
  }

  /**
   * Verifica si el tipo de usuario es conocido
   */
  isKnownUserType(user?: EnhancedUser): boolean {
    const userToCheck = user || this.user;
    return [1, 2, 3].includes(userToCheck.roleId); // Admin, Teacher, Section Head
  }

  /**
   * Obtiene el nombre completo del usuario para mostrar
   */
  getDisplayName(): string {
    if (!this.user) return 'Usuario desconocido';
    return `${this.user.name} ${this.user.lastName}`;
  }

  /**
   * Obtiene el rol del usuario como string
   */
  getUserRole(): string {
    return this.user?.roleName || 'UNKNOWN';
  }

  /**
   * Maneja el evento de clic en la tarjeta
   */
  onCardClick(user: EnhancedUser): void {
    this.cardClick.emit(user);
    this.userSelected.emit(user);
  }

  /**
   * Maneja el evento de clic en editar
   */
  onEditClick(user: EnhancedUser): void {
    this.editClick.emit(user);
    this.editUser.emit(user);
  }

  /**
   * Maneja el evento de clic en eliminar
   */
  onDeleteClick(user: EnhancedUser): void {
    this.deleteClick.emit(user);
    this.deleteUser.emit(user);
  }

  /**
   * Maneja la selección de usuario (método legacy)
   */
  onUserSelected(user: EnhancedUser): void {
    this.userSelected.emit(user);
  }

  /**
   * Maneja la edición de usuario (método legacy)
   */
  onEditUser(user: EnhancedUser): void {
    this.editUser.emit(user);
  }

  /**
   * Maneja la eliminación de usuario (método legacy)
   */
  onDeleteUser(user: EnhancedUser): void {
    this.deleteUser.emit(user);
  }
}
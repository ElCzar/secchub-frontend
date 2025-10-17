import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisteredUser, UserRole, UserStatus } from '../../models/user-registered.model';

/**
 * Interfaz para las acciones que puede realizar una card
 */
export interface UserCardActions {
  onView?: (user: RegisteredUser) => void;
  onEdit?: (user: RegisteredUser) => void;
  onDelete?: (user: RegisteredUser) => void;
  onActivate?: (user: RegisteredUser) => void;
  onDeactivate?: (user: RegisteredUser) => void;
}

/**
 * Componente base abstracto para todas las cards de usuario
 * Implementa funcionalidad común y define la estructura básica
 */
@Component({
  template: '',
  standalone: true,
  imports: [CommonModule]
})
export abstract class BaseUserCardComponent {
  @Input() user!: RegisteredUser;
  @Input() actions: UserCardActions = {};
  @Input() showActions: boolean = true;
  @Input() loading: boolean = false;
  @Output() userSelected = new EventEmitter<RegisteredUser>();
  @Output() editUser = new EventEmitter<RegisteredUser>();
  @Output() deleteUser = new EventEmitter<RegisteredUser>();

  /**
   * Maneja el clic en la card
   */
  onCardClick(): void {
    this.userSelected.emit(this.user);
    if (this.actions.onView) {
      this.actions.onView(this.user);
    }
  }

  /**
   * Maneja el clic en editar
   */
  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editUser.emit(this.user);
    if (this.actions.onEdit) {
      this.actions.onEdit(this.user);
    }
  }

  /**
   * Maneja el clic en eliminar
   */
  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteUser.emit(this.user);
    if (this.actions.onDelete) {
      this.actions.onDelete(this.user);
    }
  }

  /**
   * Obtiene el ícono del rol
   */
  getRoleIcon(role: UserRole): string {
    const icons = {
      [UserRole.ADMIN]: '⚙️',
      [UserRole.TEACHER]: '👩‍🏫',
      [UserRole.SECTION_HEAD]: '👔',
      [UserRole.STUDENT]: '🎓',
      [UserRole.PROGRAM]: '📚'
    };
    return icons[role] || '👤';
  }

  /**
   * Obtiene la etiqueta del rol
   */
  getRoleLabel(role: UserRole): string {
    const labels = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.TEACHER]: 'Docente',
      [UserRole.SECTION_HEAD]: 'Jefe de Sección',
      [UserRole.STUDENT]: 'Estudiante',
      [UserRole.PROGRAM]: 'Programa'
    };
    return labels[role] || role;
  }

  /**
   * Obtiene la etiqueta del estado
   */
  getStatusLabel(status: UserStatus): string {
    const labels = {
      [UserStatus.ACTIVE]: 'Activo',
      [UserStatus.INACTIVE]: 'Inactivo',
      [UserStatus.PENDING]: 'Pendiente',
      [UserStatus.SUSPENDED]: 'Suspendido'
    };
    return labels[status] || status;
  }

  /**
   * Obtiene la clase CSS del estado
   */
  getStatusClass(status: UserStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  /**
   * Formatea una fecha
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName(): string {
    return `${this.user.userInfo.name} ${this.user.userInfo.lastName}`;
  }

  /**
   * Verifica si el usuario está activo
   */
  isActive(): boolean {
    return this.user.status === UserStatus.ACTIVE;
  }
}
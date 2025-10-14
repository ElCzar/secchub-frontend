import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisteredUser, UserRole, UserRoleLabels } from '../../models/user-registered.model';

@Component({
  selector: 'app-cards-registrados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards-registrados.html',
  styleUrl: './cards-registrados.scss'
})
export class CardsRegistrados {
  @Input() users: RegisteredUser[] = [];
  @Input() loading: boolean = false;
  @Output() userSelected = new EventEmitter<RegisteredUser>();
  @Output() editUser = new EventEmitter<RegisteredUser>();
  @Output() deleteUser = new EventEmitter<RegisteredUser>();

  // Enums para usar en template
  UserRole = UserRole;

  onUserClick(user: RegisteredUser): void {
    this.userSelected.emit(user);
  }

  onEditUser(event: Event, user: RegisteredUser): void {
    event.stopPropagation();
    this.editUser.emit(user);
  }

  onDeleteUser(event: Event, user: RegisteredUser): void {
    event.stopPropagation();
    this.deleteUser.emit(user);
  }

  getRoleLabel(role: UserRole): string {
    return UserRoleLabels[role] || role;
  }

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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'activo' ? 'status-active' : 'status-inactive';
  }
}

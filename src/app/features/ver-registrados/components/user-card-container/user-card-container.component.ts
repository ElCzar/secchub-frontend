import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisteredUser, UserRole, Teacher, SectionHead, Admin } from '../../models';
import { UserCardActions } from '../base/base-user-card.component';

// Import all card components
import { TeacherCardComponent } from '../teacher-card/teacher-card.component';
import { SectionHeadCardComponent } from '../section-head-card/section-head-card.component';
import { AdminCardComponent } from '../admin-card/admin-card.component';

@Component({
  selector: 'app-user-card-container',
  standalone: true,
  imports: [
    CommonModule,
    TeacherCardComponent,
    SectionHeadCardComponent,
    AdminCardComponent
  ],
  templateUrl: './user-card-container.component.html',
  styleUrl: './user-card-container.component.scss'
})
export class UserCardContainerComponent {
  @Input() user!: RegisteredUser;
  @Input() actions: UserCardActions = {};
  @Input() showActions: boolean = true;
  @Input() loading: boolean = false;
  
  @Output() userSelected = new EventEmitter<RegisteredUser>();
  @Output() editUser = new EventEmitter<RegisteredUser>();
  @Output() deleteUser = new EventEmitter<RegisteredUser>();
  @Output() cardClick = new EventEmitter<RegisteredUser>();
  @Output() editClick = new EventEmitter<RegisteredUser>();
  @Output() deleteClick = new EventEmitter<RegisteredUser>();

  UserRole = UserRole;

  /**
   * Type guards para verificar el tipo de usuario
   */
  isTeacher(user: RegisteredUser): user is Teacher {
    return user.role === UserRole.TEACHER && 'teacherInfo' in user;
  }

  isSectionHead(user: RegisteredUser): user is SectionHead {
    return user.role === UserRole.SECTION_HEAD && 'sectionInfo' in user;
  }

  isAdmin(user: RegisteredUser): user is Admin {
    return user.role === UserRole.ADMIN;
  }

  /**
   * Métodos de casting seguro
   */
  asTeacher(user: RegisteredUser): Teacher {
    return user as Teacher;
  }

  asSectionHead(user: RegisteredUser): SectionHead {
    return user as SectionHead;
  }

  asAdmin(user: RegisteredUser): Admin {
    return user as Admin;
  }

  /**
   * Verifica si el tipo de usuario es conocido
   */
  isKnownUserType(user?: RegisteredUser): boolean {
    const userToCheck = user || this.user;
    return [
      UserRole.TEACHER,
      UserRole.SECTION_HEAD,
      UserRole.ADMIN,
      UserRole.STUDENT,
      UserRole.PROGRAM
    ].includes(userToCheck.role);
  }

  /**
   * Obtiene el nombre completo del usuario para mostrar
   */
  getDisplayName(): string {
    if (!this.user?.userInfo) return 'Usuario desconocido';
    return `${this.user.userInfo.name} ${this.user.userInfo.lastName}`;
  }

  /**
   * Obtiene el rol del usuario como string
   */
  getUserRole(): string {
    return this.user?.role || 'UNKNOWN';
  }

  /**
   * Maneja el evento de clic en la tarjeta
   */
  onCardClick(user: RegisteredUser): void {
    this.cardClick.emit(user);
    this.userSelected.emit(user);
  }

  /**
   * Maneja el evento de clic en editar
   */
  onEditClick(user: RegisteredUser): void {
    this.editClick.emit(user);
    this.editUser.emit(user);
  }

  /**
   * Maneja el evento de clic en eliminar
   */
  onDeleteClick(user: RegisteredUser): void {
    this.deleteClick.emit(user);
    this.deleteUser.emit(user);
  }

  /**
   * Maneja la selección de usuario (método legacy)
   */
  onUserSelected(user: RegisteredUser): void {
    this.userSelected.emit(user);
  }

  /**
   * Maneja la edición de usuario (método legacy)
   */
  onEditUser(user: RegisteredUser): void {
    this.editUser.emit(user);
  }

  /**
   * Maneja la eliminación de usuario (método legacy)
   */
  onDeleteUser(user: RegisteredUser): void {
    this.deleteUser.emit(user);
  }
}
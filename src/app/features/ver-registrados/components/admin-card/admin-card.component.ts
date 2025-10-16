/**
 * Componente para mostrar información de un administrador
 * Extiende la funcionalidad base de BaseUserCardComponent
 * y proporciona visualización específica para usuarios administradores
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseUserCardComponent } from '../base/base-user-card.component';
import { Admin, UserRole } from '../../models';

@Component({
  selector: 'app-admin-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-card.component.html',
  styleUrl: './admin-card.component.scss'
})
export class AdminCardComponent extends BaseUserCardComponent {
  /**
   * Usuario administrador a mostrar
   * Contiene información específica del rol de administrador
   */
  @Input() declare user: Admin;
  
  /**
   * Enum de roles disponible en el template
   */
  UserRole = UserRole;

  /**
   * Getter para acceso tipado a la información del administrador
   * @returns El usuario como tipo Admin con toda su información
   */
  get adminUser(): Admin {
    return this.user as Admin;
  }

  /**
   * Obtiene la etiqueta del nivel de administrador
   * @param level Nivel del administrador
   * @returns Etiqueta legible del nivel
   */
  getLevelLabel(level: string): string {
    const labels = {
      'super': 'Super Administrador',
      'admin': 'Administrador',
      'moderator': 'Moderador'
    };
    return labels[level as keyof typeof labels] || level;
  }

  /**
   * Obtiene la etiqueta del permiso
   * @param permission Permiso del administrador
   * @returns Etiqueta legible del permiso
   */
  getPermissionLabel(permission: string): string {
    const labels = {
      'manage_users': 'Gestionar Usuarios',
      'manage_courses': 'Gestionar Cursos',
      'manage_reports': 'Gestionar Reportes',
      'manage_system': 'Gestionar Sistema'
    };
    return labels[permission as keyof typeof labels] || permission;
  }
}
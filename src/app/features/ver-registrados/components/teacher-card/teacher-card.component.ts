/**
 * Componente para mostrar información de un docente
 * Extiende la funcionalidad base de BaseUserCardComponent
 * y proporciona visualización específica para docentes
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseUserCardComponent } from '../base/base-user-card.component';
import { Teacher, UserRole } from '../../models/user-registered.model';

@Component({
  selector: 'app-teacher-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-card.component.html',
  styleUrl: './teacher-card.component.scss'
})
export class TeacherCardComponent extends BaseUserCardComponent {
  /**
   * Usuario docente a mostrar
   * Debe incluir información específica del docente (teacherInfo)
   */
  @Input() declare user: Teacher;
  
  /**
   * Enum de roles disponible en el template
   */
  UserRole = UserRole;

  /**
   * Getter para acceso tipado a la información del docente
   * @returns El usuario como tipo Teacher con toda su información
   */
  get teacherUser(): Teacher {
    return this.user as Teacher;
  }
}
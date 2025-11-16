/**
 * Componente para mostrar información de un jefe de sección
 * Extiende la funcionalidad base de BaseUserCardComponent
 * y proporciona visualización específica para jefes de sección
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseUserCardComponent } from '../base/base-user-card.component';
import { SectionHead, UserRole } from '../../models/user-registered.model';

@Component({
  selector: 'app-section-head-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-head-card.component.html',
  styleUrl: './section-head-card.component.scss'
})
export class SectionHeadCardComponent extends BaseUserCardComponent {
  /**
   * Usuario jefe de sección a mostrar
   * Debe incluir información específica de la sección (sectionInfo)
   */
  @Input() declare user: SectionHead;
  
  /**
   * Enum de roles disponible en el template
   */
  UserRole = UserRole;

  /**
   * Getter para acceso tipado a la información del jefe de sección
   * @returns El usuario como tipo SectionHead con toda su información
   */
  get sectionHeadUser(): SectionHead {
    return this.user as SectionHead;
  }
}
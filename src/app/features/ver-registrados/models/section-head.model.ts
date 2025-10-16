import { User } from './user.model';

/**
 * Información específica de la sección
 */
export interface SectionInfo {
  id: number;
  name: string;
  userId: number;
  description?: string;
  createdDate?: string;
  updatedDate?: string;
}

/**
 * Jefe de sección completo con información de usuario
 */
export interface SectionHead extends User {
  sectionInfo: SectionInfo;
}
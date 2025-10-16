import { User } from './user.model';

/**
 * Información específica del docente
 */
export interface TeacherInfo {
  id: number;
  userId: number;
  employmentTypeId: number;
  employmentTypeName?: string;
  maxHours: number;
  createdDate?: string;
  updatedDate?: string;
}

/**
 * Docente completo con información de usuario
 */
export interface Teacher extends User {
  teacherInfo: TeacherInfo;
}
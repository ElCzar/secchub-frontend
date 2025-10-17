/**
 * Interfaces para usuarios registrados basadas en los DTOs del backend
 */

// Información básica del usuario (basado en UserRegisterRequestDTO)
export interface UserBasicInfo {
  id?: number;
  username: string;
  faculty: string;
  name: string;
  lastName: string;
  email: string;
  documentTypeId: string;
  documentNumber: string;
  createdDate?: string;
}

// Información del docente (basado en TeacherResponseDTO)
export interface TeacherInfo {
  id: number;
  userId: number;
  employmentTypeId: number;
  employmentTypeName?: string;
  maxHours: number;
}

// Información de la sección (basado en SectionResponseDTO)  
export interface SectionInfo {
  id: number;
  name: string;
  userId: number;
}

// Usuario completo con toda la información
export interface RegisteredUser {
  id: number;
  userInfo: UserBasicInfo;
  role: UserRole;
  teacherInfo?: TeacherInfo;
  sectionInfo?: SectionInfo;
  createdDate: string;
  status: string;
}

// Tipos de roles de usuario
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  SECTION_HEAD = 'section_head',
  STUDENT = 'student',
  PROGRAM = 'program'
}

// Para el mapeo de nombres de roles
export const UserRoleLabels = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.TEACHER]: 'Docente',
  [UserRole.SECTION_HEAD]: 'Jefe de Sección',
  [UserRole.STUDENT]: 'Estudiante',
  [UserRole.PROGRAM]: 'Programa'
};

// Filtros para búsqueda
export interface UserFilter {
  role?: UserRole;
  searchTerm?: string;
  faculty?: string;
  status?: string;
}

// Opciones de filtro
export interface FilterOption {
  id: string;
  name: string;
  count?: number;
}
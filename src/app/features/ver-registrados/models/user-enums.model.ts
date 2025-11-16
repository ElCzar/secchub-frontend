/**
 * Tipos de roles de usuario en el sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  SECTION_HEAD = 'section_head',
  STUDENT = 'student',
  PROGRAM = 'program'
}

/**
 * Mapeo de roles a etiquetas legibles
 */
export const UserRoleLabels = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.TEACHER]: 'Docente',
  [UserRole.SECTION_HEAD]: 'Jefe de Sección',
  [UserRole.STUDENT]: 'Estudiante',
  [UserRole.PROGRAM]: 'Programa'
};

/**
 * Estados posibles de un usuario
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

/**
 * Mapeo de estados a etiquetas legibles
 */
export const UserStatusLabels = {
  [UserStatus.ACTIVE]: 'Activo',
  [UserStatus.INACTIVE]: 'Inactivo',
  [UserStatus.PENDING]: 'Pendiente',
  [UserStatus.SUSPENDED]: 'Suspendido'
};
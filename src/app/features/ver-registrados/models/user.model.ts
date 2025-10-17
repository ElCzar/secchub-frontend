import { UserRole, UserStatus } from './user-enums.model';

/**
 * Información básica del usuario
 */
export interface UserBasicInfo {
  id: number;
  username: string;
  faculty: string;
  name: string;
  lastName: string;
  email: string;
  documentTypeId: string;
  documentNumber: string;
  createdDate?: string;
  updatedDate?: string;
}

/**
 * Usuario completo del sistema
 */
export interface User {
  id: number;
  userInfo: UserBasicInfo;
  role: UserRole;
  status: UserStatus;
  createdDate: string;
  updatedDate?: string;
  lastLoginDate?: string;
}
import { User } from './user.model';

/**
 * Administrador del sistema
 */
export interface Admin extends User {
  permissions?: string[];
  level?: 'super' | 'admin' | 'moderator';
}
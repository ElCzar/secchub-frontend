import { User } from './user.model';
import { Teacher } from './teacher.model';
import { SectionHead } from './section-head.model';
import { Admin } from './admin.model';
import { UserRole } from './user-enums.model';

/**
 * Unión de todos los tipos de usuarios registrados
 */
export type RegisteredUser = User | Teacher | SectionHead | Admin;

/**
 * Filtros para búsqueda de usuarios
 */
export interface UserFilter {
  role?: UserRole;
  searchTerm?: string;
  faculty?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Opciones de filtro con conteos
 */
export interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

/**
 * Resultado de búsqueda paginada
 */
export interface UserSearchResult {
  users: RegisteredUser[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}
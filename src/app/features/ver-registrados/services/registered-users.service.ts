import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';


// Importar los nuevos modelos y DTOs
import { 
  RegisteredUser, 
  UserFilter, 
  UserRole,
  UserStatus,
  FilterOption,
  Teacher,
  SectionHead,
  UserSearchResult
} from '../models/user-registered.model';

// Importar DTOs desde la nueva ubicación
import {
  TeacherResponseDTO
} from '../../../shared/model/dto/admin/TeacherResponseDTO.model';
import {
  SectionResponseDTO
} from '../../../shared/model/dto/admin/SectionResponseDTO.model';
import {
  UserInformationResponseDTO
} from '../../../shared/model/dto/user/UserInformationResponseDTO.model';

@Injectable({
  providedIn: 'root'
})
export class RegisteredUsersService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todos los usuarios registrados desde el backend
   */
  getAllRegisteredUsers(): Observable<RegisteredUser[]> {
    return forkJoin({
      users: this.getAllUsersInfo(),
      teachers: this.getAllTeachers(),
      sections: this.getAllSections()
    }).pipe(
      map(results => {
        const registeredUsers: RegisteredUser[] = [];
        
        // Crear un mapa de usuarios por ID para facilitar la búsqueda
        const usersMap = new Map<number, UserInformationResponseDTO>();
        for (const user of results.users) {
          usersMap.set(user.id, user);
        }
        
        // Procesar docentes
        for (const teacher of results.teachers) {
          const userInfo = usersMap.get(teacher.userId);
          if (userInfo) {
            const teacherUser: Teacher = {
              id: teacher.id,
              userInfo: {
                id: userInfo.id,
                username: userInfo.username,
                faculty: userInfo.faculty,
                name: userInfo.name,
                lastName: userInfo.lastName,
                email: userInfo.email,
                documentTypeId: userInfo.documentType.toString(),
                documentNumber: userInfo.documentNumber
              },
              role: UserRole.TEACHER,
              status: userInfo.statusId === 1 ? UserStatus.ACTIVE : UserStatus.INACTIVE,
              teacherInfo: {
                id: teacher.id,
                userId: teacher.userId,
                employmentTypeId: teacher.employmentTypeId,
                maxHours: teacher.maxHours
              }
            };
            registeredUsers.push(teacherUser);
          }
        }

        // Procesar jefes de sección
        for (const section of results.sections) {
          const userInfo = usersMap.get(section.userId);
          if (userInfo) {
            const sectionHeadUser: SectionHead = {
              id: section.id,
              userInfo: {
                id: userInfo.id,
                username: userInfo.username,
                faculty: userInfo.faculty,
                name: userInfo.name,
                lastName: userInfo.lastName,
                email: userInfo.email,
                documentTypeId: userInfo.documentType.toString(),
                documentNumber: userInfo.documentNumber
              },
              role: UserRole.SECTION_HEAD,
              status: userInfo.statusId === 1 ? UserStatus.ACTIVE : UserStatus.INACTIVE,
              sectionInfo: {
                id: section.id,
                name: section.name,
                userId: section.userId
              }
            };
            registeredUsers.push(sectionHeadUser);
          }
        }

        // Procesar administradores (usuarios que no son docentes ni jefes de sección)
        for (const user of results.users) {
          if (user.roleId === 1) { // Asumiendo que roleId 1 es admin
            const isTeacher = results.teachers.some(t => t.userId === user.id);
            const isSectionHead = results.sections.some(s => s.userId === user.id);
            
            if (!isTeacher && !isSectionHead) {
              const adminUser: RegisteredUser = {
                id: user.id,
                userInfo: {
                  id: user.id,
                  username: user.username,
                  faculty: user.faculty,
                  name: user.name,
                  lastName: user.lastName,
                  email: user.email,
                  documentTypeId: user.documentType.toString(),
                  documentNumber: user.documentNumber
                },
                role: UserRole.ADMIN,
                status: user.statusId === 1 ? UserStatus.ACTIVE : UserStatus.INACTIVE
              };
              registeredUsers.push(adminUser);
            }
          }
        }

        return registeredUsers;
      }),
      catchError(error => {
        console.error('Error al obtener usuarios registrados:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene todos los docentes del backend
   */
  private getAllTeachers(): Observable<TeacherResponseDTO[]> {
    return this.http.get<TeacherResponseDTO[]>(`${this.baseUrl}/admin/teachers`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener docentes:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene todas las secciones del backend
   */
  private getAllSections(): Observable<SectionResponseDTO[]> {
    return this.http.get<SectionResponseDTO[]>(`${this.baseUrl}/admin/sections`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener secciones:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene información de usuarios del backend
   */
  private getAllUsersInfo(): Observable<UserInformationResponseDTO[]> {
    return this.http.get<UserInformationResponseDTO[]>(`${this.baseUrl}/admin/users`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener información de usuarios:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: number): Observable<RegisteredUser | null> {
    return this.getAllRegisteredUsers().pipe(
      map(users => users.find(user => user.id === id) || null)
    );
  }

  /**
   * Get all users
   */
  getAllUsers(): Observable<RegisteredUser[]> {
    return this.http.get<RegisteredUser[]>(`${this.baseUrl}/user/all`);
  }

  /**
   * Búsqueda paginada de usuarios
   */
  searchUsers(filter: UserFilter, page: number = 1, pageSize: number = 10): Observable<UserSearchResult> {
    // Preparar parámetros para cuando el backend implemente la búsqueda
    const searchParams = {
      page: page.toString(),
      size: pageSize.toString(),
      ...(filter.role && { role: filter.role }),
      ...(filter.searchTerm && { search: filter.searchTerm }),
      ...(filter.faculty && { faculty: filter.faculty }),
      ...(filter.status && { status: filter.status })
    };
    
    console.log('Parámetros de búsqueda preparados:', searchParams);

    // Por ahora usamos el método local hasta que haya un endpoint de búsqueda
    return this.getAllRegisteredUsers().pipe(
      map(allUsers => {
        const filteredUsers = this.filterUsers(allUsers, filter);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        return {
          users: paginatedUsers,
          totalCount: filteredUsers.length,
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil(filteredUsers.length / pageSize)
        };
      })
    );
  }

  /**
   * Filtra usuarios según los criterios
   */
  filterUsers(users: RegisteredUser[], filter: UserFilter): RegisteredUser[] {
    return users.filter(user => {
      // Filtro por rol
      if (filter.role && user.role !== filter.role) {
        return false;
      }

      // Filtro por búsqueda (nombre, email, documento)
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesSearch = 
          user.userInfo.name.toLowerCase().includes(searchLower) ||
          user.userInfo.lastName.toLowerCase().includes(searchLower) ||
          user.userInfo.email.toLowerCase().includes(searchLower) ||
          user.userInfo.documentNumber.includes(searchLower) ||
          user.userInfo.username.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) {
          return false;
        }
      }

      // Filtro por facultad
      if (filter.faculty && user.userInfo.faculty !== filter.faculty) {
        return false;
      }

      // Filtro por estado
      if (filter.status && user.status.toString() !== filter.status) {
        return false;
      }

      return true;
    });
  }

  /**
   * Obtiene opciones de filtro disponibles
   */
  getFilterOptions(users: RegisteredUser[]): {
    roles: FilterOption[];
    faculties: FilterOption[];
    statuses: FilterOption[];
  } {
    // Contar roles
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contar facultades
    const facultyCounts = users.reduce((acc, user) => {
      acc[user.userInfo.faculty] = (acc[user.userInfo.faculty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contar estados
    const statusCounts = users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      roles: Object.entries(roleCounts).map(([role, count]) => ({
        id: role,
        name: this.getRoleLabel(role as UserRole),
        count
      })),
      faculties: Object.entries(facultyCounts).map(([faculty, count]) => ({
        id: faculty,
        name: faculty,
        count
      })),
      statuses: Object.entries(statusCounts).map(([status, count]) => ({
        id: status,
        name: this.getStatusLabel(status as UserStatus),
        count
      }))
    };
  }

  /**
   * Obtiene la etiqueta legible del rol
   */
  private getRoleLabel(role: UserRole): string {
    const labels = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.TEACHER]: 'Docente', 
      [UserRole.SECTION_HEAD]: 'Jefe de Sección',
      [UserRole.STUDENT]: 'Estudiante',
      [UserRole.PROGRAM]: 'Programa'
    };
    return labels[role] || role;
  }

  /**
   * Obtiene la etiqueta legible del estado
   */
  private getStatusLabel(status: UserStatus): string {
    const labels = {
      [UserStatus.ACTIVE]: 'Activo',
      [UserStatus.INACTIVE]: 'Inactivo',
      [UserStatus.PENDING]: 'Pendiente',
      [UserStatus.SUSPENDED]: 'Suspendido'
    };
    return labels[status] || status;
  }
}
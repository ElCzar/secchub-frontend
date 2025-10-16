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
  Teacher,
  SectionHead,
  FilterOption,
  UserSearchResult
} from '../models';

// Importar DTOs desde la nueva ubicación
import {
  TeacherResponseDTO,
  SectionResponseDTO,
  UserRegisterRequestDTO,
  TeacherCreateRequestDTO,
  SectionCreateRequestDTO
} from '../../../model/dto/registrados';

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
      teachers: this.getAllTeachers(),
      sections: this.getAllSections()
      // Note: Agregar endpoint para administradores cuando esté disponible en el backend
    }).pipe(
      map(results => {
        const users: RegisteredUser[] = [];
        
        // Procesar docentes
        results.teachers.forEach(teacher => {
          const teacherUser: Teacher = {
            id: teacher.id,
            userInfo: {
              id: teacher.userId,
              username: `teacher_${teacher.userId}`,
              faculty: 'Facultad por definir',
              name: `Docente ${teacher.id}`,
              lastName: 'Apellido',
              email: `docente${teacher.id}@universidad.edu.co`,
              documentTypeId: '1',
              documentNumber: `${1000000 + teacher.id}`,
              createdDate: teacher.createdDate
            },
            role: UserRole.TEACHER,
            status: UserStatus.ACTIVE,
            createdDate: teacher.createdDate || new Date().toISOString(),
            teacherInfo: {
              id: teacher.id,
              userId: teacher.userId,
              employmentTypeId: teacher.employmentTypeId,
              employmentTypeName: teacher.employmentTypeName,
              maxHours: teacher.maxHours,
              createdDate: teacher.createdDate,
              updatedDate: teacher.updatedDate
            }
          };
          users.push(teacherUser);
        });

        // Procesar jefes de sección
        results.sections.forEach(section => {
          const sectionHeadUser: SectionHead = {
            id: section.id,
            userInfo: {
              id: section.userId,
              username: `section_head_${section.userId}`,
              faculty: 'Facultad por definir',
              name: `Jefe Sección ${section.id}`,
              lastName: 'Apellido',
              email: `jefe${section.id}@universidad.edu.co`,
              documentTypeId: '1',
              documentNumber: `${2000000 + section.id}`,
              createdDate: section.createdDate
            },
            role: UserRole.SECTION_HEAD,
            status: UserStatus.ACTIVE,
            createdDate: section.createdDate || new Date().toISOString(),
            sectionInfo: {
              id: section.id,
              name: section.name,
              userId: section.userId,
              description: section.description,
              createdDate: section.createdDate,
              updatedDate: section.updatedDate
            }
          };
          users.push(sectionHeadUser);
        });

        return users;
      }),
      catchError(error => {
        console.error('Error al obtener usuarios registrados:', error);
        // En caso de error, devolver array vacío en lugar de datos mock
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
   * Crea un nuevo docente
   */
  createTeacher(teacherData: TeacherCreateRequestDTO): Observable<TeacherResponseDTO> {
    return this.http.post<TeacherResponseDTO>(`${this.baseUrl}/admin/teachers`, teacherData);
  }

  /**
   * Crea una nueva sección
   */
  createSection(sectionData: SectionCreateRequestDTO): Observable<SectionResponseDTO> {
    return this.http.post<SectionResponseDTO>(`${this.baseUrl}/admin/sections`, sectionData);
  }

  /**
   * Registra un nuevo usuario
   */
  registerUser(userData: UserRegisterRequestDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/register`, userData);
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
   * Actualiza un docente
   */
  updateTeacher(id: number, teacherData: Partial<TeacherCreateRequestDTO>): Observable<TeacherResponseDTO> {
    return this.http.put<TeacherResponseDTO>(`${this.baseUrl}/admin/teachers/${id}`, teacherData);
  }

  /**
   * Elimina un docente
   */
  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/teachers/${id}`);
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
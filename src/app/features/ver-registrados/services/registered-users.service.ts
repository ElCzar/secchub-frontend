import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { 
  RegisteredUser, 
  UserFilter, 
  UserRole, 
  TeacherInfo, 
  SectionInfo,
  FilterOption 
} from '../models/user-registered.model';

@Injectable({
  providedIn: 'root'
})
export class RegisteredUsersService {
  private readonly baseUrl = 'http://localhost:8080'; // Ajustar según configuración

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios registrados
   */
  getAllRegisteredUsers(): Observable<RegisteredUser[]> {
    // En un escenario real, habría un endpoint específico para esto
    // Por ahora simulamos combinando los endpoints existentes
    return forkJoin({
      teachers: this.getAllTeachers(),
      sections: this.getAllSections()
    }).pipe(
      map(results => {
        const users: RegisteredUser[] = [];
        
        // Procesar docentes
        results.teachers.forEach(teacher => {
          users.push({
            id: teacher.id,
            userInfo: {
              id: teacher.userId,
              username: `user_${teacher.userId}`, // En real vendría del backend
              faculty: 'Facultad por definir', // En real vendría del backend
              name: `Docente ${teacher.id}`, // En real vendría del backend
              lastName: 'Apellido', // En real vendría del backend
              email: `docente${teacher.id}@universidad.edu.co`, // En real vendría del backend
              documentTypeId: '1',
              documentNumber: `${1000000 + teacher.id}`
            },
            role: UserRole.TEACHER,
            teacherInfo: teacher,
            createdDate: new Date().toISOString(),
            status: 'Activo'
          });
        });

        // Procesar jefes de sección
        results.sections.forEach(section => {
          users.push({
            id: section.id,
            userInfo: {
              id: section.userId,
              username: `jefe_${section.userId}`,
              faculty: 'Facultad por definir',
              name: `Jefe ${section.id}`,
              lastName: 'Apellido',
              email: `jefe${section.id}@universidad.edu.co`,
              documentTypeId: '1',
              documentNumber: `${2000000 + section.id}`
            },
            role: UserRole.SECTION_HEAD,
            sectionInfo: section,
            createdDate: new Date().toISOString(),
            status: 'Activo'
          });
        });

        return users;
      }),
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return of(this.getMockUsers()); // Fallback a datos mock
      })
    );
  }

  /**
   * Obtiene todos los docentes del backend
   */
  private getAllTeachers(): Observable<TeacherInfo[]> {
    return this.http.get<TeacherInfo[]>(`${this.baseUrl}/admin/teachers`)
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
  private getAllSections(): Observable<SectionInfo[]> {
    return this.http.get<SectionInfo[]>(`${this.baseUrl}/sections`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener secciones:', error);
          return of([]);
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
      if (filter.status && user.status !== filter.status) {
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
        name: status,
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
   * Datos mock para desarrollo/fallback
   */
  private getMockUsers(): RegisteredUser[] {
    return [
      {
        id: 1,
        userInfo: {
          id: 1,
          username: 'jperez',
          faculty: 'Facultad de Ingeniería',
          name: 'Juan',
          lastName: 'Pérez',
          email: 'jperez@universidad.edu.co',
          documentTypeId: '1',
          documentNumber: '12345678'
        },
        role: UserRole.TEACHER,
        teacherInfo: {
          id: 1,
          userId: 1,
          employmentTypeId: 1,
          employmentTypeName: 'Tiempo Completo',
          maxHours: 40
        },
        createdDate: '2024-01-15T10:30:00Z',
        status: 'Activo'
      },
      {
        id: 2,
        userInfo: {
          id: 2,
          username: 'mgomez',
          faculty: 'Facultad de Ciencias',
          name: 'María',
          lastName: 'Gómez',
          email: 'mgomez@universidad.edu.co',
          documentTypeId: '1',
          documentNumber: '87654321'
        },
        role: UserRole.SECTION_HEAD,
        sectionInfo: {
          id: 1,
          name: 'Sección de Matemáticas',
          userId: 2
        },
        createdDate: '2024-01-20T14:15:00Z',
        status: 'Activo'
      },
      {
        id: 3,
        userInfo: {
          id: 3,
          username: 'admin',
          faculty: 'Administración',
          name: 'Carlos',
          lastName: 'Administrator',
          email: 'admin@universidad.edu.co',
          documentTypeId: '1',
          documentNumber: '11111111'
        },
        role: UserRole.ADMIN,
        createdDate: '2024-01-01T08:00:00Z',
        status: 'Activo'
      }
    ];
  }
}
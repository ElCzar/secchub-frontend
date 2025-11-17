import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface CourseDTO {
  id: number;  // BIGINT UNSIGNED del backend
  name: string;
  credits: number;
  description?: string;
  requirement?: string;
  isValid?: boolean;
  recommendation?: string;
  sectionId?: number;  // Relación con section
  sessionId?: number;  // Relación con session
  statusId?: number;   // Relación con status
}

export interface SectionDTO {
  id: number;  // BIGINT UNSIGNED
  name: string;
  userId?: number;  // Relación con users
}

export interface ClassDTO {
  id?: number;     // BIGINT UNSIGNED (opcional para creación)
  courseId: number;
  semesterId?: number;
  startDate?: string;  // DATE
  endDate?: string;    // DATE
  observation?: string;
  capacity?: number;
  statusId?: number;
}

export interface TeacherBasicDTO {
  id: number;  // BIGINT UNSIGNED
  userId?: number;
  employmentTypeId?: number;
  maxHours?: number;
  // Datos del usuario relacionado
  name?: string;
  lastName?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // Usar la ruta correcta del backend existente
  private readonly coursesUrl = `${environment.apiUrl}/courses`;
  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(
    private readonly http: HttpClient
  ) {}

  // ==========================================
  // GESTIÓN DE CURSOS
  // ==========================================

  /**
   * Obtener todos los cursos disponibles
   */
  getAllCourses(): Observable<CourseDTO[]> {
    return this.http.get<CourseDTO[]>(this.coursesUrl);
  }

  /**
   * Buscar cursos por término de búsqueda
   * Filtra localmente ya que el endpoint de búsqueda no está implementado
   */
  searchCourses(query: string): Observable<CourseDTO[]> {
    return this.getAllCourses().pipe(
      map(courses => {
        if (!query || !query.trim()) {
          return courses;
        }
        
        const searchTerm = query.toLowerCase().trim();
        return courses.filter(course => 
          course.name.toLowerCase().includes(searchTerm) ||
          course.id.toString().includes(searchTerm) ||
          (course.description && course.description.toLowerCase().includes(searchTerm))
        );
      })
    );
  }

  /**
   * Obtener curso por ID
   */
  getCourseById(courseId: string | number): Observable<CourseDTO | null> {
    return this.http.get<CourseDTO>(`${this.coursesUrl}/${courseId}`);
  }

  /**
   * Obtener cursos por área
   */
  getCoursesByArea(area: string): Observable<CourseDTO[]> {
    const params = new HttpParams().set('area', area);
    return this.http.get<CourseDTO[]>(this.coursesUrl, { params });
  }

  /**
   * Obtener cursos por ID de sección
   * Filtra todos los cursos para obtener solo los de una sección específica
   */
  getCoursesBySection(sectionId: number): Observable<CourseDTO[]> {
    return this.getAllCourses().pipe(
      map(courses => courses.filter(course => course.sectionId === sectionId))
    );
  }

  // ==========================================
  // GESTIÓN DE SECCIONES
  // ==========================================

  /**
   * Obtener secciones de un curso
   */
  getSectionsByCourse(courseId: string | number): Observable<SectionDTO[]> {
    return this.http.get<SectionDTO[]>(`${this.coursesUrl}/${courseId}/sections`);
  }

  /**
   * Obtener todas las secciones
   */
  getAllSections(): Observable<SectionDTO[]> {
    return this.http.get<SectionDTO[]>(`${this.apiUrl}/sections`);
  }

  /**
   * Obtener sección por ID
   */
  getSectionById(sectionId: number): Observable<SectionDTO> {
    return this.http.get<SectionDTO>(`${this.apiUrl}/sections/${sectionId}`);
  }

  /**
   * Crear nueva sección para un curso
   */
  createSection(courseId: string, sectionData: Partial<SectionDTO>): Observable<SectionDTO> {
    return this.http.post<SectionDTO>(`${this.coursesUrl}/${courseId}/sections`, sectionData);
  }

  // ==========================================
  // GESTIÓN BÁSICA DE PROFESORES
  // ==========================================

  /**
   * Obtener todos los profesores
   */
  getAllTeachers(): Observable<TeacherBasicDTO[]> {
    return this.http.get<TeacherBasicDTO[]>(`${this.apiUrl}/teachers`);
  }

  /**
   * Buscar profesores por nombre
   */
  searchTeachers(query: string): Observable<TeacherBasicDTO[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<TeacherBasicDTO[]>(`${this.apiUrl}/teachers/search`, { params });
  }

  /**
   * Obtener profesores por departamento
   */
  getTeachersByDepartment(department: string): Observable<TeacherBasicDTO[]> {
    const params = new HttpParams().set('department', department);
    return this.http.get<TeacherBasicDTO[]>(`${this.apiUrl}/teachers`, { params });
  }

  /**
   * Obtener profesor por ID
   */
  getTeacherById(teacherId: number): Observable<TeacherBasicDTO | null> {
    return this.http.get<TeacherBasicDTO>(`${this.apiUrl}/teachers/${teacherId}`);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Convertir CourseDTO a CourseOption para el frontend
   */
  convertCourseToOption(course: CourseDTO): { id: string; name: string } {
    return {
      id: course.id.toString(), // Convertir number a string para el frontend
      name: `${course.id} - ${course.name}`
    };
  }

  /**
   * Convertir múltiples cursos a opciones
   */
  convertCoursesToOptions(courses: CourseDTO[]): { id: string; name: string }[] {
    return courses.map(course => this.convertCourseToOption(course));
  }

  /**
   * Formatear nombre completo de profesor
   */
  formatTeacherName(teacher: TeacherBasicDTO): string {
    if (teacher.name && teacher.lastName) {
      return `${teacher.name} ${teacher.lastName}`.trim();
    }
    return `Profesor ${teacher.id}`;
  }

  /**
   * Filtrar profesores activos
   * Nota: Según el esquema, el estado activo está en la tabla users relacionada
   */
  filterActiveTeachers(teachers: TeacherBasicDTO[]): TeacherBasicDTO[] {
    // Por ahora retornamos todos, ya que el filtro de activo está en users.status_id
    return teachers;
  }

  /**
   * Filtrar cursos válidos
   */
  filterValidCourses(courses: CourseDTO[]): CourseDTO[] {
    return courses.filter(course => course.isValid !== false);
  }
}

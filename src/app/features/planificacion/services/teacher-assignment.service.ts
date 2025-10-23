import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface TeacherAssignmentDTO {
  id?: number;
  teacherId: number;
  classId: number;
  workHours: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  observation?: string;
  createdDate?: string;
  responseDate?: string;
  extraHours?: number;
}

export interface TeacherDTO {
  id: number;
  name: string;
  lastName: string;
  email?: string;
  maxHours: number;
  assignedHours: number;
  availableHours: number;
  extraHours?: number;
  contractType?: string;
  assignments?: TeacherAssignmentDTO[];
}

export interface ClassDTO {
  id?: number;
  courseName: string;
  courseId: string;
  section: string;
  classId: string;
  startDate: string;
  endDate: string;
  weeks: number;
  status: string;
  capacity?: number;
  semesterId?: number;
  notes?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TeacherAssignmentService {
  private readonly baseUrl = `${environment.apiUrl}/api/teacher-assignments`;

  constructor(private readonly http: HttpClient) {}

  // ==========================================
  // GESTIÓN DE ASIGNACIONES
  // ==========================================

  /**
   * Asignar un docente a una clase académica
   */
  assignTeacherToClass(
    teacherId: number, 
    classId: number, 
    workHours: number, 
    observation?: string
  ): Observable<TeacherDTO> {
    const params = new HttpParams()
      .set('teacherId', teacherId.toString())
      .set('classId', classId.toString())
      .set('workHours', workHours.toString())
      .set('observation', observation || '');

    return this.http.post<TeacherDTO>(`${this.baseUrl}/assign`, null, { params });
  }

  /**
   * Actualizar una asignación existente
   */
  updateAssignment(
    assignmentId: number, 
    workHours: number, 
    observation?: string
  ): Observable<TeacherDTO> {
    const params = new HttpParams()
      .set('workHours', workHours.toString())
      .set('observation', observation || '');

    return this.http.put<TeacherDTO>(`${this.baseUrl}/${assignmentId}`, null, { params });
  }

  /**
   * Eliminar una asignación
   */
  removeAssignment(assignmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${assignmentId}`);
  }

  /**
   * Eliminar una asignación de profesor a clase específica
   */
  removeTeacherFromClass(teacherId: number, classId: number): Observable<void> {
    console.log(`🗑️ Eliminando asignación: teacherId=${teacherId}, classId=${classId}`);
    const url = `${environment.apiUrl}/teachers/classes/teacher/${teacherId}/class/${classId}`;
    return this.http.delete<void>(url).pipe(
      tap(() => console.log(`✅ Asignación eliminada exitosamente`)),
      catchError(error => {
        console.error(`❌ Error eliminando asignación:`, error);
        throw error;
      })
    );
  }

  // ==========================================
  // CONSULTAS DE ASIGNACIONES
  // ==========================================

  /**
   * Obtener profesores asignados a una clase
   */
  getTeachersAssignedToClass(classId: number): Observable<TeacherDTO[]> {
    // Usar el endpoint real del módulo de integración que ya incluye datos del teacher
    const integrationUrl = `${environment.apiUrl}/teachers/classes/class/${classId}`;
    return this.http.get<any[]>(integrationUrl).pipe(
      map((teacherClassList: any[]) => {
        return teacherClassList.map(tc => ({
          id: tc.teacherId,
          name: tc.teacherName || 'Docente',
          lastName: tc.teacherLastName || '',
          email: tc.teacherEmail || '',
          maxHours: tc.teacherMaxHours || 40,
          assignedHours: tc.workHours || 0,
          availableHours: (tc.teacherMaxHours || 40) - (tc.workHours || 0),
          extraHours: tc.fullTimeExtraHours || tc.adjunctExtraHours || 0,
          contractType: tc.teacherContractType || 'N/A'
        }));
      }),
      tap(teachers => console.log(`👨‍🏫 Docentes asignados desde backend (con nombres):`, teachers)),
      catchError(error => {
        console.error(`❌ Error obteniendo docentes de clase ${classId}:`, error);
        return of([]); // Retornar array vacío en caso de error
      })
    );
  }

  /**
   * Obtener clases asignadas a un profesor
   */
  getClassesAssignedToTeacher(teacherId: number): Observable<ClassDTO[]> {
    return this.http.get<ClassDTO[]>(`${this.baseUrl}/teacher/${teacherId}/classes`);
  }

  /**
   * Obtener profesores disponibles para una clase
   */
  getAvailableTeachersForClass(classId: number, requiredHours: number): Observable<TeacherDTO[]> {
    const params = new HttpParams().set('requiredHours', requiredHours.toString());
    return this.http.get<TeacherDTO[]>(`${this.baseUrl}/class/${classId}/available-teachers`, { params });
  }

  // ==========================================
  // GESTIÓN DE DECISIONES (HU17)
  // ==========================================

  /**
   * Profesor acepta una asignación
   */
  acceptAssignment(assignmentId: number, observation?: string): Observable<TeacherDTO> {
    const params = new HttpParams().set('observation', observation || '');
    return this.http.post<TeacherDTO>(`${this.baseUrl}/${assignmentId}/accept`, null, { params });
  }

  /**
   * Profesor rechaza una asignación
   */
  rejectAssignment(assignmentId: number, observation?: string): Observable<TeacherDTO> {
    const params = new HttpParams().set('observation', observation || '');
    return this.http.post<TeacherDTO>(`${this.baseUrl}/${assignmentId}/reject`, null, { params });
  }

  /**
   * Obtener asignaciones pendientes de un profesor
   */
  getPendingAssignments(teacherId: number): Observable<TeacherDTO[]> {
    return this.http.get<TeacherDTO[]>(`${this.baseUrl}/teacher/${teacherId}/pending`);
  }

  /**
   * Actualizar el nombre del profesor asignado a una clase
   */
  updateTeacherNameForClass(
    classId: number, 
    teacherId: number, 
    name: string, 
    lastName: string
  ): Observable<TeacherDTO> {
    const params = new HttpParams()
      .set('name', name)
      .set('lastName', lastName);

    return this.http.put<TeacherDTO>(`${this.baseUrl}/class/${classId}/teacher/${teacherId}/name`, null, { params });
  }

  /**
   * Cambiar el docente asignado a una clase
   */
  changeTeacherForClass(
    classId: number, 
    newTeacherId: number, 
    workHours: number, 
    observation?: string
  ): Observable<TeacherDTO> {
    const params = new HttpParams()
      .set('newTeacherId', newTeacherId.toString())
      .set('workHours', workHours.toString())
      .set('observation', observation || '');

    return this.http.put<TeacherDTO>(`${this.baseUrl}/class/${classId}/teacher`, null, { params });
  }

  // ==========================================
  // REPORTES Y ESTADÍSTICAS
  // ==========================================

  /**
   * Obtener reporte de carga horaria por profesor
   */
  getWorkloadReport(): Observable<TeacherDTO[]> {
    return this.http.get<TeacherDTO[]>(`${this.baseUrl}/workload-report`);
  }

  /**
   * Obtener estadísticas generales de asignaciones
   */
  getAssignmentStatistics(): Observable<{ [key: string]: any }> {
    return this.http.get<{ [key: string]: any }>(`${this.baseUrl}/statistics`);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PARA EL FRONTEND
  // ==========================================

  /**
   * Convertir TeacherDTO a formato esperado por el frontend
   */
  formatTeacherForDisplay(teacher: TeacherDTO): { id: string; name: string } {
    return {
      id: teacher.id.toString(),
      name: `${teacher.name} ${teacher.lastName}`.trim()
    };
  }

  /**
   * Calcular horas disponibles de un docente
   */
  calculateAvailableHours(teacher: TeacherDTO): number {
    return teacher.maxHours - teacher.assignedHours;
  }

  /**
   * Verificar si un docente tiene capacidad para más horas
   */
  hasCapacityForHours(teacher: TeacherDTO, requiredHours: number): boolean {
    return this.calculateAvailableHours(teacher) >= requiredHours;
  }

  /**
   * Obtener el estado de asignación en formato legible
   */
  getAssignmentStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'ACCEPTED': 'Aceptado',
      'REJECTED': 'Rechazado'
    };
    return statusLabels[status] || 'Desconocido';
  }

  /**
   * Filtrar docentes por disponibilidad de horas
   */
  filterTeachersByAvailability(teachers: TeacherDTO[], requiredHours: number): TeacherDTO[] {
    return teachers.filter(teacher => this.hasCapacityForHours(teacher, requiredHours));
  }

  /**
   * Ordenar docentes por horas disponibles (descendente)
   */
  sortTeachersByAvailability(teachers: TeacherDTO[]): TeacherDTO[] {
    return teachers.sort((a, b) => this.calculateAvailableHours(b) - this.calculateAvailableHours(a));
  }
}

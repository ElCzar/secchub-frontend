import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// Interfaces para el servicio de docentes
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
  assignments?: TeacherAssignment[];
  // Campos adicionales para la interfaz de docentes
  subjects?: string[];
  semesters?: string[];
  classes?: TeacherClass[];
  observaciones?: string[];
}

export interface TeacherAssignment {
  id: number;
  classId: number;
  workHours: number;
  status: string;
  className?: string;
  courseName?: string;
}

export interface TeacherClass {
  materia: string;
  seccion: string;
  semestre: string;
  horarios: string[];
  numeroClases: number;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private baseUrl = `${environment.apiUrl}/api/teacher-assignments`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los docentes con su información completa
   */
  getAllTeachers(): Observable<TeacherDTO[]> {
    // Primero intentar el nuevo endpoint con información completa
    return this.http.get<TeacherDTO[]>(`${this.baseUrl}/teachers`).pipe(
      catchError(() => {
        console.warn('🔄 /teachers no disponible, usando /api/planning/teachers/available como fallback');
  return this.http.get<any[]>(`${environment.apiUrl}/api/planning/teachers/available?requiredHours=0`).pipe(
          map(list => (list || []).map(item => ({
            id: Number(item.id),
            name: item.name || item.firstName || '',
            lastName: item.lastName || item.last || '',
            email: item.email || undefined,
            maxHours: Number(item.maxHours || 0),
            assignedHours: Number(item.assignedHours || 0),
            availableHours: Number(item.availableHours || (item.maxHours ? (item.maxHours - (item.assignedHours || 0)) : 0)),
            extraHours: Number(item.extraHours || 0),
            contractType: item.contractType || undefined,
            assignments: item.assignments || []
          } as TeacherDTO))))
      })
    );
  }

  /**
   * Obtener docentes disponibles para una clase específica
   */
  getAvailableTeachers(classId: number, requiredHours: number): Observable<TeacherDTO[]> {
    const params = new HttpParams().set('requiredHours', requiredHours.toString());
    return this.http.get<TeacherDTO[]>(`${this.baseUrl}/class/${classId}/available-teachers`, { params });
  }

  /**
   * Obtener docente por ID (usando workload report y filtrando)
   */
  getTeacherById(teacherId: number): Observable<TeacherDTO> {
    return this.getAllTeachers().pipe(
      map(teachers => teachers.find(teacher => teacher.id === teacherId)),
      map(teacher => {
        if (!teacher) {
          throw new Error(`Docente con ID ${teacherId} no encontrado`);
        }
        return teacher;
      })
    );
  }

  /**
   * Obtener profesores asignados a una clase
   */
  getTeachersAssignedToClass(classId: number): Observable<TeacherDTO[]> {
    return this.http.get<TeacherDTO[]>(`${this.baseUrl}/class/${classId}/teachers`);
  }

  /**
   * Asignar un docente a una clase
   */
  assignTeacherToClass(teacherId: number, classId: number, workHours: number, observation?: string): Observable<TeacherDTO> {
    let params = new HttpParams()
      .set('teacherId', teacherId.toString())
      .set('classId', classId.toString())
      .set('workHours', workHours.toString());
    
    if (observation) {
      params = params.set('observation', observation);
    }

    return this.http.post<TeacherDTO>(`${this.baseUrl}/assign`, null, { params });
  }

  /**
   * Cambiar el docente asignado a una clase
   */
  changeTeacherForClass(classId: number, newTeacherId: number, workHours: number, observation?: string): Observable<TeacherDTO> {
    let params = new HttpParams()
      .set('newTeacherId', newTeacherId.toString())
      .set('workHours', workHours.toString());
    
    if (observation) {
      params = params.set('observation', observation);
    }

    return this.http.put<TeacherDTO>(`${this.baseUrl}/class/${classId}/teacher`, null, { params });
  }

  /**
   * Buscar docentes por nombre (filtrado local)
   */
  searchTeachers(searchTerm: string): Observable<TeacherDTO[]> {
    return this.getAllTeachers().pipe(
      map(teachers => teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.lastName && teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
      ))
    );
  }

  /**
   * Filtrar docentes por criterios (filtrado local)
   */
  filterTeachers(filters: {
    minAvailableHours?: number;
    contractType?: string;
  }): Observable<TeacherDTO[]> {
    return this.getAllTeachers().pipe(
      map(teachers => teachers.filter(teacher => {
        let matches = true;
        
        if (filters.minAvailableHours && teacher.availableHours < filters.minAvailableHours) {
          matches = false;
        }
        
        if (filters.contractType && teacher.contractType !== filters.contractType) {
          matches = false;
        }
        
        return matches;
      }))
    );
  }
}

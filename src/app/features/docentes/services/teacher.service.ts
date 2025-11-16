import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
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
    // Información adicional del usuario
    userId?: number;
    documentType?: string;
    documentNumber?: string;
    phoneNumber?: string;
    address?: string;
}

export interface UserInformationResponseDTO {
    id: number;
    username: string;
    name: string;
    lastName: string;
    email: string;
    faculty?: string | null;
    statusId?: number;
    roleId?: number;
    documentTypeId?: number;
    documentType?: string;
    documentNumber?: string;
    phoneNumber?: string;
    address?: string;
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
    private readonly baseUrl = `${environment.apiUrl}/teachers`;
    private readonly userUrl = `${environment.apiUrl}/user`;

    constructor(private readonly http: HttpClient) {}

    /**
     * Obtener todos los docentes con su información completa
     */
    getAllTeachers(): Observable<TeacherDTO[]> {
        // Primero obtener los docentes básicos
        return this.http.get<any[]>(`${this.baseUrl}/min-hours/1`).pipe(
        switchMap(teacherList => {
            if (!teacherList || teacherList.length === 0) {
                return of([]);
            }

            // Mapear docentes básicos
            const basicTeachers = teacherList.map(item => ({
                id: Number(item.id),
                userId: Number(item.userId || item.id),
                name: item.name || item.firstName || item.fullName || '',
                lastName: item.lastName || item.last || '',
                email: item.email || undefined,
                maxHours: Number(item.maxHours || 0),
                assignedHours: Number(item.assignedHours || 0),
                availableHours: Number(item.availableHours || (item.maxHours ? (item.maxHours - (item.assignedHours || 0)) : 0)),
                extraHours: Number(item.extraHours || 0),
                contractType: item.contractType || undefined,
                assignments: item.assignments || []
            } as TeacherDTO));

            // Crear un array de observables para obtener la información de usuario de cada docente
            const userInfoRequests = basicTeachers.map(teacher => {
                console.log(`Obteniendo información de usuario para teacherId: ${teacher.id}, userId: ${teacher.userId}`);
                return this.getUserInformation(teacher.userId!).pipe(
                    map(userInfo => {
                        console.log(`✅ Información obtenida para userId ${teacher.userId}:`, userInfo);
                        return {
                            ...teacher,
                            name: userInfo.name + ' ' + userInfo.lastName || teacher.name || 'Sin nombre',
                            email: userInfo.email || teacher.email,
                            documentType: userInfo.documentType,
                            documentNumber: userInfo.documentNumber,
                            phoneNumber: userInfo.phoneNumber,
                            address: userInfo.address
                        } as TeacherDTO;
                    }),
                    catchError(error => {
                        console.error(`❌ Error obteniendo información para userId ${teacher.userId}:`, error);
                        return of({
                            ...teacher,
                            name: teacher.name || 'Sin nombre',
                            lastName: teacher.lastName || ''
                        } as TeacherDTO);
                    })
                );
            });

            // Ejecutar todas las peticiones en paralelo
            return forkJoin(userInfoRequests);
            }),
            catchError(error => {
            console.error('Error loading teachers:', error);
            return of([]);
            })
        );
    }

  /**
   * Obtener información de usuario por ID
   */
  private getUserInformation(userId: number): Observable<UserInformationResponseDTO> {
    return this.http.get<UserInformationResponseDTO>(`${this.userUrl}/id/${userId}`);
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

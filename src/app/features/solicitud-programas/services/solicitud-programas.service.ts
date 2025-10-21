import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SolicitudDto {
  id: string | number;
  program: string;
  materia: string;
  cupos: number;
  startDate: string;
  endDate: string;
  comments?: string;
  // Optional schedules attached to the solicitud
  schedules?: Array<any>;
}

export interface AcademicRequestResponseDTO {
  id: number;
  userId: number;
  courseId: number;
  semesterId: number;
  startDate: string;
  endDate: string;
  capacity: number;
  requestDate: string;
  observation: string;
  schedules: RequestScheduleResponseDTO[];
  
  // Campos enriquecidos desde el backend
  userName?: string;        // Nombre completo del usuario
  courseName?: string;      // Nombre del curso
  programName?: string;     // Nombre del programa
}

export interface RequestScheduleResponseDTO {
  id: number;
  academicRequestId: number;
  classRoomTypeId: number;
  startTime: string;
  endTime: string;
  day: string;
  modalityId: number;
  disability: boolean;
}

export interface Course {
  id: number;
  name: string;
  sectionId: number;
  sectionName?: string;
}

@Injectable({ providedIn: 'root' })
export class SolicitudProgramasService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private readonly http: HttpClient) {}

  // Obtiene solicitudes académicas del semestre actual desde el backend
  getRequestsForSection(): Observable<SolicitudDto[]> {
    return this.http.get<AcademicRequestResponseDTO[]>(`${this.baseUrl}/academic-requests/current-semester`).pipe(
      map(academicRequests => {
        if (!academicRequests || academicRequests.length === 0) {
          return [];
        }
        return academicRequests.map(request => this.mapAcademicRequestToSolicitud(request));
      }),
      catchError(error => {
        if (error.status === 404) {
          return of([]);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Devuelve el array sin mapear tal como viene del backend. Útil cuando el consumidor
   * necesita trabajar con el DTO original (AcademicRequestResponseDTO).
   */
  getRawAcademicRequests(): Observable<AcademicRequestResponseDTO[]> {
    return this.http.get<AcademicRequestResponseDTO[]>(`${this.baseUrl}/academic-requests/current-semester`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of([] as AcademicRequestResponseDTO[]);
        }
        return throwError(() => error);
      })
    );
  }

  // Envía las combinaciones y solicitudes al backend para su procesamiento
  applyRequests(payload: any): Observable<any> {
    console.log('📤 Enviando solicitudes procesadas al backend:', payload);
    
    // Preparar el payload para el backend
    const backendPayload = {
      combinedRequests: payload.combined || [],
      individualRequests: payload.individual || []
    };

    return this.http.post<any>(`${this.baseUrl}/academic-requests/process-planning`, backendPayload).pipe(
      catchError(error => {
        console.error('❌ Error procesando solicitudes:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtiene información del curso por ID para mapear correctamente
  private getCourse(courseId: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/api/admin/courses/${courseId}`).pipe(
      catchError(error => {
        console.error(`❌ Error obteniendo curso ${courseId}:`, error);
        // Retornar un curso por defecto en caso de error
        return throwError(() => ({ id: courseId, name: 'Materia Desconocida', sectionId: 1, sectionName: 'Sección Desconocida' }));
      })
    );
  }

  // Mapea AcademicRequestResponseDTO a SolicitudDto
  private mapAcademicRequestToSolicitud(request: AcademicRequestResponseDTO): SolicitudDto {
    console.log('🔄 Mapeando solicitud académica:', request);
    console.log('📋 Horarios en la solicitud:', request.schedules);
    
    return {
      id: request.id,
      program: request.programName || `Usuario ID: ${request.userId}`, // Usar programName si está disponible
      materia: request.courseName || `Curso ID: ${request.courseId}`, // Usar courseName si está disponible  
      cupos: request.capacity,
      startDate: request.startDate,
      endDate: request.endDate,
      comments: request.observation || 'Sin observaciones',
      schedules: this.mapRequestSchedulesToSolicitudSchedules(request.schedules || [])
    };
  }

  // 🔧 NUEVO MÉTODO: Mapear horarios desde el backend al formato de solicitud
  private mapRequestSchedulesToSolicitudSchedules(schedules: RequestScheduleResponseDTO[]): any[] {
    console.log('🔄 Mapeando horarios del backend:', schedules);
    
    if (!schedules || schedules.length === 0) {
      console.log('⚠️ No hay horarios en la solicitud del backend');
      return [];
    }

    return schedules.map((schedule, index) => {
  // Usar únicamente la convención 'classRoomTypeId' (R mayúscula)
  const typeId = (schedule as any).classRoomTypeId;
      const mappedSchedule = {
        day: this.mapDayToSpanish(schedule.day),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        disability: schedule.disability || false,
        modality: this.mapModalityIdToName(schedule.modalityId),
        roomType: this.mapClassRoomTypeIdToName(typeId)
      };

      console.log(`📅 Horario ${index + 1} mapeado:`, {
        backend: schedule,
        frontend: mappedSchedule
      });

      return mappedSchedule;
    });
  }

  // Mapea IDs de modalidad a nombres legibles
  private mapModalityIdToName(modalityId: number): string {
    switch (modalityId) {
      case 1: return 'PRESENCIAL';
      case 2: return 'VIRTUAL';
      case 3: return 'HÍBRIDA';
      default: return 'DESCONOCIDA';
    }
  }

  // Mapea IDs de tipo de aula a nombres legibles
  private mapClassRoomTypeIdToName(classRoomTypeId: number): string {
    switch (classRoomTypeId) {
      case 1: return 'Aulas';
      case 2: return 'Laboratorio';
      case 3: return 'Auditorio';
      default: return 'Aula General';
    }
  }

  // Mapea días en inglés a español
  private mapDayToSpanish(day: string): string {
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'LUN',
      'TUESDAY': 'MAR',
      'WEDNESDAY': 'MIE',
      'THURSDAY': 'JUE',
      'FRIDAY': 'VIE',
      'SATURDAY': 'SAB',
      'SUNDAY': 'DOM'
    };
    
    console.log(`🔄 Mapeando día del backend: "${day}" → "${dayMap[day?.toUpperCase()] || day}"`);
    return dayMap[day?.toUpperCase()] || day;
  }
}

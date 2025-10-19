import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Interfaces que coinciden con el modelo del backend de acuerdo con
 * los controllers mostrados (ClassroomController, ClassroomTypeController, ModalityController)
 */
export interface ClassroomDTO {
  id: number;
  room?: string;     // Nombre del aula según el backend
  name: string;      // Para compatibilidad con el frontend
  capacity: number;
  campus?: string;
  building: string;
  floor: string | number;
  hasProjector?: boolean;
  hasAccessibility?: boolean;
  accessibility?: boolean; // Para compatibilidad
  type?: ClassroomTypeDTO | string;
}

export interface ModalityDTO {
  id: number;
  name: string;
  description?: string;
}

export interface ClassroomTypeDTO {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private apiUrl = `${environment.apiUrl}`;
  // Prefijo real para endpoints paramétricos (modalities, classroom-types)
  private parametricUrl = `${environment.apiUrl}/parametric`;
  
  // Valores por defecto para cuando la API falla
  private defaultModalities: ModalityDTO[] = [
    { id: 1, name: 'In-Person' },
    { id: 2, name: 'Online' },
    { id: 3, name: 'Hybrid' }
  ];
  
  private defaultClassroomTypes: ClassroomTypeDTO[] = [
    { id: 1, name: 'Lecture' },
    { id: 2, name: 'Lab' },
    { id: 3, name: 'Auditorium' }
  ];
  
  // Mapa para visualización de modalidades
  private modalityDisplayNames: Record<string, string> = {
    'In-Person': 'Presencial',
    'Online': 'Virtual',
    'Hybrid': 'Híbrido'
  };
  
  // Mapa para visualización de tipos de aula
  private roomTypeDisplayNames: Record<string, string> = {
    'Lecture': 'Aula Regular',
    'Lab': 'Laboratorio',
    'Auditorium': 'Auditorio'
  };
  
  private defaultClassrooms: ClassroomDTO[] = [
    { id: 1, name: 'A-201', room: 'A-201', capacity: 30, building: 'A', floor: '2', hasProjector: true, hasAccessibility: false },
    { id: 2, name: 'B-101', room: 'B-101', capacity: 25, building: 'B', floor: '1', hasProjector: true, hasAccessibility: true },
    { id: 3, name: 'C-303', room: 'C-303', capacity: 40, building: 'C', floor: '3', hasProjector: true, hasAccessibility: false },
    { id: 4, name: 'Lab-A', room: 'Lab-A', capacity: 20, building: 'D', floor: '1', hasProjector: true, hasAccessibility: false }
  ];

  constructor(private http: HttpClient) {}
  
  /**
   * Devuelve un conjunto de modalidades por defecto cuando la API falla
   */
  private getFallbackModalities(): ModalityDTO[] {
    console.log('Usando modalidades por defecto', this.defaultModalities);
    return [...this.defaultModalities];
  }
  
  /**
   * Devuelve un conjunto de tipos de aula por defecto cuando la API falla
   */
  private getFallbackClassroomTypes(): ClassroomTypeDTO[] {
    console.log('Usando tipos de aula por defecto', this.defaultClassroomTypes);
    return [...this.defaultClassroomTypes];
  }
  
  /**
   * Devuelve un conjunto de aulas por defecto cuando la API falla
   */
  private getFallbackClassrooms(): ClassroomDTO[] {
    console.log('Usando aulas por defecto', this.defaultClassrooms);
    return [...this.defaultClassrooms];
  }

  /**
   * Obtiene todas las aulas disponibles desde el backend
   * Endpoint: GET /api/classrooms
   */
  getAllClassrooms(): Observable<ClassroomDTO[]> {
    return this.http.get<ClassroomDTO[]>(`${this.apiUrl}/classrooms`).pipe(
      map(classrooms => {
        if (!classrooms || !Array.isArray(classrooms)) {
          console.error('Formato de respuesta inválido para aulas:', classrooms);
          return this.getFallbackClassrooms();
        }
        
        // Normalizar los datos para compatibilidad con el frontend
        return classrooms.map(classroom => ({
          ...classroom,
          name: classroom.room || classroom.name || `Aula ${classroom.id}`,
          // Asegurar que accessibility sea booleano
          accessibility: classroom.hasAccessibility || classroom.accessibility || false
        }));
      }),
      catchError(error => {
        console.error('Error al obtener aulas:', error);
        console.log('Usando aulas por defecto debido al error');
        return of(this.getFallbackClassrooms());
      })
    );
  }

  /**
   * Obtiene un aula por su ID
   * Endpoint: GET /api/classrooms/{id}
   */
  getClassroomById(id: number): Observable<ClassroomDTO> {
    return this.http.get<ClassroomDTO>(`${this.apiUrl}/classrooms/${id}`).pipe(
      map(classroom => {
        // Normalizar los datos para compatibilidad con el frontend
        return {
          ...classroom,
          name: classroom.room || classroom.name || `Aula ${classroom.id}`,
          accessibility: classroom.hasAccessibility || classroom.accessibility || false
        };
      }),
      catchError(error => {
        console.error(`Error al obtener aula ${id}:`, error);
        return throwError(() => new Error(`Error al obtener aula: ${error.message || 'Error de servidor'}`));
      })
    );
  }

  /**
   * Obtiene todas las modalidades disponibles desde el backend
   * Endpoint real: GET /v1/api/parametric/modalities
   */
  getAllModalities(): Observable<ModalityDTO[]> {
  const url = `${this.parametricUrl}/modalities`;
  return this.http.get<ModalityDTO[]>(url).pipe(
      map(modalities => {
        if (!modalities || !Array.isArray(modalities)) {
          console.error('Formato de respuesta inválido para modalidades:', modalities);
          return this.getFallbackModalities();
        }
        console.log('Modalidades cargadas desde backend:', modalities);
        return modalities;
      }),
      catchError(error => {
        console.error('Error al obtener modalidades:', error);
        console.log('Usando modalidades por defecto debido al error');
        return of(this.getFallbackModalities());
      })
    );
  }

  /**
   * Variante estricta: no usa valores por defecto; devuelve [] en error
   */
  getAllModalitiesStrict(): Observable<ModalityDTO[]> {
  const url = `${this.parametricUrl}/modalities`;
  return this.http.get<ModalityDTO[]>(url).pipe(
      map(modalities => Array.isArray(modalities) ? modalities : []),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene todos los tipos de aula disponibles desde el backend
   * Endpoint real: GET /v1/api/parametric/classroom-types
   */
  getAllClassroomTypes(): Observable<ClassroomTypeDTO[]> {
  const url = `${this.parametricUrl}/classroom-types`;
  return this.http.get<ClassroomTypeDTO[]>(url).pipe(
      map(types => {
        if (!types || !Array.isArray(types)) {
          console.error('Formato de respuesta inválido para tipos de aula:', types);
          return this.getFallbackClassroomTypes();
        }
        console.log('Tipos de aula cargados desde backend:', types);
        return types;
      }),
      catchError(error => {
        console.error('Error al obtener tipos de aula:', error);
        console.log('Usando tipos de aula por defecto debido al error');
        return of(this.getFallbackClassroomTypes());
      })
    );
  }
  
  /**
   * Variante estricta: no usa valores por defecto; devuelve [] en error
   */
  getAllClassroomTypesStrict(): Observable<ClassroomTypeDTO[]> {
  const url = `${this.parametricUrl}/classroom-types`;
  return this.http.get<ClassroomTypeDTO[]>(url).pipe(
      map(types => Array.isArray(types) ? types : []),
      catchError(() => of([]))
    );
  }
  
  /**
   * Busca aulas por nombre
   * Endpoint: GET /api/classrooms/search?name={name}
   */
  searchClassroomsByName(name: string): Observable<ClassroomDTO[]> {
    return this.http.get<ClassroomDTO[]>(`${this.apiUrl}/classrooms/search?name=${name}`).pipe(
      map(classrooms => {
        if (!classrooms || !Array.isArray(classrooms)) {
          return [];
        }
        return classrooms.map(classroom => ({
          ...classroom,
          name: classroom.room || classroom.name || `Aula ${classroom.id}`
        }));
      }),
      catchError(error => {
        console.error(`Error al buscar aulas con nombre "${name}":`, error);
        return throwError(() => new Error(`Error al buscar aulas: ${error.message || 'Error de servidor'}`));
      })
    );
  }
  
  /**
   * Obtiene aulas por campus
   * Endpoint: GET /api/classrooms/campus/{campus}
   */
  getClassroomsByCampus(campus: string): Observable<ClassroomDTO[]> {
    return this.http.get<ClassroomDTO[]>(`${this.apiUrl}/classrooms/campus/${campus}`).pipe(
      map(classrooms => {
        if (!classrooms || !Array.isArray(classrooms)) {
          return [];
        }
        return classrooms.map(classroom => ({
          ...classroom,
          name: classroom.room || classroom.name || `Aula ${classroom.id}`
        }));
      }),
      catchError(error => {
        console.error(`Error al obtener aulas del campus ${campus}:`, error);
        return throwError(() => new Error(`Error al obtener aulas del campus: ${error.message || 'Error de servidor'}`));
      })
    );
  }
  
  /**
   * Obtiene aulas disponibles para un horario específico
   * Endpoint: GET /api/classrooms/available
   */
  getAvailableClassrooms(
    day: string,
    startTime: string,
    endTime: string,
    minCapacity?: number
  ): Observable<ClassroomDTO[]> {
    let params = new HttpParams()
      .set('day', day)
      .set('startTime', startTime)
      .set('endTime', endTime);

    if (minCapacity !== undefined) {
      params = params.set('minCapacity', minCapacity.toString());
    }

    return this.http.get<ClassroomDTO[]>(`${this.apiUrl}/classrooms/available`, { params }).pipe(
      map(classrooms => {
        if (!classrooms || !Array.isArray(classrooms)) {
          return [];
        }
        return classrooms.map(classroom => ({
          ...classroom,
          name: classroom.room || classroom.name || `Aula ${classroom.id}`
        }));
      }),
      catchError(error => {
        console.error('Error al obtener aulas disponibles:', error);
        return throwError(() => new Error(`Error al obtener aulas disponibles: ${error.message || 'Error de servidor'}`));
      })
    );
  }

  /**
   * Mapea el nombre de una modalidad a su ID correspondiente de acuerdo con
   * ModalityController del backend
   */
  mapModalityNameToId(modalityName: string): number | undefined {
    // Los mapeos están basados en los endpoints /api/modalities
    // Estos valores deben coincidir con los IDs en la base de datos
    const modalityMap: { [key: string]: number } = {
      'Presencial': 1,
      'In-Person': 1,
      'Virtual': 2,
      'Online': 2,
      'Híbrido': 3,
      'Hibrido': 3,
      'Hybrid': 3
    };
    
    const result = modalityMap[modalityName];
    if (result === undefined) {
      console.warn(`Modalidad no reconocida para mapeo a ID: "${modalityName}"`);
    }
    
    return result;
  }

  /**
   * Mapea el ID de modalidad a su nombre estandarizado en el frontend
   */
  mapModalityIdToFrontendName(modalityId: number): string {
    // Convertimos los IDs del backend a los valores usados en el frontend
    switch (modalityId) {
      case 1: return 'In-Person';
      case 2: return 'Online';
      case 3: return 'Hybrid';
      default:
        console.warn(`ID de modalidad no reconocido: ${modalityId}, usando 'In-Person' por defecto`);
        return 'In-Person';
    }
  }
  
  /**
   * Mapea el ID de modalidad a su nombre en español según el backend
   */
  mapModalityIdToBackendName(modalityId: number): string {
    // Estos valores coinciden con los nombres en el backend según ModalityController
    switch (modalityId) {
      case 1: return 'Presencial';
      case 2: return 'Virtual';
      case 3: return 'Híbrido';
      default:
        console.warn(`ID de modalidad no reconocido: ${modalityId}, usando 'Presencial' por defecto`);
        return 'Presencial';
    }
  }
  
  /**
   * Retorna el nombre para mostrar en la interfaz de una modalidad
   */
  getModalityDisplayName(modalityValue: string): string {
    return this.modalityDisplayNames[modalityValue] || modalityValue;
  }
  
  /**
   * Retorna el nombre para mostrar en la interfaz de un tipo de aula
   */
  getRoomTypeDisplayName(roomTypeValue: string): string {
    return this.roomTypeDisplayNames[roomTypeValue] || roomTypeValue;
  }

  /**
   * Mapea el nombre de un tipo de aula a su ID correspondiente de acuerdo con
   * ClassroomTypeController del backend
   */
  mapRoomTypeNameToId(roomTypeName: string): number | undefined {
    // Los mapeos están basados en los endpoints /api/classroom-types
    const roomTypeMap: { [key: string]: number } = {
      'Lecture': 1,
      'Aula Regular': 1, 
      'Lab': 2,
      'Laboratorio': 2,
      'Auditorium': 3,
      'Auditorio': 3
    };
    
    const result = roomTypeMap[roomTypeName];
    if (result === undefined) {
      console.warn(`Tipo de aula no reconocido para mapeo a ID: "${roomTypeName}"`);
    }
    
    return result;
  }
  
  /**
   * Mapea el ID de tipo de aula a su nombre estandarizado en el frontend
   */
  mapRoomTypeIdToFrontendName(roomTypeId: number): string {
    // Convertimos los IDs del backend a los valores usados en el frontend
    switch (roomTypeId) {
      case 1: return 'Lecture';
      case 2: return 'Lab';
      case 3: return 'Auditorium';
      default:
        console.warn(`ID de tipo de aula no reconocido: ${roomTypeId}, usando 'Lecture' por defecto`);
        return 'Lecture';
    }
  }

  /**
   * Verifica la disponibilidad de un aula en un horario específico
   * Esta funcionalidad podría estar implementada como parte del endpoint /api/classrooms/available
   */
  checkClassroomAvailability(
    classroomId: number,
    day: string,
    startTime: string,
    endTime: string
  ): Observable<boolean> {
    // Construimos los parámetros para la consulta según PlanningController
    const params = new HttpParams()
      .set('day', day)
      .set('startTime', startTime)
      .set('endTime', endTime);
    
    // Este endpoint debe ser implementado en el backend o usar el endpoint de aulas disponibles
    return this.http.get<{available: boolean}>(`${this.apiUrl}/classrooms/${classroomId}/availability`, { params }).pipe(
      map(response => {
        if (response && typeof response.available === 'boolean') {
          return response.available;
        }
        return false;
      }),
      catchError(error => {
        console.error(`Error al verificar disponibilidad de aula ${classroomId}:`, error);
        return of(false); // Asumimos que no está disponible en caso de error
      })
    );
  }
  
  /**
   * Convierte los nombres de días del formato del frontend al formato del backend
   * Usado para enviar datos al endpoint /api/planning/classes/{classId}/schedules
   */
  mapDayToBackendFormat(frontendDay: string): string {
    // Mapeo entre abreviaturas del frontend y los valores esperados por el backend
    const dayMap: { [key: string]: string } = {
      'LUN': 'Monday',
      'MAR': 'Tuesday',
      'MIE': 'Wednesday',
      'JUE': 'Thursday',
      'VIE': 'Friday',
      'SAB': 'Saturday',
      'DOM': 'Sunday'
    };
    
    const result = dayMap[frontendDay];
    if (result === undefined) {
      console.warn(`Día no reconocido para mapeo al formato del backend: "${frontendDay}", usando "Monday" por defecto`);
      return 'Monday';
    }
    
    return result;
  }
  
  /**
   * Convierte los nombres de días del formato del backend al formato del frontend
   * Usado para recibir datos del endpoint /api/planning/classes/{classId}/schedules
   */
  mapDayToFrontendFormat(backendDay: string): string {
    // Mapeo entre valores del backend y abreviaturas del frontend
    // ⚠️ CORREGIDO: Manejar tanto formato "Monday" como "MONDAY"
    const dayMap: { [key: string]: string } = {
      // Formato Title Case (Monday, Tuesday, etc.)
      'Monday': 'LUN',
      'Tuesday': 'MAR',
      'Wednesday': 'MIE',
      'Thursday': 'JUE',
      'Friday': 'VIE',
      'Saturday': 'SAB',
      'Sunday': 'DOM',
      // Formato UPPER CASE (MONDAY, TUESDAY, etc.)
      'MONDAY': 'LUN',
      'TUESDAY': 'MAR',
      'WEDNESDAY': 'MIE',
      'THURSDAY': 'JUE',
      'FRIDAY': 'VIE',
      'SATURDAY': 'SAB',
      'SUNDAY': 'DOM'
    };
    
    const result = dayMap[backendDay];
    if (result === undefined) {
      console.warn(`Día no reconocido para mapeo al formato del frontend: "${backendDay}", usando "LUN" por defecto`);
      return 'LUN';
    }
    
    return result;
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, switchMap, catchError, forkJoin, of } from 'rxjs';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment';
import { PlanningRow, PlanningStatus } from '../models/planificacion.models';
import { CourseService } from './course.service';
import { ClassroomService } from './classroom.service';

export interface ClassDTO {
  id?: number;           // BIGINT UNSIGNED (opcional para creación)
  courseId: number;      // BIGINT UNSIGNED - relación con course
  courseName?: string;   // Nombre del curso (viene del JOIN con course)
  courseDescription?: string; // Descripción del curso
  courseCredits?: number; // Créditos del curso
  semesterId?: number;   // BIGINT UNSIGNED - relación con semester
  semesterPeriod?: number; // Período del semestre (1 o 2)
  semesterYear?: number;   // Año del semestre
  startDate?: string;    // DATE - fecha de inicio
  endDate?: string;      // DATE - fecha de fin
  observation?: string;  // TEXT - observaciones
  capacity?: number;     // INT - capacidad
  statusId?: number;     // BIGINT UNSIGNED - relación con status
  statusName?: string;   // Nombre del estado
  section?: number;      // ID de la sección académica
  sectionName?: string;  // Nombre de la sección académica
  schedules?: ClassScheduleDTO[]; // Lista de horarios
  teachers?: TeacherDTO[]; // Lista de profesores
  
  // Campos calculados/derivados para el frontend (compatibilidad)
  weeks?: number;        // Calculado entre startDate y endDate
  status?: string;       // Alias para statusName
  notes?: string[];      // Derivado de observation
}

export interface ClassScheduleDTO {
  id?: number;
  classId: number;
  day: string;
  startTime: string;
  endTime: string;
  classroomId?: number;
  classroomName?: string;
  classroomLocation?: string;
  classroomRoom?: string;
  classroomCampus?: string;
  classroomCapacity?: number;
  classroomTypeName?: string;
  modalityId?: number;
  modalityName?: string;
  disability?: boolean;
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
  assignments?: any[];
}

export interface CourseOption {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private readonly baseUrl = `${environment.apiUrl}/api/planning`;

  constructor(
    private readonly http: HttpClient,
    private readonly courseService: CourseService,
    private readonly classroomService: ClassroomService
  ) {}

  // ==========================================
  // GESTIÓN DE CLASES ACADÉMICAS
  // ==========================================

  /**
   * Crear una nueva clase académica
   * Endpoint: POST /api/planning/classes
   */
  createClass(classData: ClassDTO): Observable<ClassDTO> {
    console.log('=== CREANDO NUEVA CLASE EN BACKEND ===');
    console.log('Datos a enviar:', classData);
    console.log('URL completa:', `${this.baseUrl}/classes`);
    
    // Asegurar que los datos están en el formato esperado por el backend
    const preparedData = this.prepareClassDataForBackend(classData);
    
    return this.http.post<ClassDTO>(`${this.baseUrl}/classes`, preparedData).pipe(
      tap(response => {
        console.log('=== RESPUESTA DE CREACIÓN ===');
        console.log('Clase creada exitosamente:', response);
      }),
      catchError(error => {
        console.error('=== ERROR EN CREACIÓN ===');
        console.error('Error al crear clase:', error);
        console.error('Status:', error.status);
        console.error('Mensaje:', error.message);
        console.error('Body:', error.error);
        throw error;
      })
    );
  }

  /**
   * Obtener todas las clases CON HORARIOS INCLUIDOS del semestre actual
   * Nota: Este método automáticamente filtra por semestre actual desde el backend
   */
  getAllClassesWithSchedules(): Observable<ClassDTO[]> {
    return this.getAllClasses().pipe(
      switchMap(classes => {
        console.log('=== CARGANDO HORARIOS PARA CADA CLASE ===');
        console.log('Clases base:', classes);
        
        if (classes.length === 0) {
          return of([]);
        }
        
        // Para cada clase, cargar sus horarios
        const classesWithSchedules$ = classes.map(classItem => {
          if (!classItem.id) {
            // Si no tiene ID, retornar la clase sin horarios
            return of({ ...classItem, schedules: [] });
          }
          
          return this.getClassSchedules(classItem.id).pipe(
            map(schedules => {
              console.log(`Horarios cargados para clase ${classItem.id}:`, schedules);
              return { ...classItem, schedules };
            }),
            catchError(error => {
              console.warn(`Error al cargar horarios para clase ${classItem.id}:`, error);
              // En caso de error, retornar la clase sin horarios
              return of({ ...classItem, schedules: [] });
            })
          );
        });
        
        return forkJoin(classesWithSchedules$);
      }),
      tap(classesWithSchedules => {
        console.log('=== CLASES CON HORARIOS CARGADOS ===');
        console.log('Clases con horarios:', classesWithSchedules);
        classesWithSchedules.forEach((classItem, index) => {
          console.log(`Clase ${index} (ID: ${classItem.id}):`, {
            courseName: classItem.courseName,
            schedules: classItem.schedules,
            numberOfSchedules: classItem.schedules?.length || 0
          });
        });
      })
    );
  }

  /**
   * Obtener todas las clases del semestre actual
   */
  getAllClasses(): Observable<ClassDTO[]> {
    return this.http.get<ClassDTO[]>(`${this.baseUrl}/classes/current-semester`).pipe(
      tap(classes => {
        console.log('=== RESPUESTA CRUDA DEL BACKEND ===');
        console.log('Clases recibidas del semestre ACTUAL:', classes);
        console.log('Número de clases:', classes.length);
        
        console.log('=== ANÁLISIS DETALLADO DE FECHAS ===');
        classes.forEach((cls, index) => {
          console.log(`--- CLASE ${index + 1} ---`);
          console.log('ID:', cls.id);
          console.log('CourseID:', cls.courseId);
          console.log('CourseName:', cls.courseName);
          console.log('StartDate valor:', cls.startDate);
          console.log('StartDate tipo:', typeof cls.startDate);
          console.log('StartDate es null?', cls.startDate === null);
          console.log('StartDate es undefined?', cls.startDate === undefined);
          console.log('EndDate valor:', cls.endDate);
          console.log('EndDate tipo:', typeof cls.endDate);
          console.log('EndDate es null?', cls.endDate === null);
          console.log('EndDate es undefined?', cls.endDate === undefined);
          console.log('Capacity:', cls.capacity);
          console.log('Objeto completo:', cls);
          console.log('JSON.stringify:', JSON.stringify(cls));
          console.log('------------------------');
        });
      }),
      // Enriquecer con información de cursos faltante
      switchMap(classes => {
        console.log('=== ENRIQUECIENDO CON DATOS DE CURSOS ===');
        
        // Obtener IDs únicos de cursos
        const uniqueCourseIds = [...new Set(classes.map(cls => cls.courseId))];
        console.log('Cursos únicos a buscar:', uniqueCourseIds);
        
        // Si no hay clases, devolver array vacío
        if (uniqueCourseIds.length === 0) {
          return of([]);
        }
        
        // Obtener información de todos los cursos necesarios
        const courseRequests = uniqueCourseIds.map(courseId => 
          this.courseService.getCourseById(courseId).pipe(
            catchError(error => {
              console.warn(`Error obteniendo curso ${courseId}:`, error);
              return of(null); // Si falla, continuar con null
            })
          )
        );
        
        // Combinar todas las peticiones de cursos
        return forkJoin(courseRequests).pipe(
          map(courses => {
            console.log('Cursos obtenidos:', courses);
            
            // Crear mapa courseId -> courseData
            const courseMap = new Map();
            courses.forEach((course, index) => {
              if (course) {
                courseMap.set(uniqueCourseIds[index], course);
              }
            });
            
            // Enriquecer las clases con información de curso
            const enrichedClasses = classes.map(cls => {
              const course = courseMap.get(cls.courseId);
              const enriched = {
                ...cls,
                courseName: course?.name || course?.courseName || `Curso ${cls.courseId}`,
                sectionName: cls.sectionName || course?.section || 'Sin sección'
              };
              
              console.log(`Enriqueciendo clase ${cls.id}:`, {
                original: cls,
                course: course,
                enriched: enriched
              });
              
              return enriched;
            });
            
            console.log('=== CLASES FINALES ENRIQUECIDAS ===');
            console.log('Clases enriquecidas:', enrichedClasses);
            return enrichedClasses;
          })
        );
      })
    );
  }

  /**
   * Obtener clases por semestre
   */
  getClassesBySemester(semesterId: number): Observable<ClassDTO[]> {
    return this.http.get<ClassDTO[]>(`${this.baseUrl}/classes/semester/${semesterId}`);
  }

  /**
   * Actualizar clase académica existente
   */
  updateClass(classId: number, classData: ClassDTO): Observable<ClassDTO> {
    return this.http.put<ClassDTO>(`${this.baseUrl}/classes/${classId}`, classData);
  }

  /**
   * Eliminar clase académica
   */
  deleteClass(classId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/classes/${classId}`);
  }

  /**
   * Obtener información de una clase específica
   */
  getClassById(classId: number): Observable<ClassDTO> {
    return this.http.get<ClassDTO>(`${this.baseUrl}/classes/${classId}`);
  }

  /**
   * Validar clase antes de crear/actualizar
   */
  validateClass(classData: ClassDTO): Observable<{ valid: boolean; message: string; conflicts: any[] }> {
    return this.http.post<{ valid: boolean; message: string; conflicts: any[] }>(`${this.baseUrl}/classes/validate`, classData);
  }

  // ==========================================
  // GESTIÓN DE HORARIOS
  // ==========================================

  /**
   * Prepara los datos de una clase para enviarlos al backend
   * Formatea fechas, asegura los tipos correctos y mapea los valores
   */
  private prepareClassDataForBackend(classData: ClassDTO): ClassDTO {
    // Copia para no modificar el original
    const preparedData = { ...classData };

    // Asegurar formato de fechas (YYYY-MM-DD)
    if (preparedData.startDate && typeof preparedData.startDate === 'string') {
      const date = new Date(preparedData.startDate);
      if (!isNaN(date.getTime())) {
        preparedData.startDate = date.toISOString().split('T')[0];
      }
    }

    if (preparedData.endDate && typeof preparedData.endDate === 'string') {
      const date = new Date(preparedData.endDate);
      if (!isNaN(date.getTime())) {
        preparedData.endDate = date.toISOString().split('T')[0];
      }
    }

    // Asegurar que courseId sea numérico
    if (preparedData.courseId && typeof preparedData.courseId === 'string') {
      preparedData.courseId = parseInt(preparedData.courseId as any, 10);
    }

    // Asegurar que capacity sea numérico
    if (preparedData.capacity && typeof preparedData.capacity === 'string') {
      preparedData.capacity = parseInt(preparedData.capacity as any, 10);
    }

    return preparedData;
  }

  /**
   * Prepara los datos de un horario para enviarlos al backend
   * Mapea días, modalidades y asegura los tipos correctos
   */
  private prepareScheduleDataForBackend(scheduleData: ClassScheduleDTO): ClassScheduleDTO {
    // Copia para no modificar el original
    const preparedData = { ...scheduleData };

    // Mapear día a formato esperado por el backend (Monday, Tuesday, etc.)
    if (preparedData.day && ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].includes(preparedData.day)) {
      preparedData.day = this.classroomService.mapDayToBackendFormat(preparedData.day);
    }

    // Asegurar que modalityId sea numérico
    if (preparedData.modalityName && !preparedData.modalityId) {
      preparedData.modalityId = this.classroomService.mapModalityNameToId(preparedData.modalityName);
    }

    // Asegurar que todos los campos numéricos sean realmente números
    if (preparedData.classroomId && typeof preparedData.classroomId === 'string') {
      preparedData.classroomId = parseInt(preparedData.classroomId as any, 10);
    }

    if (preparedData.modalityId && typeof preparedData.modalityId === 'string') {
      preparedData.modalityId = parseInt(preparedData.modalityId as any, 10);
    }

    // Asegurar que disability sea un booleano
    preparedData.disability = Boolean(preparedData.disability);

    return preparedData;
  }

  /**
   * Asignar horario a una clase académica
   * Endpoint: POST /api/planning/classes/{classId}/schedules
   */
  assignScheduleToClass(classId: number, scheduleData: ClassScheduleDTO): Observable<ClassScheduleDTO> {
    console.log('=== ASIGNANDO HORARIO A CLASE ===');
    console.log('ID de clase:', classId);
    console.log('Datos originales:', scheduleData);
    
    // Preparar los datos para el backend
    const preparedData = this.prepareScheduleDataForBackend(scheduleData);
    console.log('Datos preparados para backend:', preparedData);
    
    return this.http.post<ClassScheduleDTO>(`${this.baseUrl}/classes/${classId}/schedules`, preparedData).pipe(
      switchMap(response => {
        // Si el backend ya devolvió el nombre del aula, devolver tal cual
        if (response.classroomRoom) {
          return of(response);
        }

        // Si solo devolvió classroomId, intentar enriquecer con el nombre
        if (response.classroomId) {
          return this.classroomService.getClassroomById(Number(response.classroomId)).pipe(
            map(classroom => ({ ...response, classroomRoom: classroom.name, classroomName: classroom.name } as ClassScheduleDTO)),
            catchError(err => {
              console.warn('No se pudo obtener aula para enriquecer respuesta de creación:', err);
              return of(response);
            })
          );
        }

        return of(response);
      }),
      tap(response => {
        console.log('=== HORARIO ASIGNADO EXITOSAMENTE ===');
        console.log('Respuesta enriquecida:', response);
      }),
      catchError(error => {
        console.error('=== ERROR AL ASIGNAR HORARIO ===');
        console.error('Error:', error);
        console.error('Status:', error.status);
        console.error('Mensaje:', error.message);
        console.error('Body:', error.error);
        throw new Error(`Error al asignar horario: ${error.message || 'Error desconocido'}`);
      })
    );
  }

  /**
   * Obtener todos los horarios de una clase
   * Endpoint: GET /api/planning/classes/{classId}/schedules
   */
  getClassSchedules(classId: number): Observable<ClassScheduleDTO[]> {
    console.log(`=== OBTENIENDO HORARIOS DE CLASE ${classId} ===`);
    
    return this.http.get<ClassScheduleDTO[]>(`${this.baseUrl}/classes/${classId}/schedules`).pipe(
      // Enriquecer cada schedule con el nombre del aula si el backend solo devuelve classroomId
      switchMap(schedules => {
        console.log(`Horarios obtenidos para clase ${classId}:`, schedules);

        if (!schedules || schedules.length === 0) {
          return of([] as ClassScheduleDTO[]);
        }

        // Mejor: obtener todas las aulas una sola vez y mapear localmente por ID
        return this.classroomService.getAllClassrooms().pipe(
          map(classrooms => {
            const classroomMap = new Map<number, string>();
            classrooms.forEach(c => classroomMap.set(c.id, c.name));

            // Normalizar los datos para compatibilidad con el frontend
            return schedules.map(schedule => ({
              ...schedule,
              // Convertir día del formato backend (Monday) a frontend (LUN)
              day: this.classroomService.mapDayToFrontendFormat(schedule.day),
              // Mapear modalidad para el frontend (usar modalityName o mapear modalityId)
              modality: schedule.modalityName || this.classroomService.mapModalityIdToFrontendName(schedule.modalityId || 1),
              // Mapear información del aula para el frontend usando el mapa local
              room: schedule.classroomRoom || (schedule.classroomId ? (classroomMap.get(Number(schedule.classroomId)) || '') : ''),
              classroomRoom: schedule.classroomRoom || (schedule.classroomId ? (classroomMap.get(Number(schedule.classroomId)) || '') : ''),
              // Mapear tipo de aula para el frontend
              roomType: schedule.classroomTypeName
            } as ClassScheduleDTO));
          }),
          catchError(err => {
            console.warn('Error cargando aulas para enriquecimiento:', err);
            // Fallback: mapear sin enriquecimiento
            return of(schedules.map(schedule => ({
              ...schedule,
              day: this.classroomService.mapDayToFrontendFormat(schedule.day),
              modality: schedule.modalityName || this.classroomService.mapModalityIdToFrontendName(schedule.modalityId || 1),
              room: schedule.classroomRoom || '',
              roomType: schedule.classroomTypeName
            } as ClassScheduleDTO)));
          })
        );
      }),
      tap(schedules => {
        console.log(`Horarios normalizados para clase ${classId}:`, schedules);
      }),
      catchError(error => {
        console.error(`=== ERROR AL OBTENER HORARIOS DE CLASE ${classId} ===`);
        console.error('Error:', error);
        console.error('Status:', error.status);
        console.error('Mensaje:', error.message);
        return of([] as ClassScheduleDTO[]);
      })
    );
  }

  /**
   * Eliminar un horario específico
   * Endpoint: DELETE /api/planning/schedules/{scheduleId}
   */
  deleteSchedule(scheduleId: number): Observable<any> {
    console.log(`=== ELIMINANDO HORARIO ${scheduleId} ===`);
    
    return this.http.delete<any>(`${this.baseUrl}/schedules/${scheduleId}`).pipe(
      tap(response => {
        console.log(`Horario ${scheduleId} eliminado exitosamente:`, response);
      }),
      catchError(error => {
        console.error(`=== ERROR AL ELIMINAR HORARIO ${scheduleId} ===`);
        console.error('Error:', error);
        console.error('Status:', error.status);
        console.error('Mensaje:', error.message);
        throw new Error(`Error al eliminar horario: ${error.message || 'Error desconocido'}`);
      })
    );
  }

  /**
   * Actualizar un horario específico usando PUT
   * Endpoint: PUT /api/planning/schedules/{scheduleId}
   */
  updateSchedule(scheduleId: number, scheduleData: any): Observable<ClassScheduleDTO> {
    console.log(`=== ACTUALIZANDO HORARIO ${scheduleId} ===`);
    console.log('Datos para actualizar:', scheduleData);
    
    return this.http.put<ClassScheduleDTO>(`${this.baseUrl}/schedules/${scheduleId}`, scheduleData).pipe(
      switchMap(response => {
        if (response.classroomRoom) {
          return of(response);
        }

        if (response.classroomId) {
          return this.classroomService.getClassroomById(Number(response.classroomId)).pipe(
            map(classroom => ({ ...response, classroomRoom: classroom.name, classroomName: classroom.name } as ClassScheduleDTO)),
            catchError(err => {
              console.warn('No se pudo obtener aula para enriquecer respuesta de actualización:', err);
              return of(response);
            })
          );
        }

        return of(response);
      }),
      tap(response => {
        console.log(`Horario ${scheduleId} actualizado exitosamente (enriquecido):`, response);
      }),
      catchError(error => {
        console.error(`=== ERROR AL ACTUALIZAR HORARIO ${scheduleId} ===`);
        console.error('Error:', error);
        console.error('Status:', error.status);
        console.error('Mensaje:', error.message);
        console.error('Datos enviados:', scheduleData);
        throw new Error(`Error al actualizar horario: ${error.message || 'Error desconocido'}`);
      })
    );
  }

  /**
   * Detectar conflictos de horarios en un aula específica
   */
  detectScheduleConflicts(classroomId: number, day: string): Observable<ClassScheduleDTO[]> {
    const params = new HttpParams()
      .set('classroomId', classroomId.toString())
      .set('day', day);
    
    return this.http.get<ClassScheduleDTO[]>(`${this.baseUrl}/schedules/conflicts`, { params });
  }

  // ==========================================
  // GESTIÓN DE PROFESORES
  // ==========================================

  /**
   * Obtener profesores disponibles para una cantidad de horas
   */
  getAvailableTeachers(requiredHours: number): Observable<TeacherDTO[]> {
    const params = new HttpParams().set('requiredHours', requiredHours.toString());
    return this.http.get<TeacherDTO[]>(`${this.baseUrl}/teachers/available`, { params });
  }

  // ==========================================
  // DUPLICACIÓN DE PLANIFICACIÓN
  // ==========================================

  /**
   * Obtener vista previa de la planificación de un semestre específico
   */
  getSemesterPlanningPreview(semesterId: number): Observable<{totalClasses: number, semesterId: number, classes: ClassDTO[]}> {
    console.log(`=== OBTENIENDO VISTA PREVIA DEL SEMESTRE ${semesterId} ===`);
    
    return this.http.get<{totalClasses: number, semesterId: number, classes: ClassDTO[]}>(`${this.baseUrl}/semesters/${semesterId}/preview`).pipe(
      tap(response => {
        console.log('Vista previa obtenida:', response);
        console.log(`Total de clases: ${response.totalClasses}`);
      }),
      catchError(error => {
        console.error(`Error obteniendo vista previa del semestre ${semesterId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Aplicar planificación de un semestre anterior al semestre actual
   */
  applySemesterPlanningToCurrent(sourceSemesterId: number): Observable<{message: string, classesApplied: number}> {
    console.log(`=== APLICANDO PLANIFICACIÓN DEL SEMESTRE ${sourceSemesterId} AL ACTUAL ===`);
    
    return this.http.post<{message: string, classesApplied: number}>(`${this.baseUrl}/semesters/${sourceSemesterId}/apply-to-current`, {}).pipe(
      tap(response => {
        console.log('Planificación aplicada exitosamente:', response);
        console.log(`Clases aplicadas: ${response.classesApplied}`);
      }),
      catchError(error => {
        console.error(`Error aplicando planificación del semestre ${sourceSemesterId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtener semestres pasados disponibles para duplicación
   */
  getPastSemesters(): Observable<{id: number, name: string, year: number, period: number}[]> {
    console.log('=== OBTENIENDO SEMESTRES PASADOS ===');
    
    return this.http.get<{id: number, name: string, year: number, period: number}[]>(`${this.baseUrl}/semesters/past`).pipe(
      tap(response => {
        console.log('Semestres pasados obtenidos:', response);
      }),
      catchError(error => {
        console.error('Error obteniendo semestres pasados:', error);
        throw error;
      })
    );
  }

  /**
   * Duplicar planificación completa de un semestre a otro
   */
  duplicateSemesterPlanning(sourceSemesterId: number, targetSemesterId: number): Observable<ClassDTO[]> {
    const params = new HttpParams()
      .set('sourceSemesterId', sourceSemesterId.toString())
      .set('targetSemesterId', targetSemesterId.toString());
    
    return this.http.post<ClassDTO[]>(`${this.baseUrl}/duplicate`, null, { params });
  }

  // ==========================================
  // REPORTES Y ESTADÍSTICAS
  // ==========================================

  /**
   * Obtener estadísticas de utilización de aulas por semestre
   */
  getUtilizationStatistics(semesterId: number): Observable<{ [key: string]: any }> {
    return this.http.get<{ [key: string]: any }>(`${this.baseUrl}/statistics/utilization/${semesterId}`);
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD PARA EL FRONTEND
  // ==========================================

  /**
   * Convertir horarios del backend (ClassScheduleDTO[]) a formato frontend (ScheduleRow[])
   * con datos enriquecidos
   */
  private convertClassSchedulesToScheduleRows(classSchedules: ClassScheduleDTO[]): any[] {
    if (!classSchedules || classSchedules.length === 0) {
      return [];
    }
    
    console.log('=== CONVIRTIENDO HORARIOS DEL BACKEND ===');
    console.log('Horarios recibidos:', classSchedules);
    
    return classSchedules.map(schedule => {
      // Mapear día del backend al frontend
      const frontendDay = this.mapDayFromBackend(schedule.day || '');
      
      // Usar el nombre de modalidad directamente del backend
      const modalityName = schedule.modalityName || 'In-Person';
      
      console.log(`Modalidad: backend="${schedule.modalityName || schedule.modalityId}" -> frontend="${modalityName}"`);
      
      // Obtener nombre del aula enriquecido
      const roomName = this.getEnrichedRoomName(schedule);
      console.log(`Aula: backend="${schedule.classroomRoom}" -> frontend="${roomName}"`);
      
      // Mapear tipo de aula enriquecido
      const roomType = this.getEnrichedRoomType(schedule);
      console.log(`Tipo aula: backend="${schedule.classroomTypeName}" -> frontend="${roomType}"`);
      
      const scheduleRow = {
        id: schedule.id, // Incluir ID del backend para poder eliminar
        day: frontendDay,
        startTime: schedule.startTime?.substring(0, 5) || '', // Remover segundos
        endTime: schedule.endTime?.substring(0, 5) || '',
        modality: modalityName,
        room: roomName,
        roomType: roomType,
        disability: schedule.disability || false,
        classroomId: schedule.classroomId // Mantener para futuros usos
      };
      
      console.log('Horario convertido:', {
        original: schedule,
        converted: scheduleRow
      });
      
      return scheduleRow;
    });
  }

  /**
   * Obtener nombre de aula enriquecido
   */
  private getEnrichedRoomName(schedule: ClassScheduleDTO): string {
    // Si ya tiene el nombre del aula del backend, usarlo con información enriquecida
    if (schedule.classroomRoom) {
      let roomName = schedule.classroomRoom;
      
      // Agregar información adicional si está disponible
      if (schedule.classroomLocation) {
        roomName += ` (${schedule.classroomLocation})`;
      }
      
      return roomName;
    }
    
    if (schedule.classroomName) {
      return schedule.classroomName;
    }
    
    // Si es modalidad virtual, no necesita aula
    if (schedule.modalityId === 2) { // Virtual
      return '';
    }
    
    // Fallback: mapeo por ID si no hay información del backend
    if (schedule.classroomId) {
      const roomMap: { [key: number]: string } = {
        1: 'Aula 101',
        2: 'Aula 102', 
        3: 'Lab 201'
      };
      return roomMap[schedule.classroomId] || `Aula ${schedule.classroomId}`;
    }
    
    return '';
  }

  /**
   * Obtener tipo de aula enriquecido
   */
  private getEnrichedRoomType(schedule: ClassScheduleDTO): string {
    // Usar el tipo de aula directamente del backend
    if (schedule.classroomTypeName) {
      return schedule.classroomTypeName;
    }
    
    // Fallback: usar "Lecture" como valor por defecto
    return 'Lecture';
  }

  /**
   * Mapear nombre de tipo de aula del backend al frontend
   */
  private mapClassroomTypeNameToFrontend(typeName: string): string {
    console.log(`🏷️ Mapeando tipo de aula: "${typeName}"`);
    const typeMap: { [key: string]: string } = {
      'Lecture': 'Aula Regular',
      'Lab': 'Laboratorio',
      'Laboratory': 'Laboratorio',
      'Auditorium': 'Auditorio',
      'Aula Regular': 'Aula Regular',
      'Laboratorio': 'Laboratorio',
      'Auditorio': 'Auditorio'
    };
    const result = typeMap[typeName] || typeName; // Usar el valor original si no encuentra mapeo
    console.log(`🏷️ Resultado mapeo tipo de aula: "${typeName}" -> "${result}"`);
    return result;
  }

  /**
   * Mapear día del backend al formato del frontend
   */
  private mapDayFromBackend(day: string): string {
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
    
    console.log(`🔄 Mapeando día del backend a frontend: "${day}" → "${dayMap[day] || day}"`);
    return dayMap[day] || day;
  }

  /**
   * Mapear ID de modalidad a nombre
   */
  private mapModalityIdToName(modalityId: number): string {
    const modalityMap: { [key: number]: string } = {
      1: 'Presencial',
      2: 'Virtual',
      3: 'Híbrido'
    };
    const modalityName = modalityMap[modalityId] || 'Presencial';
    console.log(`Mapeando modalidad ID ${modalityId} -> '${modalityName}'`);
    return modalityName;
  }

  /**
   * Mapear nombre de modalidad del backend al frontend
   */
  private mapModalityNameToFrontend(modalityName: string): string {
    console.log(`🎯 Mapeando modalidad: "${modalityName}"`);
    const modalityMap: { [key: string]: string } = {
      'In-Person': 'Presencial',
      'Virtual': 'Virtual',
      'Online': 'Virtual', 
      'Hybrid': 'Híbrido',
      'Presencial': 'Presencial',
      'Híbrido': 'Híbrido'
    };
    const result = modalityMap[modalityName] || modalityName; // Usar el valor original si no encuentra mapeo
    console.log(`🎯 Resultado mapeo modalidad: "${modalityName}" -> "${result}"`);
    return result;
  }

  /**
   * Mapear ID de aula a tipo de aula por defecto
   */
  private mapClassroomIdToType(classroomId?: number): string {
    if (!classroomId) return 'Aulas';
    
    // Mapeo básico mientras no esté completamente integrado
    if (classroomId <= 2) return 'Aulas';
    if (classroomId === 3) return 'Laboratorio';
    return 'Aulas';
  }

  /**
   * Convertir ClassDTO del backend a PlanningRow del frontend
   */
  convertClassDTOToPlanningRow(classDTO: ClassDTO): PlanningRow {
    console.log('=== CONVERSIÓN ClassDTO a PlanningRow ===');
    console.log('ClassDTO recibido:', classDTO);
    console.log('Propiedades específicas:', {
      id: classDTO.id,
      courseId: classDTO.courseId,
      courseName: classDTO.courseName,
      startDate: classDTO.startDate,
      endDate: classDTO.endDate,
      capacity: classDTO.capacity,
      sectionName: classDTO.sectionName,
      statusName: classDTO.statusName
    });
    
    // Función para convertir Date a string YYYY-MM-DD
    const formatDateForFrontend = (dateValue: any): string => {
      console.log('=== PROCESANDO FECHA ===');
      console.log('Valor recibido:', dateValue);
      console.log('Tipo:', typeof dateValue);
      console.log('Es Date?', dateValue instanceof Date);
      console.log('Es string?', typeof dateValue === 'string');
      
      if (!dateValue) {
        console.log('Fecha vacía o undefined, devolviendo cadena vacía');
        return '';
      }
      
      // Si es un objeto Date, convertir a YYYY-MM-DD
      if (dateValue instanceof Date) {
        const formatted = dateValue.toISOString().split('T')[0];
        console.log(`Fecha Date convertida: ${dateValue} -> ${formatted}`);
        return formatted;
      }
      
      // Si es string y no está vacío, devolverlo tal como viene o convertir
      if (typeof dateValue === 'string' && dateValue.trim() !== '') {
        // Si es ISO datetime, extraer solo la fecha
        if (dateValue.includes('T')) {
          const formatted = dateValue.split('T')[0];
          console.log(`Fecha ISO convertida: ${dateValue} -> ${formatted}`);
          return formatted;
        }
        // Si ya es YYYY-MM-DD, mantenerlo
        if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.log(`Fecha YYYY-MM-DD mantenida: ${dateValue}`);
          return dateValue.trim();
        }
        console.log(`Fecha string mantenida: ${dateValue}`);
        return dateValue.trim();
      }
      
      // Si es timestamp numérico, convertir
      if (typeof dateValue === 'number') {
        const date = new Date(dateValue);
        const formatted = date.toISOString().split('T')[0];
        console.log(`Timestamp convertido: ${dateValue} -> ${formatted}`);
        return formatted;
      }
      
      console.log('Fecha no válida, devolviendo vacío:', dateValue);
      return '';
    };
    
    // Calcular semanas entre fechas
    const calculateWeeks = (start: string, end: string): number => {
      if (!start || !end) return 0;
      try {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks;
      } catch {
        return 0;
      }
    };

    const startDateFormatted = formatDateForFrontend(classDTO.startDate);
    const endDateFormatted = formatDateForFrontend(classDTO.endDate);

    const planningRow: PlanningRow = {
      backendId: classDTO.id,
      _state: (classDTO.id ? 'existing' : 'new') as 'existing' | 'new' | 'deleted',
      _editing: false,
      courseName: classDTO.courseName || '',
      courseId: classDTO.courseId.toString(), // Convertir number a string para el frontend
      section: 'Computer Science', // Nombre de sección por defecto
      classId: classDTO.id?.toString() || 'nuevo',
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      weeks: calculateWeeks(startDateFormatted, endDateFormatted),
      seats: classDTO.capacity || 0,
      status: this.mapBackendStatusToFrontend(classDTO.statusName),
      teacher: undefined, // Se llenará con los datos de asignación
      notes: classDTO.observation ? [classDTO.observation] : [],
      schedules: this.convertClassSchedulesToScheduleRows(classDTO.schedules || [])
    };
    
    console.log('PlanningRow convertido con fechas:', {
      startDate: planningRow.startDate,
      endDate: planningRow.endDate,
      fullRow: planningRow
    });
    return planningRow;
  }

  /**
   * Convertir PlanningRow del frontend a ClassDTO del backend
   */
  convertPlanningRowToClassDTO(planningRow: PlanningRow): ClassDTO {
    console.log('=== CONVIRTIENDO PLANNINGROW A CLASSDTO ===');
    console.log('PlanningRow original:', planningRow);
    console.log('Fechas en PlanningRow:', {
      startDate: planningRow.startDate,
      endDate: planningRow.endDate,
      startDateType: typeof planningRow.startDate,
      endDateType: typeof planningRow.endDate,
      startDateEmpty: !planningRow.startDate,
      endDateEmpty: !planningRow.endDate
    });
    
    const classDTO = {
      id: planningRow.backendId,
      courseId: parseInt(planningRow.courseId), // Convertir string a number para el backend
      semesterId: 1, // ID del semestre fijo como solicitado
      section: 1, // ID por defecto de la sección
      sectionName: planningRow.section, // Usar el nombre de la sección
      startDate: planningRow.startDate,
      endDate: planningRow.endDate,
      observation: planningRow.notes?.join('; '),
      capacity: planningRow.seats,
      // statusId se manejará separadamente según el esquema de la BD
    };
    
    console.log('ClassDTO convertido:', classDTO);
    console.log('Fechas en ClassDTO:', {
      startDate: classDTO.startDate,
      endDate: classDTO.endDate,
      startDateType: typeof classDTO.startDate,
      endDateType: typeof classDTO.endDate,
      startDateEmpty: !classDTO.startDate,
      endDateEmpty: !classDTO.endDate
    });
    console.log('=== DATOS FINALES A ENVIAR AL BACKEND ===');
    console.log('JSON que se enviará:', JSON.stringify(classDTO, null, 2));
    
    return classDTO;
  }

  /**
   * Mapear estado del backend al frontend
   */
  private mapBackendStatusToFrontend(backendStatus: string | null | undefined): PlanningStatus {
    // Manejar casos donde el status viene como null o undefined
    if (!backendStatus) {
      return 'PENDIENTE';
    }

    const statusMap: Record<string, PlanningStatus> = {
      'PENDING': 'PENDIENTE',
      'CONFIRMED': 'CONFIRMADO',
      'REJECTED': 'RECHAZADO',
      'PENDIENTE': 'PENDIENTE',
      'CONFIRMADO': 'CONFIRMADO',
      'RECHAZADO': 'RECHAZADO'
    };
    
    return statusMap[backendStatus.toUpperCase()] || 'PENDIENTE';
  }

  /**
   * Mapear estado del frontend al backend
   */
  private mapFrontendStatusToBackend(frontendStatus: PlanningStatus): string {
    const statusMap: Record<PlanningStatus, string> = {
      'PENDIENTE': 'PENDING',
      'CONFIRMADO': 'CONFIRMED',
      'RECHAZADO': 'REJECTED'
    };
    return statusMap[frontendStatus] || 'PENDING';
  }

  // ==========================================
  // INTEGRACIÓN CON CURSOS REALES
  // ==========================================

  /**
   * Buscar cursos disponibles usando el backend real
   */
  searchCourses(query: string): Observable<CourseOption[]> {
    return new Observable(observer => {
      this.courseService.searchCourses(query).subscribe(
        courses => {
          const courseOptions = this.courseService.convertCoursesToOptions(
            this.courseService.filterValidCourses(courses)
          );
          observer.next(courseOptions);
          observer.complete();
        },
        error => {
          console.error('Error al buscar cursos:', error);
          // En caso de error, retornar array vacío
          observer.next([]);
          observer.complete();
        }
      );
    });
  }

  /**
   * Obtener nombre de la sección para un curso específico
   */
  getSectionByCourseId(courseId: string): Observable<string> {
    return this.courseService.getCourseById(courseId).pipe(
      map(course => {
        // Siempre devolvemos "Computer Science" ya que es la sección por defecto según la BD
        return 'Computer Science';
      }),
      catchError(() => {
        console.error('Error al obtener la sección del curso:', courseId);
        return of('Computer Science');
      })
    );
  }

  /**
   * Obtener curso por ID para validación
   */
  getCourseById(courseId: string | number): Observable<any> {
    return this.courseService.getCourseById(courseId);
  }

  // ==========================================
  // EXPORTACIÓN A EXCEL
  // ==========================================

  /**
   * Exportar planificación a Excel
   */
  exportToExcel(rows: PlanningRow[]) {
    // Definir la interfaz para los datos de Excel
    interface ExcelRow {
      'Materia': string;
      'ID Materia': string;
      'Sección': string;
      'ID Clase': string;
      'Inicio': string;
      'Fin': string;
      'Semanas': number;
      'Cupos': number;
      'Estado': PlanningStatus;
      'Día': string;
      'Hora Inicial': string;
      'Hora Final': string;
      'Salón': string;
      'Observaciones': string;
    }

    // Definir los colores por estado
    type RowStatus = 'Subido' | 'Cambiar' | 'Eliminar' | 'Crear';
    
    const statusColors: Record<RowStatus, string> = {
      'Subido': 'C6EFCE',     // Verde claro
      'Cambiar': 'FFEB9C',    // Amarillo claro
      'Eliminar': 'FFC7CE',   // Rojo claro
      'Crear': '9BC2E6'       // Azul claro
    };

    // Formatear los datos para el Excel
    const excelData = rows.flatMap(row => {
      // Crear un array para almacenar todas las filas de esta clase
      const classRows: ExcelRow[] = [];

      // Si no hay horarios, crear una fila con la información básica
      if (!row.schedules || row.schedules.length === 0) {
        classRows.push({
          'ID Materia': row.courseId,
          'Materia': row.courseName,
          'Sección': row.section,
          'ID Clase': row.classId,
          'Inicio': row.startDate,
          'Fin': row.endDate,
          'Semanas': row.weeks,
          'Cupos': row.seats,
          'Estado': row.status,
          'Día': '-',
          'Hora Inicial': '-',
          'Hora Final': '-',
          'Salón': '-',
          'Observaciones': row.notes.join('\n')
        });
        return classRows;
      }

      // Crear una fila por cada horario
      row.schedules.forEach(schedule => {
        classRows.push({
          'Materia': row.courseName,
          'ID Materia': row.courseId,
          'Sección': row.section,
          'ID Clase': row.classId,
          'Inicio': row.startDate,
          'Fin': row.endDate,
          'Semanas': row.weeks,
          'Cupos': row.seats,
          'Estado': row.status,
          'Día': schedule.day || '-',
          'Hora Inicial': schedule.startTime || '-',
          'Hora Final': schedule.endTime || '-',
          'Salón': schedule.room || 'Sin salón',
          'Observaciones': row.notes.join('\n')
        });
      });

      return classRows;
    });

    // Crear el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    // Ajustar el ancho de las columnas
    const columnWidths = [
      { wch: 30 }, // Materia
      { wch: 15 }, // ID Materia
      { wch: 15 }, // Sección
      { wch: 10 }, // ID Clase
      { wch: 12 }, // Inicio
      { wch: 12 }, // Fin
      { wch: 10 }, // Semanas
      { wch: 10 }, // Cupos
      { wch: 15 }, // Estado
      { wch: 10 }, // Día
      { wch: 10 }, // Hora Inicial
      { wch: 10 }, // Hora Final
      { wch: 15 }, // Salón
      { wch: 40 }  // Observaciones
    ];

    // Aplicar colores según el estado
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r + 1; R <= range.e.r; R++) { // +1 para saltar el encabezado
      // Obtener el estado de la fila actual (columna 9 - Estado)
      const estadoCell = worksheet[XLSX.utils.encode_cell({r: R, c: 8})];
      const estado = estadoCell?.v as RowStatus;
      
      if (estado && estado in statusColors) {
        // Aplicar color a toda la fila
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellRef = XLSX.utils.encode_cell({r: R, c: C});
          if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };
          
          worksheet[cellRef].s = {
            fill: {
              fgColor: { rgb: statusColors[estado] },
              patternType: 'solid'
            }
          };
        }
      }
    }
    worksheet['!cols'] = columnWidths;

    // Agregar el título
    const title = `Programación clases ${new Date().getFullYear()}${Math.floor((new Date().getMonth() + 3) / 6)}0`;
    XLSX.utils.book_append_sheet(workbook, worksheet, title);

    // Descargar el archivo
    XLSX.writeFile(workbook, `${title}.xlsx`);
  }

  // ==========================================
  // INTEGRACIÓN CON DOCENTES
  // ==========================================

  /**
   * Obtener docentes asignados a una clase
   */
  getAssignedTeachers(classId: number): Observable<TeacherDTO[]> {
    // Usar el endpoint real del módulo de integración
    const assignmentUrl = `${environment.apiUrl}/teachers/classes/class/${classId}`;
    return this.http.get<any[]>(assignmentUrl).pipe(
      map(teacherClassList => {
        // Convertir TeacherClassResponseDTO a TeacherDTO
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
      tap(teachers => console.log(`👨‍🏫 Docentes asignados a clase ${classId}:`, teachers)),
      catchError(error => {
        console.error(`❌ Error obteniendo docentes de clase ${classId}:`, error);
        return of([]); // Retornar array vacío en caso de error
      })
    );
  }

  /**
   * Asignar un docente a una clase
   */
  assignTeacherToClass(classId: number, teacherId: number, workHours: number, observation?: string): Observable<TeacherDTO> {
    // Usar el endpoint real del módulo de integración en lugar del mock
    const assignmentUrl = `${environment.apiUrl}/teachers/classes`;
    
    const requestBody = {
      teacherId: teacherId,
      classId: classId,
      workHours: workHours,
      observation: observation || `Asignado desde planificación - ${new Date().toLocaleString()}`
    };

    console.log(`🎯 Asignando docente ${teacherId} a clase ${classId} con ${workHours} horas usando endpoint real`);
    console.log('Request body:', requestBody);
    
    return this.http.post<any>(`${assignmentUrl}`, requestBody).pipe(
      switchMap(() => {
        // Después de crear la asignación, obtener información del docente desde el servicio de administración
        const teacherUrl = `${environment.apiUrl}/api/admin/teachers/${teacherId}`;
        return this.http.get<any>(teacherUrl).pipe(
          map(teacherInfo => ({
            id: teacherId,
            name: teacherInfo.name || 'Docente',
            lastName: teacherInfo.lastName || '',
            email: teacherInfo.email || '',
            maxHours: teacherInfo.maxHours || 40,
            assignedHours: workHours,
            availableHours: (teacherInfo.maxHours || 40) - workHours,
            extraHours: 0,
            contractType: teacherInfo.contractType || 'N/A'
          })),
          catchError(() => of({
            id: teacherId,
            name: 'Docente',
            lastName: 'Asignado',
            email: '',
            maxHours: 40,
            assignedHours: workHours,
            availableHours: 40 - workHours,
            extraHours: 0,
            contractType: 'N/A'
          }))
        );
      }),
      tap(response => console.log('✅ Docente asignado exitosamente:', response)),
      catchError(error => {
        console.error('❌ Error asignando docente:', error);
        throw error;
      })
    );
  }

  /**
   * Cambiar el docente asignado a una clase
   */
  changeTeacherForClass(classId: number, newTeacherId: number, workHours: number, observation?: string): Observable<TeacherDTO> {
    const assignmentUrl = `${environment.apiUrl}/api/teacher-assignments`;
    let params = new HttpParams()
      .set('newTeacherId', newTeacherId.toString())
      .set('workHours', workHours.toString());
    
    if (observation) {
      params = params.set('observation', observation);
    }

    console.log(`🔄 Cambiando docente de clase ${classId} al docente ${newTeacherId}`);
    
    return this.http.put<TeacherDTO>(`${assignmentUrl}/class/${classId}/teacher`, null, { params }).pipe(
      tap(response => console.log('✅ Docente cambiado exitosamente:', response)),
      catchError(error => {
        console.error('❌ Error cambiando docente:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener docentes disponibles para una clase
   */
  getAvailableTeachersForClass(classId: number, requiredHours: number): Observable<TeacherDTO[]> {
    const assignmentUrl = `${environment.apiUrl}/api/teacher-assignments`;
    const params = new HttpParams().set('requiredHours', requiredHours.toString());
    
    return this.http.get<TeacherDTO[]>(`${assignmentUrl}/class/${classId}/available-teachers`, { params }).pipe(
      tap(teachers => console.log(`📋 Docentes disponibles para clase ${classId}:`, teachers)),
      catchError(error => {
        console.error(`❌ Error obteniendo docentes disponibles para clase ${classId}:`, error);
        return of([]); // Retornar array vacío en caso de error
      })
    );
  }
}

export interface CourseDTO {
  /** Identificador único del curso. */
  id: number;
  /** Nombre del curso. */
  name: string;
  /** Número de créditos del curso. */
  credits: number;
  /** Descripción del curso. */
  description: string;
  /** Indica si el curso está activo o válido. */
  isValid: boolean;
  /** Identificador de la sección a la que pertenece el curso. */
  sectionId: number;
}

export interface RequestScheduleDTO {
  /** Identificador único del horario. */
  id?: number;
  /** Día de la semana del horario. */
  day: string;
  /** Hora de inicio en formato "HH:mm:ss". */
  startTime: string;
  /** Hora de fin en formato "HH:mm:ss". */
  endTime: string;
  /** Identificador del tipo de aula requerida. */
  classRoomTypeId: number;
  /** Identificador de la modalidad (presencial, virtual, etc.). */
  modalityId: number;
  /** Indica si se requiere accesibilidad para discapacidad. */
  disability: boolean;
}

export interface AcademicRequestDTO {
  courseId: number;
  capacity: number; // cupo solicitado
  startDate: string; // LocalDate as ISO string
  endDate: string;   // LocalDate as ISO string
  observation?: string;
  schedules: RequestScheduleDTO[];

  // Campos calculados (no en DB)
  weeks?: number;    // se calcula en service
  sectionId?: number;   // se deriva del curso
}

export interface AcademicRequestResponseDTO {
  id: number;
  userId: number;
  courseId: number;
  semesterId: number;
  startDate: string; // LocalDate as ISO string
  endDate: string;   // LocalDate as ISO string
  capacity: number;
  requestDate: string; // LocalDate as ISO string
  observation?: string;
  schedules: RequestScheduleResponseDTO[];
  
  // Campos enriquecidos desde el backend
  userName?: string;        // Nombre completo del usuario
  courseName?: string;      // Nombre del curso
  programName?: string;     // Nombre del programa
}

export interface RequestScheduleResponseDTO {
  id: number;
  day: string;
  startTime: string; // formato "HH:mm:ss"
  endTime: string;   // formato "HH:mm:ss"
  classRoomTypeId: number;
  modalityId: number;
  disability: boolean;
}

export interface AcademicRequestBatchDTO {
  /**
   * Lista de solicitudes académicas individuales.
   * El usuario se obtiene del contexto de autenticación en el backend.
   */
  requests: AcademicRequestRequestDTO[];
}

export interface AcademicRequestRequestDTO {
  courseId: number;
  startDate: string; // LocalDate as ISO string  
  endDate: string;   // LocalDate as ISO string
  capacity: number;
  observation?: string;
  schedules: RequestScheduleRequestDTO[];
}

export interface RequestScheduleRequestDTO {
  classRoomTypeId: number;
  startTime: string; // formato "HH:mm:ss"
  endTime: string;   // formato "HH:mm:ss"
  day: string;
  modalityId: number;
  disability: boolean;
}

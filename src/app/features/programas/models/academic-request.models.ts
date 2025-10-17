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

export interface AcademicRequestBatchDTO {
  /**
   * Identificador del usuario que realiza las solicitudes.
   */
  userId: number;
  /**
   * Identificador del semestre al que pertenecen las solicitudes.
   */
  semesterId: number;
  /**
   * Lista de solicitudes académicas individuales.
   */
  requests: AcademicRequestDTO[];
}

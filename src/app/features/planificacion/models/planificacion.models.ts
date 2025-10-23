// Tipos compartidos para toda la feature de Planificación

// Días y modalidades
export type Day = 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM';
export type Modality = 'In-Person' | 'Online' | 'Hybrid'; // Valores reales de la BD

// Fila de horario con salón (la usaremos en la subtabla)
export interface ScheduleRow {
  id?: number;            // ID del horario en el backend
  day?: Day;
  startTime?: string;     // "08:00"
  endTime?: string;       // "10:00"
  disability?: boolean;   // ¿requiere aula accesible?
  modality?: Modality;    // presencial/virtual/híbrido
  roomType?: 'Lecture' | 'Lab' | 'Auditorium'; // Valores reales de la BD
  room?: string;          // ej. "A-203"
  classroomId?: number;   // ID del aula en el backend
}

// Estados de confirmación del docente
export type PlanningStatus = 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
export interface StatusMeta { emoji: string; label: string; }
export const STATUS_META: Record<PlanningStatus, StatusMeta> = {
  PENDIENTE:   { emoji: '⏳', label: 'Pendiente' },
  CONFIRMADO:  { emoji: '✅', label: 'Confirmado' },
  RECHAZADO:   { emoji: '❌', label: 'Rechazado' },
};

// Referencia simple de docente (extendida con más información)
export interface TeacherRef { 
  id: number;        // Cambio a number para coincidir con el backend
  name: string; 
  lastName?: string;
  email?: string;
  maxHours?: number;
  assignedHours?: number;
  availableHours?: number;
  status?: PlanningStatus;  // Estado individual del profesor para esta clase
}

// Fila principal de planificación (tabla grande)
export interface PlanningRow {
  backendId?: number;      // ID en el backend (para updates)
  _state: 'new' | 'existing' | 'deleted';
  _open?: boolean;
  _editing?: boolean;

  courseId: string;        // Mantenemos como string en el frontend para compatibilidad
  courseName: string;
  section: string;

  classId: string;     // Id Clase (lo digita el usuario)
  seats: number;
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD"
  weeks: number;

  // NOTE: support multiple teachers per class. Keep `teacher` compatibility in other code paths
  // by using the first element of `teachers` where a single teacher is expected.
  teachers?: TeacherRef[];
  teacher?: TeacherRef; // legacy single-teacher field (kept for compatibility)
  status: PlanningStatus;   // ⏳/✅/❌
  notes: string[];          // observaciones acumuladas

  schedules: ScheduleRow[]; // horarios de la clase
  // Marca temporal para evitar re-asignaciones duplicadas (ms desde epoch)
  _teacherAssignedAt?: number;
  /** Indica si la materia es anual (no recomendada para duplicar) */
  isAnnual?: boolean;
}

// Interfaces para comunicación con el backend
export interface ClassCreateRequest {
  courseName: string;
  courseId: string;
  section: string;
  classId: string;
  startDate: string;
  endDate: string;
  weeks: number;
  capacity: number;
  status: string;
  notes?: string[];
}

export interface ClassUpdateRequest extends Partial<ClassCreateRequest> {
  id: number;
}

export interface TeacherAssignmentRequest {
  teacherId: number;
  classId: number;
  workHours: number;
  observation?: string;
}

// Interfaces para respuestas del backend
export interface ClassResponse {
  id: number;
  courseName: string;
  courseId: string;
  section: string;
  classId: string;
  startDate: string;
  endDate: string;
  weeks: number;
  status: string;
  capacity: number;
  semesterId?: number;
  notes?: string[];
  createdDate?: string;
  updatedDate?: string;
}

export interface TeacherResponse {
  id: number;
  name: string;
  lastName: string;
  email?: string;
  maxHours: number;
  assignedHours: number;
  availableHours: number;
  extraHours?: number;
  contractType?: string;
  assignments?: TeacherAssignmentResponse[];
}

export interface TeacherAssignmentResponse {
  id: number;
  teacherId: number;
  classId: number;
  workHours: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  observation?: string;
  createdDate?: string;
  responseDate?: string;
  extraHours?: number;
}

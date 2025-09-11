// Tipos compartidos para toda la feature de Planificación

// Días y modalidades
export type Day = 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM';
export type Modality = 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';

// Fila de horario con salón (la usaremos en la subtabla)
export interface ScheduleRow {
  day?: Day;
  startTime?: string;     // "08:00"
  endTime?: string;       // "10:00"
  disability?: boolean;   // ¿requiere aula accesible?
  modality?: Modality;    // presencial/virtual/híbrido
  roomType?: 'Laboratorio' | 'Aulas' | 'Aulas Moviles' | 'Aulas Accesibles';
  room?: string;          // ej. "A-203"
}

// Estados de confirmación del docente
export type PlanningStatus = 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
export interface StatusMeta { emoji: string; label: string; }
export const STATUS_META: Record<PlanningStatus, StatusMeta> = {
  PENDIENTE:   { emoji: '⏳', label: 'Pendiente' },
  CONFIRMADO:  { emoji: '✅', label: 'Confirmado' },
  RECHAZADO:   { emoji: '❌', label: 'Rechazado' },
};

// Referencia simple de docente
export interface TeacherRef { id: string; name: string; }

// Fila principal de planificación (tabla grande)
export interface PlanningRow {
  _state: 'new' | 'existing' | 'deleted';
  _open?: boolean;
  _editing?: boolean;

  courseId: string;
  courseName: string;
  section: string;

  classId: string;     // Id Clase (lo digita el usuario)
  seats: number;
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD"
  weeks: number;

  teacher?: TeacherRef;
  status: PlanningStatus;   // ⏳/✅/❌
  notes: string[];          // observaciones acumuladas

  schedules: ScheduleRow[]; // <---- AQUÍ está el tipo que te faltaba
}

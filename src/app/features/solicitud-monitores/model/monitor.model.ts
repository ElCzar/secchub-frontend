import { HorarioMonitor } from './horario-monitor.model';

/**
 * Model for Monitor used in the solicitud-monitores components
 * This interface includes all properties displayed in the monitors table
 */
export interface Monitor {
  // Basic identification
  id?: number;
  userId?: number;        // User ID for linking with user information
  courseId?: number;      // Course ID for filtering
  sectionId?: number;     // Section ID for filtering
  statusId?: number;      // Status ID for approval/rejection
  
  // Personal information
  nombre?: string;        // First name
  apellido?: string;      // Last name
  carrera?: string;       // Academic program/career
  semestre?: number;      // Current semester
  promedio?: number;      // Academic average (GPA)
  correo?: string;        // Institutional email
  
  // Academic course information (visible in non-admin mode)
  profesor?: string;      // Professor name for the course
  noClase?: number;       // Class number
  asignatura?: string;    // Subject/course name
  nota?: number;          // Grade obtained in the course
  
  // Administrative information (visible in admin mode)
  seccionAcademica?: string;  // Academic section
  administrativo?: boolean;   // Whether this is an administrative monitor
  
  // Monitor assignment details
  horasSemanales?: number;    // Weekly hours assigned
  semanas?: number;           // Number of weeks
  totalHoras?: number;        // Total hours (calculated)
  
  // Status and classifications
  estado?: 'pendiente' | 'aceptado' | 'rechazado';  // Application status
  antiguo?: boolean;          // Is former monitor
  
  // Schedule information
  horarios?: HorarioMonitor[];  // Array of schedule entries
  showHorarios?: boolean;       // UI state for showing/hiding schedules
}
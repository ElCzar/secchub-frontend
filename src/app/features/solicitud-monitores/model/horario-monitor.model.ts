/**
 * Model for schedule entries (horarios) used in the monitors management system
 */
export interface HorarioMonitor {
  id: number;            // Unique identifier for the schedule entry
  dia: string;           // Day of the week (Lunes, Martes, etc.)
  horaInicio: string;    // Start time in HH:MM format
  horaFinal: string;     // End time in HH:MM format
  totalHoras: number;    // Calculated total hours for this schedule entry
}
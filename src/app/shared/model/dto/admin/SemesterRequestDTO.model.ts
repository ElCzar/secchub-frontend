/**
 * Data Transfer Object for Semester creation/update requests
 */
export interface SemesterRequestDTO {
  period: number;
  year: number;
  startDate: string; // ISO 8601 date string
  endDate: string;   // ISO 8601 date string
  startSpecialWeek?: string; // ISO 8601 date string - Inicio de semana especial (receso/semana santa)
}
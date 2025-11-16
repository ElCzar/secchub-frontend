/**
 * Data Transfer Object for Semester response data
 */
export interface SemesterResponseDTO {
  id: number;
  period: number;
  year: number;
  startDate: string;
  endDate: string;
  startSpecialWeek?: string; // Fecha de inicio de semana especial (receso/semana santa)
  isCurrent: boolean;
}
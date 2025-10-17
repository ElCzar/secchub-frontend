/**
 * DTO para solicitud de semestre
 * Corresponde a SemesterRequestDTO del backend
 */
export interface SemesterRequestDTO {
  name: string;
  year: number;
  period: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}
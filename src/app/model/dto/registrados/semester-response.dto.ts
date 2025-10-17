/**
 * DTO para respuesta de semestre
 * Corresponde a SemesterResponseDTO del backend
 */
export interface SemesterResponseDTO {
  id: number;
  name: string;
  year: number;
  period: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string;
}
/**
 * DTO para respuesta de información de docente
 * Corresponde a TeacherResponseDTO del backend
 */
export interface TeacherResponseDTO {
  id: number;
  userId: number;
  employmentTypeId: number;
  employmentTypeName?: string;
  maxHours: number;
  createdDate?: string;
  updatedDate?: string;
}
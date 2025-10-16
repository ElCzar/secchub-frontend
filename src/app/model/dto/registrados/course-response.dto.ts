/**
 * DTO para respuesta de curso
 * Corresponde a CourseResponseDTO del backend
 */
export interface CourseResponseDTO {
  id: number;
  name: string;
  code: string;
  credits: number;
  description?: string;
  semester?: string;
  faculty?: string;
  createdDate?: string;
  updatedDate?: string;
}
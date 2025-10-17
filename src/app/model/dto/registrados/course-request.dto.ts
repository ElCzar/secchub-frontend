/**
 * DTO para solicitud de curso
 * Corresponde a CourseRequestDTO del backend
 */
export interface CourseRequestDTO {
  name: string;
  code: string;
  credits: number;
  description?: string;
  semester?: string;
  faculty?: string;
}
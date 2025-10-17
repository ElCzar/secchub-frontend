/**
 * DTO para solicitud de creación de docente
 * Corresponde a TeacherCreateRequestDTO del backend
 */
export interface TeacherCreateRequestDTO {
  userId: number;
  employmentTypeId: number;
  maxHours: number;
}
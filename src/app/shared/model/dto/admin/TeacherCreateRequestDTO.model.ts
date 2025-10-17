/**
 * Data Transfer Object for Teacher creation requests
 */
export interface TeacherCreateRequestDTO {
  userId: number;
  employmentTypeId: number;
  maxHours: number;
}
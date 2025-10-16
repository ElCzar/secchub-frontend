/**
 * Data Transfer Object for Course response data
 */
export interface CourseResponseDTO {
  id: number;
  name: string;
  code: string;
  credits: number;
  description?: string;
  semesterId: number;
  semesterName?: string;
  departmentId?: number;
  departmentName?: string;
  createdAt?: string;
  updatedAt?: string;
}
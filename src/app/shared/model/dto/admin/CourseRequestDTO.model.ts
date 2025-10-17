/**
 * Data Transfer Object for Course creation/update requests
 */
export interface CourseRequestDTO {
  name: string;
  code: string;
  credits: number;
  description?: string;
  semesterId: number;
  departmentId?: number;
}
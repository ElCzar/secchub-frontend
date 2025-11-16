/**
 * Data Transfer Object for Course creation/update requests
 */
export interface CourseRequestDTO {
  sectionId?: number;
  name: string;
  credits: number;
  description?: string;
  isValid: boolean;
  recommendation?: string;
  statusId: number;
}
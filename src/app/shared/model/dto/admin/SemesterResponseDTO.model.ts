/**
 * Data Transfer Object for Semester response data
 */
export interface SemesterResponseDTO {
  id: number;
  period: number;
  year: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}
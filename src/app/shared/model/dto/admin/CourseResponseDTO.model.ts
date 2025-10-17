/**
 * Data Transfer Object for Course response data
 */
export interface CourseResponseDTO {
   id?: number;
   sectionId?: number;
   name?: string;
   credits?: number;
   description?: string;
   isValid?: boolean;
   recommendation?: string;
   statusId?: number;
}

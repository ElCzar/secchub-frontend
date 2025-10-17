/**
 * Data Transfer Object for Course creation/update requests
 */
/**
 *     private Long sectionId;
    private String name;
    private Integer credits;
    private String description;
    private Boolean isValid;
    private String recommendation;
    private Long statusId;
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
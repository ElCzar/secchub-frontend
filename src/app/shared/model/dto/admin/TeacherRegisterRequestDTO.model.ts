import { UserRegisterRequestDTO } from "./UserRegisterRequestDTO.model";

/**
 * Data Transfer Object for Teacher registration requests
 */
export interface TeacherRegisterRequestDTO {
  employmentTypeId: number;
  maxHours: number;
  user: UserRegisterRequestDTO;
}
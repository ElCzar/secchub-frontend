import { UserRegisterRequestDTO } from "./UserRegisterRequestDTO.model";

/**
 * Data Transfer Object for Section registration requests
 */
export interface SectionRegisterRequestDTO {
  name: string;
  user: UserRegisterRequestDTO;
}
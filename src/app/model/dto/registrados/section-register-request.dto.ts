/**
 * DTO para solicitud de registro de sección
 * Corresponde a SectionRegisterRequestDTO del backend
 */
import { UserRegisterRequestDTO } from './user-register-request.dto';
import { SectionCreateRequestDTO } from './section-create-request.dto';

export interface SectionRegisterRequestDTO {
  userRegisterRequest: UserRegisterRequestDTO;
  sectionCreateRequest: SectionCreateRequestDTO;
}
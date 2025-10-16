/**
 * DTO para solicitud de registro de docente
 * Corresponde a TeacherRegisterRequestDTO del backend
 */
import { UserRegisterRequestDTO } from './user-register-request.dto';
import { TeacherCreateRequestDTO } from './teacher-create-request.dto';

export interface TeacherRegisterRequestDTO {
  userRegisterRequest: UserRegisterRequestDTO;
  teacherCreateRequest: TeacherCreateRequestDTO;
}
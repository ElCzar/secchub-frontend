import { UserRegisterRequestDTO } from './user.model';

export interface TeacherRegisterRequestDTO {
  employmentTypeId: number;
  maxHours: number;
  user: UserRegisterRequestDTO;
}

export interface TeacherResponseDTO {
  id: number;
  userId: number;
  employmentTypeId: number;
  maxHours: number;
}
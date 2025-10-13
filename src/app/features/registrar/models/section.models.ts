import { UserRegisterRequestDTO } from './user.models';

export interface SectionRegisterRequestDTO {
  name: string;           // nombre de la sección
  user: UserRegisterRequestDTO; // jefe de sección (profesor)
}

export interface SectionResponseDTO {
  id: number;
  name: string;
  userId: number;
}

import { UserRegisterRequestDTO } from './user.model';

export interface SectionRegisterRequestDTO {
  name: string;           // nombre de la sección
  user: UserRegisterRequestDTO; // jefe de sección
}

export interface SectionResponseDTO {
  id: number;
  name: string;
  userId: number;
}

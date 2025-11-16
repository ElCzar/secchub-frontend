export interface UserProfile {
  id: number;
  username: string;
  faculty: string;
  nombreCompleto: string;
  correo: string;
  documentType: string;
  documentNumber: string;
  isActive: boolean;
  rol: 'administrador' | 'jefe_seccion';
}

export interface EditUserProfileRequest {
  name: string;
  lastName: string;
  correo: string;
  documentType: string;
  documentNumber: string;
}
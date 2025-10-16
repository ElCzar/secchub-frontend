export interface UserProfile {
  id: number;
  username: string;
  faculty: string;
  nombreCompleto: string;
  correo: string;
  documentType: string;
  documentNumber: string;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string;
  rol: 'administrador' | 'jefe_seccion';
  seccion?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface EditUserProfileRequest {
  name: string;
  lastName: string;
  correo: string;
  documentType: string;
  documentNumber: string;
}
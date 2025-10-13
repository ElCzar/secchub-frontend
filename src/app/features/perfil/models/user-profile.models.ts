export interface UserProfile {
  id: string;
  nombreCompleto: string;
  correo: string;
  rol: 'administrador' | 'jefe_seccion';
  seccion?: string; // Solo para jefe de sección
}

export interface EditUserProfileRequest {
  id: string;
  nombreCompleto: string;
  correo: string;
}
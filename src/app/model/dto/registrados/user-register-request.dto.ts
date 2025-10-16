/**
 * DTO para solicitud de registro de usuario
 * Corresponde a UserRegisterRequestDTO del backend
 */
export interface UserRegisterRequestDTO {
  username: string;
  faculty: string;
  name: string;
  lastName: string;
  email: string;
  documentTypeId: string;
  documentNumber: string;
  password?: string; // Opcional según el flujo de registro
}
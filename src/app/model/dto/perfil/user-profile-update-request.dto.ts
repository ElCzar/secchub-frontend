/**
 * DTO para actualización de perfil de usuario
 * Corresponde a UserProfileUpdateRequestDTO del backend
 */
export interface UserProfileUpdateRequestDTO {
  name: string;
  lastName: string;
  email: string;
  documentTypeId: string;
  documentNumber: string;
}
/**
 * DTO para respuesta de perfil de usuario
 * Corresponde a UserProfileResponseDTO del backend
 */
export interface UserProfileResponseDTO {
  id: number;
  username: string;
  faculty: string;
  name: string;
  lastName: string;
  email: string;
  documentTypeId: string;
  documentNumber: string;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string;
  role: 'ADMIN' | 'SECTION_HEAD';
  
  // Información específica para jefe de sección
  sectionInfo?: {
    id: number;
    name: string;
    description?: string;
  };
}
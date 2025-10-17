/**
 * DTO para respuesta de información de sección
 * Corresponde a SectionResponseDTO del backend
 */
export interface SectionResponseDTO {
  id: number;
  name: string;
  userId: number;
  description?: string;
  createdDate?: string;
  updatedDate?: string;
}
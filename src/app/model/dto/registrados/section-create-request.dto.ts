/**
 * DTO para solicitud de creación de sección
 * Corresponde a SectionCreateRequestDTO del backend
 */
export interface SectionCreateRequestDTO {
  name: string;
  userId: number;
  description?: string;
}
export interface UserRole {
  id: string;
  name: string;
}

export interface DocumentType {
  id: string;
  name: string;
}

export interface EmploymentType {
  id: number;
  name: string;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
  details?: string;
}
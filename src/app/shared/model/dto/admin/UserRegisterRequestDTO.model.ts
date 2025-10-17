/**
 * Data Transfer Object for User registration requests
 */
export interface UserRegisterRequestDTO {
  username: string;
  password: string;
  faculty: string;
  name: string;
  lastName: string;
  email: string;
  documentTypeId: string;
  documentNumber: string;
}
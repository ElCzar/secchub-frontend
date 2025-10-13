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

export interface UserCreatedResponse {
  id: number;
  username: string;
  email: string;
  role?: string;
}

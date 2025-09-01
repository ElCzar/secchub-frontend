
export interface LoginDto{
  email: string;
  password: string;
}

export interface AuthTokenDto {
  message?: string;
  email?: string;
  token: string | null;
}

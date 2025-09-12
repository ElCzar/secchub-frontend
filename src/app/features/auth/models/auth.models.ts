
export interface LoginDto{
  email: string;
  password: string;
}

export interface AuthTokenDto {
  message?: string;
  email?: string;
  accessToken: string | null;
  refreshToken?: string | null;
  role?: string;
}

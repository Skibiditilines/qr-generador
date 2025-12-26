export interface LoginCredentials {
  user: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  account_type: string;
  exp: number;
}

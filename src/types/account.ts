export interface LoginCredentials {
  user: string;
  password: string;
}

export interface LoginResponse {
  account_id: number;
  access_token: string;
  account_type: string;
  exp: number;
}

export interface LoginCredentials {
  account_user: string;
  account_password: string;
}

export interface LoginResponse {
  access_token: string;
  account_type: string;
  exp: number;
}

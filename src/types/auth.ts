export interface AuthPayload {
  sub: number;
  account_id?: number;
  type: "user" | "administrator";
  iat?: number;
  exp?: number;
}

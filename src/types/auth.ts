export interface AuthPayload {
  sub: number;
  type: "user" | "administrator";
  iat?: number;
  exp?: number;
}

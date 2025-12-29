import jwt from "jsonwebtoken";
import { AuthPayload } from "@/types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: object) {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });

  const decoded = jwt.decode(token) as { exp: number };

  return { token, exp: decoded.exp };
}

export function verifyToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  if (
    typeof decoded.sub !== "number" ||
    (decoded.type !== "user" && decoded.type !== "administrator")
  ) {
    throw new Error("Invalid token structure");
  }

  return {
    sub: decoded.sub,
    type: decoded.type,
    iat: decoded.iat,
    exp: decoded.exp,
  };
}

export function getAuthData(req: Request): AuthPayload {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  return verifyToken(token);
}

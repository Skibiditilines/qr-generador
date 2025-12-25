import { LoginCredentials, LoginResponse } from "@/types/account";

export async function loginService(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Correo o contraseña incorrectos");
      }
      if (response.status >= 500) {
        throw new Error("Error interno del servidor");
      }
      throw new Error("Error al iniciar sesión");
    }

    return response.json();
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }
}

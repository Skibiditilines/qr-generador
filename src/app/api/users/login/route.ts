import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/hash";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

interface LoginRequest {
  account_user: string;
  account_password: string;
}

export async function POST(req: Request) {
  try {
    const body: LoginRequest = await req.json();
    const { account_user, account_password } = body;

    // Buscar usuario activo por username
    const user = await prisma.account.findUnique({
      where: { account_user },
    });

    if (!user || !user.is_active) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValid = await verifyPassword(
      account_password,
      user.account_password
    );
    if (!isValid) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Generar token JWT usando account_id como sub
    const token = signToken({
      sub: user.account_id, // más seguro que usar el username
      type: user.account_type,
    });

    // Timestamp de expiración en segundos
    const exp = Math.floor(Date.now() / 1000) + 30 * 60; // 30 min

    return NextResponse.json({
      access_token: token,
      account_type: user.account_type,
      exp,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

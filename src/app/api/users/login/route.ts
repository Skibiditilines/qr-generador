import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/hash";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { account_user, account_password } = body;

    const user = await prisma.account.findUnique({
      where: { account_user },
    });

    if (!user || !user.is_active) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(account_password, user.account_password);

    if (!valid) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = signToken({
      sub: user.account_user,
      type: user.account_type,
    });

    return NextResponse.json({
      access_token: token,
      account_type: user.account_type,
      exp: new Date(Date.now() + 30 * 60 * 1000),
    });
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/hash";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

interface LoginRequest {
  user: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const body: LoginRequest = await req.json();
    const { user, password } = body;

    const account = await prisma.account.findUnique({
      where: { user },
    });

    if (!account || !account.is_active) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, account.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({
      sub: account.account_id,
      type: account.account_type,
    });

    const exp = Math.floor(Date.now() / 1000) + 30 * 60;

    return NextResponse.json({
      access_token: token,
      account_type: account.account_type,
      exp,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

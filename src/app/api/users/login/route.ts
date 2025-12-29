import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/hash";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user, password } = await req.json();

    if (!user || !password) {
      return NextResponse.json(
        { message: "Missing credentials" },
        { status: 400 }
      );
    }

    const account = await prisma.account.findUnique({
      where: { user },
    });

    if (!account) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, account.password);

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { token, exp } = signToken({
      sub: account.account_id,
      type: account.account_type,
    });

    return NextResponse.json({
      account_id: account.account_id,
      access_token: token,
      account_type: account.account_type,
      exp,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

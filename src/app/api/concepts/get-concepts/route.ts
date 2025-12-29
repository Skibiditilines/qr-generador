import { prisma } from "@/lib/prisma";
import { getAuthData } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const auth = getAuthData(req);
    const accountId = auth.sub;

    const concepts = await prisma.concept.findMany({
      select: {
        concept_id: true,
        date: true,
        slug: true,
      },
      where: {
        account_id: accountId,
        is_active: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(concepts);
  } catch (error) {
    console.error("Get concepts error:", error);
    return NextResponse.json(
      { message: "Unauthorized or error" },
      { status: 401 }
    );
  }
}

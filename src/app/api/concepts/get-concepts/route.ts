import { prisma } from "@/lib/prisma";
import { getAuthData } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const auth = getAuthData(req);
    const accountId = auth.sub;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;

    const whereClause = {
      account_id: accountId,
      is_active: true,
    };

    const [concepts, total] = await prisma.$transaction([
      prisma.concept.findMany({
        select: {
          concept_id: true,
          date: true,
          slug: true,
        },
        where: whereClause,
        orderBy: {
          date: "desc",
        },
        skip: skip,
        take: limit,
      }),
      prisma.concept.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      data: concepts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get concepts error:", error);
    return NextResponse.json(
      { message: "Unauthorized or error" },
      { status: 401 }
    );
  }
}

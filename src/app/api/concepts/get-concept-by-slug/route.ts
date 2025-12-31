import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { message: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const concepts = await prisma.concept.findMany({
      select: {
        concept_id: true,
        date: true,
        content: true,
        color: true,
        image_url: true,
        slug: true,
        note: true,
        is_active: true,
      },
      where: {
        slug: slug,
        is_active: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    if (!concepts || concepts.length === 0) {
      return NextResponse.json(
        { message: "Concept not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(concepts);
  } catch (error) {
    console.error("Get concepts by slug error:", error);
    return NextResponse.json(
      { message: "Error retrieving concepts" },
      { status: 500 }
    );
  }
}

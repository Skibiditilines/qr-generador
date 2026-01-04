import { prisma } from "@/lib/prisma";
import { getAuthData } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const auth = getAuthData(req);
    const accountId = auth.sub;

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { message: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const existingConcept = await prisma.concept.findFirst({
      where: {
        slug,
        account_id: accountId,
        is_active: true,
      },
    });

    if (!existingConcept) {
      return NextResponse.json(
        { message: "Concept not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.concept.update({
      where: { concept_id: existingConcept.concept_id },
      data: { is_active: false },
    });

    return NextResponse.json({ message: "Concept deleted successfully" });
  } catch (error) {
    console.error("Delete concept error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

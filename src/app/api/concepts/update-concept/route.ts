import { prisma } from "@/lib/prisma";
import { getAuthData } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const auth = getAuthData(req);
    const accountId = auth.sub;

    const body = await req.json();
    const { concept_id, content, color, image_url, slug, note } = body;

    if (!concept_id) {
      return NextResponse.json(
        { message: "Concept ID is required" },
        { status: 400 }
      );
    }

    // Verificar que el concepto pertenezca al usuario
    const existingConcept = await prisma.concept.findFirst({
      where: {
        concept_id: concept_id,
        account_id: accountId,
      },
    });

    if (!existingConcept) {
      return NextResponse.json(
        { message: "Concept not found or access denied" },
        { status: 404 }
      );
    }

    // Actualizar
    const updatedConcept = await prisma.concept.update({
      where: { concept_id },
      data: {
        content,
        color,
        image_url,
        slug,
        note,
      },
    });

    return NextResponse.json(updatedConcept);
  } catch (error) {
    console.error("Update concept error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

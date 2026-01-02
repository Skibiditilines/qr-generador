import { prisma } from "@/lib/prisma";
import { getAuthData } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const auth = getAuthData(req);
    const accountId = auth.sub;

    // Obtener ID desde query params (ej: /api/concepts/delete?id=1)
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { message: "ID parameter is required" },
        { status: 400 }
      );
    }

    const conceptId = parseInt(idParam);

    // Verificar propiedad
    const existingConcept = await prisma.concept.findFirst({
      where: {
        concept_id: conceptId,
        account_id: accountId,
      },
    });

    if (!existingConcept) {
      return NextResponse.json(
        { message: "Concept not found or access denied" },
        { status: 404 }
      );
    }

    // Borrado Lógico (Soft Delete)
    await prisma.concept.update({
      where: { concept_id: conceptId },
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

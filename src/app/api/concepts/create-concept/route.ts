import { prisma } from "@/lib/prisma";
import { getAuthData } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // 1. Verificar autenticación
        const auth = getAuthData(req);
        const accountId = auth.sub;

        // 2. Obtener datos del body
        const body = await req.json();
        const { content, color, image_url, slug, note } = body;

        // 3. Validaciones básicas
        if (!content || !slug || !image_url) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // 4. Verificar si el slug ya existe (debe ser único)
        const existingSlug = await prisma.concept.findUnique({
            where: { slug },
        });

        if (existingSlug) {
            return NextResponse.json(
                { message: "Slug already exists" },
                { status: 409 }
            );
        }

        // 5. Crear el concepto
        const newConcept = await prisma.concept.create({
            data: {
                content,
                color: color || "#000000", // Valor por defecto si no viene
                image_url,
                slug,
                note,
                date: new Date(),
                is_active: true,
                account_id: accountId,
            },
        });

        return NextResponse.json(newConcept, { status: 201 });
    } catch (error) {
        console.error("Create concept error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
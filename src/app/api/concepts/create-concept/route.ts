import { prisma } from "@/lib/prisma";
import { getAuthData } from "@/lib/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Genera un slug único de 8 caracteres
 */
async function generateUniqueSlug(): Promise<string> {
  while (true) {
    const slug = crypto.randomBytes(4).toString("hex");

    const found = await prisma.concept.findUnique({
      where: { slug },
    });

    if (!found) {
      return slug;
    }
  }
}

export async function POST(req: Request) {
  try {
    const auth = getAuthData(req);
    const accountId = auth.sub;

    const body = await req.json();
    const { content, color, image_url, note } = body;

    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug();

    const concept = await prisma.concept.create({
      data: {
        content,
        slug,
        color: color || "#000000",
        image_url: image_url || null,
        note: note || null,
        date: new Date(),
        is_active: true,
        account_id: accountId,
      },
    });

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/${concept.slug}`;

    return NextResponse.json(
      {
        url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create concept error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

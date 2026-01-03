import { AllConceptResponse } from "@/types/concept";

export async function getConceptBySlug(
  slug: string
): Promise<AllConceptResponse[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/concepts/get-concept-by-slug?slug=${slug}`,
    { method: "GET" }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch concept by slug");
  }
  const data = await response.json();
  return data;
}

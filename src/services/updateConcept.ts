import { AllConceptResponse } from "@/types/concept";

export async function updateConcept(
  concept_id: number,
  access_token: string,
  data: Partial<AllConceptResponse>
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/concepts/update-concept`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ concept_id: concept_id, ...data }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update concept");
  }

  return await response.json();
}

import { CreateConceptPayload, CreateConceptResponse } from "@/types/concept";

export async function createConcept(
  accessToken: string,
  payload: CreateConceptPayload
): Promise<CreateConceptResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/concepts/create-concept`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => null);

    throw new Error(error?.message || `Error creating concept (${res.status})`);
  }

  return res.json();
}

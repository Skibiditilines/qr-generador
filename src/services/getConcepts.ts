import { ConceptResponse } from "@/types/concept";

export async function getConcepts(
  accountId: number,
  accessToken: string
): Promise<ConceptResponse[]> {
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/concepts/get-concepts?account_id=${encodeURIComponent(accountId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch concepts");
  }

  return response.json();
}

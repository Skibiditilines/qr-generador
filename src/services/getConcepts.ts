import { ConceptResponse } from "@/types/concept";

export interface PaginatedConceptsResponse {
  data: ConceptResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function getConcepts(
  accountId: number,
  accessToken: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedConceptsResponse> {
  const queryParams = new URLSearchParams({
    account_id: accountId.toString(),
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/concepts/get-concepts?${queryParams.toString()}`,
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

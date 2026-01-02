export interface ConceptResponse {
  concept_id: number;
  date: string;
  slug: string;
}

export interface AllConceptResponse {
  concept_id: number;
  date: string;
  content: string;
  color: string;
  image_url: string;
  slug: string;
  note: string;
  is_active: boolean;
}

export interface CreateConceptPayload {
  content: string;
  color?: string;
  image_url?: string;
  note?: string;
}

export interface CreateConceptResponse {
  url: string;
}

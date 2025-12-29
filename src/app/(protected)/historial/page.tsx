"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { getConcepts } from "@/services/getConcepts";
import { ConceptResponse } from "@/types/concept";
import ConceptCard from "@/components/ConceptCard";
import Header from "@/components/Header";

export default function HistorialPage() {
  const { user } = useAuth();

  const [concepts, setConcepts] = useState<ConceptResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingConcepts, setLoadingConcepts] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoadingConcepts(true);

    getConcepts(user.account_id, user.access_token)
      .then(setConcepts)
      .catch(() => setError("Error al cargar el historial de conceptos"))
      .finally(() => setLoadingConcepts(false));
  }, [user]);

  return (
    <>
      <Header />

      <main className="p-4">
        {loadingConcepts && <p>Cargando conceptos...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loadingConcepts && concepts.length === 0 && (
          <p>No hay conceptos registrados</p>
        )}

        <ul className="row list-unstyled g-4">
          {concepts.map((concept) => (
            <ConceptCard key={concept.slug} concept={concept} />
          ))}
        </ul>
      </main>
    </>
  );
}

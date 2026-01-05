"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { getConcepts } from "@/services/getConcepts";
import { ConceptResponse } from "@/types/concept";
import ConceptCard from "@/components/ConceptCard";
import Header from "@/components/Header";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function HistorialPage() {
  const { user } = useAuth();

  const [concepts, setConcepts] = useState<ConceptResponse[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loadingConcepts, setLoadingConcepts] = useState(false);

  const LIMIT = 8;

  useEffect(() => {
    if (!user) return;

    const fetchConcepts = async () => {
      setLoadingConcepts(true);
      setError(null);
      try {
        const response = await getConcepts(
          user.account_id,
          user.access_token,
          page,
          LIMIT
        );

        setConcepts(response.data);
        setMeta(response.meta);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el historial de conceptos");
      } finally {
        setLoadingConcepts(false);
      }
    };

    fetchConcepts();
  }, [user, page]);

  const handleConceptDeleted = (slug: string) => {
    setConcepts((prev) => prev.filter((c) => c.slug !== slug));
    setMeta((prev) =>
      prev
        ? {
            ...prev,
            total: prev.total - 1,
          }
        : prev
    );
  };

  const handleNextPage = () => {
    if (meta?.hasNextPage) setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (meta?.hasPrevPage) setPage((prev) => prev - 1);
  };

  return (
    <div>
      <Header />

      <main className="container py-4">
        <div className="d-flex w-100 justify-content-end mb-4">
          {meta && (
            <small className="text-muted">Total: {meta.total} registros</small>
          )}
        </div>

        {loadingConcepts && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loadingConcepts && concepts.length === 0 && !error && (
          <div className="text-center py-5 rounded">
            <p className="mb-0">No hay conceptos registrados en esta página.</p>
          </div>
        )}

        {!loadingConcepts && concepts.length > 0 && (
          <>
            <ul className="row list-unstyled g-4 d-flex justify-content-center">
              {concepts.map((concept) => (
                <ConceptCard
                  key={concept.slug}
                  concept={concept}
                  onDeleted={handleConceptDeleted}
                />
              ))}
            </ul>

            <nav className="mt-5">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${
                    !meta?.hasPrevPage ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={handlePrevPage}
                    disabled={!meta?.hasPrevPage}
                  >
                    Anterior
                  </button>
                </li>

                <li className="page-item disabled">
                  <span className="page-link">
                    Página {meta?.page} de {meta?.totalPages}
                  </span>
                </li>

                <li
                  className={`page-item ${
                    !meta?.hasNextPage ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={handleNextPage}
                    disabled={!meta?.hasNextPage}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </>
        )}
      </main>
    </div>
  );
}

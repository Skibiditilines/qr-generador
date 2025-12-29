import { notFound } from "next/navigation";

interface ConceptPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/concepts/get-concept-by-slug?slug=${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    notFound();
  }

  const concept = await res.json();

  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card p-4 shadow-sm rounded-4" style={{ maxWidth: 500 }}>
        <h4 className="fw-semibold mb-3">Resultado del QR</h4>

        <p className="text-muted mb-2">
          Código: <strong>{concept.slug}</strong>
        </p>

        <div className="alert alert-primary text-center">{concept.content}</div>

        <p className="text-muted small text-end mb-0">
          {new Date(concept.date).toLocaleDateString()}{" "}
          {new Date(concept.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </main>
  );
}

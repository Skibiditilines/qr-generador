import { notFound } from "next/navigation";
import QRCardUI from "@/components/QRCard";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ConceptPage({ params }: Props) {
  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/concepts/get-concept-by-slug?slug=${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    notFound();
  }

  const concept = data[0];

  return (
    <main
      className="d-flex justify-content-center align-items-center px-3 py-5 w-100"
      style={{ minHeight: "100vh" }}
    >
      <QRCardUI concept={concept} />
    </main>
  );
}

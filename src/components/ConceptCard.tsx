import { useEffect, useState } from "react";
import { ConceptResponse } from "@/types/concept";
import { useRouter } from "next/navigation";
import { deleteConcept } from "@/services/deleteConcept";
import { useAuth } from "@/auth/useAuth";
import DeleteConceptModal from "./DeleteConceptModal";
import QRCode from "qrcode";

interface Props {
  concept: ConceptResponse;
  onDeleted: (slug: string) => void;
}

export default function ConceptCard({ concept, onDeleted }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [qr, setQr] = useState("");
  const [errorDelete, setErrorDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const url = `http://generadordeqr.vercel.app/${concept.slug}`;

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 500,
      margin: 1,
      errorCorrectionLevel: "H",
      scale: 8,
    }).then(setQr);
  }, [url]);

  async function handleDelete() {
    try {
      if (!user) throw new Error("User not authenticated");
      setDeleting(true);

      await deleteConcept(concept.slug, user.access_token);

      onDeleted(concept.slug);
      setShowDeleteModal(false);
    } catch (error) {
      setErrorDelete("Error al eliminar el concepto");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <li className="col-12 col-sm-6 col-md-4" style={{ maxWidth: "300px" }}>
        <div className="card h-100 border-0">
          <div className="p-3 text-center">
            {qr && (
              <img
                src={qr}
                alt="QR"
                className="img-fluid rounded"
                style={{ maxWidth: "120px" }}
              />
            )}
          </div>

          <div className="px-3 fs-6 pt-2 mb-2">
            <div className="d-flex justify-content-between align-items-center">
              <small className="fw-medium">Link</small>
              <button
                className="btn btn-sm"
                onClick={() => navigator.clipboard.writeText(url)}
              >
                <i className="bi bi-copy" /> Copiar
              </button>
            </div>

            <a className="small text-break" href={url} target="_blank">
              {url}
            </a>
          </div>

          <div className="px-3 mb-3 fs-6">
            <div className="row small">
              <div className="col-4">
                <div className="fw-medium">Formato</div>
                <div>PNG</div>
              </div>
              <div className="col-8">
                <div className="fw-medium">Fecha</div>
                <div>
                  {new Date(concept.date).toLocaleDateString()}{" "}
                  {new Date(concept.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 pb-3 mt-auto d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary flex-grow-1"
              onClick={() => router.push(`/editar-qr/${concept.slug}`)}
            >
              <i className="bi bi-pencil" /> Editar
            </button>

            <button
              className="btn btn-sm btn-outline-danger flex-grow-1"
              onClick={() => {
                setErrorDelete(null);
                setShowDeleteModal(true);
              }}
            >
              <i className="bi bi-trash" /> Eliminar
            </button>
            <a
              href={qr}
              download={`QR-${concept.slug}.png`}
              className="btn btn-sm d-flex align-items-center justify-content-center"
              title="Descargar"
              style={{
                background: "linear-gradient(90deg, #1d79caff, #1E88E5)",
                color: "white",
                fontWeight: 600,
                width: "36px",
              }}
            >
              <i className="bi bi-download"></i>
            </a>
          </div>
        </div>
      </li>

      <DeleteConceptModal
        show={showDeleteModal}
        loading={deleting}
        onClose={() => {
          setShowDeleteModal(false);
          setErrorDelete(null);
        }}
        onConfirm={handleDelete}
        message={`¿Seguro que deseas eliminar el QR "${concept.slug}"?`}
        error={errorDelete}
      />
    </>
  );
}

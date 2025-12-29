import { useEffect, useState } from "react";
import { ConceptResponse } from "@/types/concept";
import QRCode from "qrcode";

export default function ConceptCard({ concept }: { concept: ConceptResponse }) {
  const [qr, setQr] = useState<string>("");

  const url = `http://qr-generador-navy.vercel.app/${concept.slug}`;

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 500,
      margin: 2,
    }).then(setQr);
  }, [url]);

  return (
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

        <div className="d-flex justify-content-center gap-2 pt-2">
          <button
            className="btn d-flex gap-1"
            style={{
              fontSize: "12px",
              color: "#1E88E5",
            }}
          >
            <i className="bi bi-pencil"></i>
            Editar
          </button>
          <button
            className="btn d-flex gap-1"
            style={{ fontSize: "12px", color: "#E53935" }}
          >
            <i className="bi bi-trash"></i>
            Eliminar
          </button>
        </div>

        <div className="px-3 fs-6">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="fw-medium">Link</small>
            <button
              className="btn btn-sm"
              onClick={() => navigator.clipboard.writeText(url)}
            >
              <i className="bi bi-copy"></i> Copiar
            </button>
          </div>

          <p className="small text-break mb-3">{url}</p>
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

        <div className="px-3 pb-3 mt-auto">
          <a
            href={qr}
            download
            className="btn w-100 d-flex align-items-center justify-content-center gap-2"
            style={{
              background: "linear-gradient(90deg, #1d79caff, #1E88E5)",
              color: "white",
              fontWeight: 600,
            }}
          >
            <i className="bi bi-download"></i>
            Descargar
          </a>
        </div>
      </div>
    </li>
  );
}

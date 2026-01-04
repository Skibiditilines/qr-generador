"use client";

import { AllConceptResponse } from "@/types/concept";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { useState } from "react";
import ImageModal from "@/components/ImageModal";
import remarkBreaks from "remark-breaks";

interface Props {
  concept: AllConceptResponse;
}

export default function QRCard({ concept }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="card w-100 shadow-sm rounded-1" style={{ maxWidth: 380 }}>
        <div className="p-3">
          <span className="d-flex align-items-center gap-3 mb-4">
            <i className="bi bi-phone-fill"></i>
            <h1 className="fw-semibold fs-5 mb-0">Resultado del QR</h1>
          </span>

          {concept.image_url && (
            <div
              style={{ width: "150px", cursor: "pointer" }}
              className="mb-3"
              onClick={() => setShowModal(true)}
              title="Click para ampliar"
            >
              <Image
                src={concept.image_url}
                alt="Imagen del código QR"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: "100%", height: "auto" }}
                className="rounded-3 d-block"
              />
            </div>
          )}

          <ReactMarkdown
            remarkPlugins={[remarkBreaks]}
            components={{
              h1: ({ children }) => (
                <h1 className="fs-6 fw-bold mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="fs-6 fw-semibold mb-2">{children}</h2>
              ),
              p: ({ children }) => <p className="mb-2">{children}</p>,
              ul: ({ children }) => <ul className="ps-3 mb-2">{children}</ul>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-start border-3 ps-3 text-muted mb-2">
                  {children}
                </blockquote>
              ),
            }}
          >
            {concept.content}
          </ReactMarkdown>
        </div>

        {concept.note && (
          <div
            className="px-3 py-3 mt-3 rounded-bottom-1"
            style={{ backgroundColor: concept.color || "#6c757d" }}
          >
            <p className="fw-semibold text-light mb-0 fs-6">{concept.note}</p>
          </div>
        )}
      </div>

      {concept.image_url && (
        <ImageModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          imageUrl={concept.image_url}
        />
      )}
    </>
  );
}

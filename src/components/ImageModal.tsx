"use client";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  altText,
}: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        zIndex: 1050,
        backdropFilter: "blur(5px)",
      }}
      onClick={onClose}
    >
      <div
        className="position-relative p-2"
        style={{ maxWidth: "90vw", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={altText || "Imagen ampliada"}
          width={1200}
          height={800}
          className="rounded shadow"
          style={{
            maxWidth: "100%",
            maxHeight: "85vh",
            objectFit: "contain",
            width: "auto",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
}

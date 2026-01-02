"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/auth/useAuth";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { createConcept } from "@/services/createConcept";
import { uploadImageToCloudinary } from "@/services/cloudinary";
import Header from "@/components/Header";
import QRCard from "@/components/QRCard";
import QRCode from "qrcode";
import jsPDF from "jspdf";

export default function CrearQRPage() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
  }, [user]);

  // Estados de UI
  const [errorCreate, setErrorCreate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreated, setIsCreated] = useState<boolean>(false);

  // Estados del Formulario
  const [content, setContent] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<string>("png");

  // 2. ESTADO: Guardamos la URL final que nos da el backend
  const [generatedUrl, setGeneratedUrl] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewConcept = {
    content: content || "Sin contenido",
    image_url: imagePreview || null,
    note: note,
    color: color,
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setIsCreated(false);
    }
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    setIsCreated(false);
  };

  async function handleCreate() {
    if (!user) return;

    setIsLoading(true);
    setErrorCreate(null);
    setIsCreated(false);

    try {
      let finalImageUrl = "";

      if (imageFile) {
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      }

      const result = await createConcept(user.access_token, {
        content: content,
        color: color || undefined,
        image_url: finalImageUrl || undefined,
        note: note || undefined,
      });

      console.log("QR Creado exitosamente:", result);

      if (result && result.url) {
        setGeneratedUrl(result.url);
      } else {
        setGeneratedUrl(typeof result === "string" ? result : content);
      }

      setIsCreated(true);
    } catch (error) {
      console.error(error);
      setErrorCreate(
        (error as Error).message || "Error desconocido al crear el QR"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = async () => {
    if (!isCreated || !generatedUrl) return;

    try {
      const opts = {
        errorCorrectionLevel: "H" as const,
        type: "image/png" as const,
        quality: 1,
        margin: 1,
        width: 1024,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      };

      const dataUrl = await QRCode.toDataURL(generatedUrl, opts);

      const filename = `qr-code-${Date.now()}`;

      if (downloadFormat === "pdf") {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [100, 100],
        });

        pdf.addImage(dataUrl, "PNG", 10, 10, 80, 80);
        pdf.save(`${filename}.pdf`);
      } else if (downloadFormat === "jpg") {
        const jpgDataUrl = await QRCode.toDataURL(generatedUrl, {
          ...opts,
          type: "image/jpeg",
        });

        const link = document.createElement("a");
        link.href = jpgDataUrl;
        link.download = `${filename}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Error generando la imagen para descarga", err);
      alert("Error al generar el archivo de descarga");
    }
  };

  return (
    <div>
      <Header />
      <main className="p-4 container">
        <div className="row">
          <div className="col-12 col-lg-8 order-1 order-lg-1">
            <div className="card p-3 shadow-sm rounded-4">
              <label className="form-label fw-bold">Contenido del QR</label>
              <MarkdownEditor value={content} onChange={handleContentChange} />
            </div>

            <div className="card p-3 shadow-sm rounded-4 mt-3">
              <div className="row g-3">
                <div className="col">
                  <label className="form-label fw-bold fs-6">
                    Nota <i>(opcional)</i>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nota adicional"
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setIsCreated(false);
                    }}
                    disabled={isLoading}
                  />
                </div>
                <div className="col-auto">
                  <label className="form-label fw-bold fs-6">Color</label>
                  <input
                    type="color"
                    className="form-control form-control-color w-100"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      setIsCreated(false);
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="row mt-3 g-3">
              <div className="col-12 col-md-6">
                <div className="card h-100 p-3 shadow-sm rounded-4">
                  <label className="form-label fw-bold mb-3">
                    Imagen del QR
                  </label>
                  <div
                    className="d-flex flex-column align-items-center justify-content-center p-3 border border-2 border-dashed rounded flex-grow-1"
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    style={{
                      cursor: isLoading ? "not-allowed" : "pointer",
                      minHeight: "140px",
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: "120px" }}
                      />
                    ) : (
                      <div className="text-center text-muted">
                        <i className="bi bi-camera fs-2"></i>
                        <p className="mb-0">Haz clic para subir una imagen</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="d-none"
                      accept="image/*"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 mb-3">
                <div className="card p-3 shadow-sm rounded-4">
                  <label className="form-label fw-bold mb-3">
                    Formato de descarga
                  </label>
                  <div className="d-flex justify-content-center flex-grow-1 gap-2">
                    {["png", "jpg", "pdf"].map((fmt) => (
                      <button
                        key={fmt}
                        className={`btn ${
                          downloadFormat === fmt
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        } rounded-4 fw-bold py-2 fs-6`}
                        onClick={() => setDownloadFormat(fmt)}
                        disabled={isLoading}
                        style={{ width: "100px", height: "45px" }}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4 order-2 order-lg-2 mb-3 mb-lg-0">
            <div className="d-flex justify-content-center">
              <QRCard concept={previewConcept as any} />
            </div>

            {errorCreate && (
              <div className="alert alert-danger mt-3" role="alert">
                {errorCreate}
              </div>
            )}

            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-primary flex-grow-1 rounded-4 fw-bold py-2"
                onClick={handleCreate}
                disabled={isLoading || !content}
              >
                {isLoading ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Guardando...
                  </span>
                ) : (
                  "Generar QR"
                )}
              </button>

              <button
                className={`btn btn-success rounded-4 d-flex align-items-center justify-content-center ${
                  !isCreated ? "opacity-50" : ""
                }`}
                style={{ width: "50px" }}
                onClick={handleDownload}
                disabled={!isCreated || isLoading}
                title={`Descargar como ${downloadFormat.toUpperCase()}`}
              >
                <i className="bi bi-download fs-5"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

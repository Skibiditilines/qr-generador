"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/auth/useAuth";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import Header from "@/components/Header";
import QRCard from "@/components/QRCard";
import { getConceptBySlug } from "@/services/getConceptBySlug";
import { updateConcept } from "@/services/updateConcept";
import { uploadImageToCloudinary } from "@/services/cloudinary";
import QRCode from "qrcode";
import jsPDF from "jspdf";

export default function EditQrPage() {
  const { user } = useAuth();
  const params = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [conceptId, setConceptId] = useState<number | null>(null);
  const [content, setContent] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [color, setColor] = useState<string>("#d41b1b");

  // Manejo de Imágenes
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Estados de Descarga QR
  const [downloadFormat, setDownloadFormat] = useState<string>("png");
  const [generatedUrl, setGeneratedUrl] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewConcept = {
    content: content || "Sin contenido",
    image_url: imagePreview || null,
    note: note || null,
    color: color || null,
  };

  useEffect(() => {
    const loadData = async () => {
      const slug = String(params.slug);
      if (!slug) return;

      try {
        setIsLoading(true);
        const data = await getConceptBySlug(slug);

        if (data && data.length > 0) {
          const item = data[0];
          setConceptId(item.concept_id);
          setContent(item.content);
          setNote(item.note || "");
          setColor(item.color || "#d41b1b");
          setImagePreview(item.image_url || null);

          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
          setGeneratedUrl(`${baseUrl}/qr/${item.slug}`);
        } else {
          setErrorMsg("Concepto no encontrado");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Error al cargar los datos del QR");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [params.slug, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setSuccessMsg(null);
    }
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    setSuccessMsg(null);
  };

  async function handleUpdate() {
    if (!user || !conceptId) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let finalImageUrl = imagePreview;

      if (imageFile) {
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      }

      await updateConcept(conceptId, user.access_token, {
        content,
        note,
        color,
        image_url: finalImageUrl || "",
      });

      setSuccessMsg("¡Cambios guardados exitosamente!");

      if (finalImageUrl) setImagePreview(finalImageUrl);
      setImageFile(null);
    } catch (error) {
      console.error(error);
      setErrorMsg((error as Error).message || "Error al actualizar el QR");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDownload = async () => {
    if (!generatedUrl) return;

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
      const filename = `qr-${params.slug}`;

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
      console.error("Error generando descarga", err);
      alert("Error al generar el archivo");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

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
                  <textarea
                    className="form-control"
                    placeholder="Nota adicional"
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setSuccessMsg(null);
                    }}
                    disabled={isSaving}
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
                      setSuccessMsg(null);
                    }}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12 col-md-6 mb-3">
                <div className="card h-100 p-3 shadow-sm rounded-4">
                  <label className="form-label fw-bold">Imagen del QR</label>
                  <div
                    className="d-flex flex-column align-items-center justify-content-center p-3 border border-2 border-dashed rounded flex-grow-1"
                    onClick={() => !isSaving && fileInputRef.current?.click()}
                    style={{
                      cursor: isSaving ? "not-allowed" : "pointer",
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
                        <p className="mb-0">Clic para cambiar imagen</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="d-none"
                      accept="image/*"
                      disabled={isSaving}
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
                        disabled={isSaving}
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

            {errorMsg ? (
              <div className="alert alert-danger mt-3" role="alert">
                {errorMsg}
              </div>
            ) : successMsg ? (
              <div className="alert alert-success mt-3" role="alert">
                {successMsg}
              </div>
            ) : (
              <div className="alert alert-info mt-3" role="alert">
                Actualiza el contenido y haz clic en &quot;Guardar Cambios&quot;
              </div>
            )}

            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-primary flex-grow-1 rounded-4 fw-bold py-2"
                onClick={handleUpdate}
                disabled={isSaving || !content}
              >
                {isSaving ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Guardando...
                  </span>
                ) : (
                  "Guardar Cambios"
                )}
              </button>

              <button
                className="btn btn-success rounded-4 d-flex align-items-center justify-content-center"
                style={{ width: "50px" }}
                onClick={handleDownload}
                disabled={isSaving}
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

interface ConfirmDeleteModalProps {
  show: boolean;
  title?: string;
  message?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConceptModal({
  show,
  title = "Eliminar elemento",
  message = "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.",
  loading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4">
          <div className="modal-header">
            <h5 className="modal-title text-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>

          {error && (
            <div className="alert alert-danger mx-3" role="alert">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

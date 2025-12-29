"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/auth/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/historial");
    }
  }, [isAuthenticated, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(user, password);
      console.log("Login result:", result);
      router.push("/historial");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error inesperado");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div>
        <div className="text-center mb-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 bg-primary bg-opacity-10"
            style={{ width: 56, height: 56 }}
          >
            <i className="bi bi-qr-code-scan fs-4 text-primary"></i>
          </div>
        </div>

        <h4 className="text-center fw-semibold mb-1">Bienvenido de nuevo</h4>
        <p className="text-center text-muted mb-4">
          Ingresa tu usuario y contraseña para acceder
        </p>

        <div
          className="card shadow-sm border-0 p-4 rounded-4"
          style={{ width: 360 }}
        >
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-medium">Usuario</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person-fill text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill text-muted"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 text-center">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

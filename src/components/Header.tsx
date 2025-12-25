import { useAuth } from "@/auth/useAuth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function Header() {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const getTitle = () => {
    if (pathname.includes("/historial")) return "Historial";
    return "Aplicación QR";
  };
  return (
    <header className="d-flex justify-content-between align-items-center p-3 border-bottom">
      <h1 className="h5 mb-0 fw-bold">{getTitle()}</h1>
      <div className="d-flex align-items-center">
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-link p-0 border-0 d-flex align-items-center text-decoration-none"
          title="Cerrar Sesión"
        >
          <span className="d-none d-sm-inline me-2 text-secondary fw-medium">
            Salir
          </span>

          <i
            className="bi bi-box-arrow-right fs-4 text-danger"
            style={{ cursor: "pointer" }}
          ></i>
        </button>
      </div>
    </header>
  );
}

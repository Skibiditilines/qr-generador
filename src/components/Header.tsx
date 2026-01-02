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
    if (pathname.includes("/crear-qr")) return "Crear Código QR";
    return "Aplicación QR";
  };
  return (
    <header className="d-flex justify-content-between align-items-center p-3 border-bottom bg-body">
      <span className="d-flex align-items-center gap-2">
        {pathname.includes("/historial") ? (
          <i
            className="bi bi-clock-history fs-4"
            style={{ cursor: "pointer" }}
          ></i>
        ) : pathname.includes("/crear-qr") ? (
          <i
            className="bi bi-arrow-left fs-4"
            onClick={() => router.push("/historial")}
          ></i>
        ) : (
          <i className="bi bi-app fs-4"></i>
        )}
        <h1 className="h5 mb-0 fw-bold">{getTitle()}</h1>
      </span>
      <div className="d-flex align-items-center">
        {pathname.includes("/historial") && (
          <button
            type="button"
            className="btn fw-bold me-5"
            style={{ backgroundColor: "#1E88E5", color: "#FFFFFF" }}
            onClick={() => router.push("/crear-qr")}
          >
            Crear QR
          </button>
        )}
        {pathname == "/historial" && (
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-link p-0 border-0 d-flex align-items-center text-decoration-none"
            title="Cerrar Sesión"
          >
            <i
              className="bi bi-box-arrow-right fs-4"
              style={{ cursor: "pointer" }}
            ></i>
          </button>
        )}
      </div>
    </header>
  );
}

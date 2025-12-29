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
      <span className="d-flex align-items-center gap-2">
        <i className="bi bi-code-slash"></i>
        <h1 className="h5 mb-0 fw-bold">{getTitle()}</h1>
      </span>
      <div className="d-flex align-items-center">
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
      </div>
    </header>
  );
}

"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-outline-secondary rounded-circle position-fixed bottom-0 end-0 m-3 shadow"
      style={{ width: 44, height: 44, zIndex: 1000 }}
      aria-label="Cambiar tema"
    >
      {theme === "light" ? (
        <i className="bi bi-moon-fill"></i>
      ) : (
        <i className="bi bi-sun-fill"></i>
      )}
    </button>
  );
}

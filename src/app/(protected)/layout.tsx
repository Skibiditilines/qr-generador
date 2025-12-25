"use client";

import { useAuth } from "@/auth/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated === null)
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

    if (
      pathname.startsWith("/admin") &&
      user?.account_type !== "administrator"
    ) {
      router.replace("/historial");
    }
  }, [isAuthenticated, user, pathname, router]);

  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border" />
      </div>
    );
  }

  return <>{children}</>;
}

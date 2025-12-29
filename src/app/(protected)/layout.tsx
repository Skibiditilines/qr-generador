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
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.account_type !== "administrator") {
      router.replace("/historial");
    }
  }, [isAuthenticated, user, pathname, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

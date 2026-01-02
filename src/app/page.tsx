"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/auth/useAuth";

export default function Home() {
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
}

"use client";

import { useState } from "react";
import { AuthContext } from "./authContext";
import { AuthManager } from "./authManager";
import { loginService } from "@/services/loginService";
import { LoginResponse } from "@/types/account";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Inicializar estado desde localStorage directamente
  const initialAuth = AuthManager.getAuthData();
  const [user, setUser] = useState<LoginResponse | null>(initialAuth);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialAuth);
  const [loading, setLoading] = useState(false); // opcional para control de carga

  async function login(account_user: string, account_password: string) {
    setLoading(true);
    const data = await loginService({ account_user, account_password });

    const authData: LoginResponse = {
      access_token: data.access_token,
      account_type: data.account_type,
      exp: data.exp, // asumir que ya viene en segundos
    };

    AuthManager.saveAuthData(authData);
    setUser(authData);
    setIsAuthenticated(true);
    setLoading(false);

    return authData;
  }

  function logout() {
    AuthManager.logout();
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {loading ? <div>Cargando...</div> : children}
    </AuthContext.Provider>
  );
}

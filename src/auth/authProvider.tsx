"use client";

import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { AuthManager } from "./authManager";
import { loginService } from "@/services/loginService";
import { LoginResponse } from "@/types/account";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = AuthManager.getAuthData();
    if (auth) {
      setUser(auth);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  async function login(user: string, password: string) {
    setLoading(true);
    const data = await loginService({ user, password });

    const authData: LoginResponse = {
      access_token: data.access_token,
      account_type: data.account_type,
      exp: data.exp,
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

  if (loading) return <div>Cargando...</div>;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

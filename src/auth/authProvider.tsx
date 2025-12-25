"use client";

import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { AuthManager } from "./authManager";
import { loginService } from "@/services/loginService";
import { LoginResponse } from "@/types/account";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = AuthManager.getAuthData();
    if (auth) {
      setUser(auth);
      setIsAuthenticated(true);
    }
  }, []);

  async function login(account_user: string, account_password: string) {
    const data = await loginService({ account_user, account_password });

    // Convertir exp string a timestamp
    const expTimestamp = Math.floor(new Date(data.exp).getTime() / 1000);

    const authData: LoginResponse = {
      access_token: data.access_token,
      account_type: data.account_type,
      exp: expTimestamp,
    };

    AuthManager.saveAuthData(authData);
    setUser(authData);
    setIsAuthenticated(true);

    return authData;
  }

  function logout() {
    AuthManager.logout();
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

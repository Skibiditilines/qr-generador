"use client";

import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { AuthManager } from "./authManager";
import { loginService } from "@/services/loginService";
import { LoginResponse } from "@/types/account";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const auth = AuthManager.getAuthData();

    if (auth) {
      setUser(auth);
      setIsAuthenticated(true);
    }

    setInitializing(false);
  }, []);

  async function login(user: string, password: string) {
    const data = await loginService({ user, password });

    const authData: LoginResponse = {
      account_id: data.account_id,
      access_token: data.access_token,
      account_type: data.account_type,
      exp: data.exp,
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

  if (initializing) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: initializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

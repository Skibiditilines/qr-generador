import { createContext } from "react";
import { LoginResponse } from "@/types/account";

export interface AuthContextType {
  user: LoginResponse | null;
  isAuthenticated: boolean | null;
  isLoading: boolean;
  login: (user: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

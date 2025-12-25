import { LoginResponse } from "@/types/account";

const AUTH_KEY = "auth_data";

export const AuthManager = {
  saveAuthData(data: LoginResponse) {
    // Convertir exp a timestamp en segundos si viene como string
    const expTimestamp =
      typeof data.exp === "string"
        ? Math.floor(new Date(data.exp).getTime() / 1000)
        : data.exp;

    if (
      !data.access_token ||
      !data.account_type ||
      typeof expTimestamp !== "number"
    ) {
      throw new Error("Invalid auth data");
    }

    const dataToStore = { ...data, exp: expTimestamp };
    localStorage.setItem(AUTH_KEY, JSON.stringify(dataToStore));
  },

  getAuthData(): LoginResponse | null {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as LoginResponse;
      const expTimestamp =
        typeof parsed.exp === "string"
          ? Math.floor(new Date(parsed.exp).getTime() / 1000)
          : parsed.exp;

      if (Date.now() / 1000 > expTimestamp) return null;

      return { ...parsed, exp: expTimestamp };
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAuthData();
  },

  logout() {
    localStorage.removeItem(AUTH_KEY);
  },

  getToken(): string | null {
    const data = this.getAuthData();
    return data?.access_token || null;
  },
};

import { LoginResponse } from "@/types/account";

const AUTH_KEY = "auth_data";

function isClient() {
  return typeof window !== "undefined";
}

export const AuthManager = {
  saveAuthData(data: LoginResponse) {
    if (!isClient()) return;

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

    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ ...data, exp: expTimestamp })
    );
  },

  getAuthData(): LoginResponse | null {
    if (!isClient()) return null;

    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as LoginResponse;

      const expTimestamp =
        typeof parsed.exp === "string"
          ? Math.floor(new Date(parsed.exp).getTime() / 1000)
          : parsed.exp;

      if (Date.now() / 1000 > expTimestamp) {
        localStorage.removeItem(AUTH_KEY);
        return null;
      }

      return { ...parsed, exp: expTimestamp };
    } catch {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
  },

  logout() {
    if (!isClient()) return;
    localStorage.removeItem(AUTH_KEY);
  },

  getToken(): string | null {
    return this.getAuthData()?.access_token || null;
  },
};

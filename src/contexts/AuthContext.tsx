import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api, { authService } from "../services/api";

interface User {
  id: string;
  email: string;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((user: User) => {
    setUser(user);
    setIsAuthenticated(true);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{
        access_token: string;
        user: User;
      }>("/auth/login", { email, password });

      setSession(data.user);
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the request fails, clear local session to avoid stale UI
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshAccessToken = useCallback(async () => {
    try {
      await api.post("/auth/refresh");
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [clearSession]);

  const fetchUser = useCallback(async () => {
    const { data } = await api.get<User>("/auth/me");
    setUser(data);
    setIsAuthenticated(true);
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchUser();
    } catch {
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser, logout]);

  /** 🔗 conecta com o axios interceptor */
  useEffect(() => {
    authService.refreshAccessToken = refreshAccessToken;
    authService.logout = logout;
  }, [refreshAccessToken, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

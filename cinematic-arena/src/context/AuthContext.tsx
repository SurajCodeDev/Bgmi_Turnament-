"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { apiLogin, apiLogout, apiMe, apiRegister } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "player";
  uid: string;
  team: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; uid: string; team: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiMe().then((res) => {
      if (cancelled) return;
      setUser(res.user);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    if (!res.ok || !res.user) {
      return { ok: false, error: res.error || "Login failed." };
    }
    setUser(res.user);
    return { ok: true };
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; uid: string; team: string }) => {
    const res = await apiRegister(data);
    if (!res.ok || !res.user) {
      return { ok: false, error: res.error || "Registration failed." };
    }
    setUser(res.user);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

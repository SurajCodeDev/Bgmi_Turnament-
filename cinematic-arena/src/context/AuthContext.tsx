"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createUser, findUserByEmail, getCurrentUser, getSessionUserId, setSession, type User } from "@/lib/store";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (data: { name: string; email: string; password: string; uid: string; team: string }) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const found = findUserByEmail(email);
    if (!found) {
      return { ok: false, error: "No account found with this email." };
    }
    if (found.password !== password) {
      return { ok: false, error: "Incorrect password. Try again." };
    }
    setSession(found.id);
    setUser(found);
    return { ok: true };
  }, []);

  const register = useCallback((data: { name: string; email: string; password: string; uid: string; team: string }) => {
    if (findUserByEmail(data.email)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const user = createUser(data);
    setSession(user.id);
    setUser(user);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setSession(null);
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

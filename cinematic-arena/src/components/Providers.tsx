"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { hydrateStore, isStoreHydrated } from "@/lib/store";
import { Navbar } from "./Navbar";
import { BootSequence } from "./BootSequence";
import { CustomCursor } from "./CustomCursor";

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateStore().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <AuthProvider>
        <BootSequence />
        <CustomCursor />
        <div className="flex min-h-screen items-center justify-center">
          <span className="font-display text-xs tracking-[0.4em] text-cyan-400 animate-pulse">
            SYNCING WITH SERVER...
          </span>
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <BootSequence />
      <CustomCursor />
      <Navbar />
      {children}
    </AuthProvider>
  );
}

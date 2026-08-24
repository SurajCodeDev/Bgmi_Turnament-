"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { hydrateStore } from "@/lib/store";
import { Navbar } from "./Navbar";
import { BootSequence } from "./BootSequence";
import { CustomCursor } from "./CustomCursor";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateStore();
  }, []);

  return (
    <AuthProvider>
      <BootSequence />
      <CustomCursor />
      <Navbar />
      {children}
    </AuthProvider>
  );
}

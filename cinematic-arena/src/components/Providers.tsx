"use client";

import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "./Navbar";
import { BootSequence } from "./BootSequence";
import { CustomCursor } from "./CustomCursor";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BootSequence />
      <CustomCursor />
      <Navbar />
      {children}
    </AuthProvider>
  );
}

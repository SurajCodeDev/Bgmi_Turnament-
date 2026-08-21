"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    return null;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (!res.ok) {
        setError(res.error || "Login failed.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_-10%,rgba(34,211,238,0.1),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="holo-panel scanline clip-corner p-8">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 flex h-12 w-12 rotate-45 items-center justify-center border-2 border-cyan-400 shadow-glow">
              <div className="h-2.5 w-2.5 -rotate-45 bg-cyan-400" />
            </div>
            <h1 className="font-display text-2xl font-black tracking-[0.2em] text-white">ARENA ACCESS</h1>
            <p className="mt-1 font-body text-xs tracking-[0.2em] text-slate-500">SIGN IN TO YOUR ACCOUNT</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@arena.in"
                className="w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-3 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-3 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
              />
            </div>

            {error && (
              <p className="border border-red-500/30 bg-red-500/5 px-4 py-2.5 font-body text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full px-6 py-3.5 font-display text-sm"
            >
              {loading ? "AUTHENTICATING..." : "ENTER ARENA"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#1a2134] pt-5 text-center">
            <p className="font-body text-xs text-slate-500">
              NEW PLAYER?{" "}
              <a href="/register" className="font-semibold text-cyan-400 hover:text-cyan-300">
                CREATE ACCOUNT
              </a>
            </p>
          </div>

          <div className="mt-6 rounded-sm border border-[#1a2134] bg-[#0a0d16]/60 p-4">
            <p className="mb-2 font-body text-[9px] font-semibold tracking-[0.25em] text-slate-600">DEMO CREDENTIALS</p>
            <div className="grid grid-cols-2 gap-3 font-body text-[10px] text-slate-400">
              <div>
                <p className="text-cyan-400">ADMIN</p>
                <p>admin@arena.in</p>
                <p>admin123</p>
              </div>
              <div>
                <p className="text-blue-400">PLAYER</p>
                <p>player@arena.in</p>
                <p>player123</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, sendOtp, verifyOtp, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    return null;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (mode === "password") {
      const res = await login(identifier, password);
      if (!res.ok) setError(res.error || "Login failed.");
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setError("");
    if (!identifier.trim()) {
      setError("Enter your email or mobile number.");
      return;
    }
    setLoading(true);
    const res = await sendOtp(identifier.trim(), "login");
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Failed to send OTP.");
      return;
    }
    setMockOtp(res.mockOtp || null);
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    const res = await verifyOtp(identifier.trim(), otp);
    setLoading(false);
    if (!res.ok) setError(res.error || "OTP verification failed.");
  };

  const inputCls =
    "w-full border border-[#1a2134] bg-[#0a0d16] px-4 py-3 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60";

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
            <p className="mt-1 font-body text-xs tracking-[0.2em] text-slate-500">SIGN IN WITH EMAIL / MOBILE</p>
          </div>

          <div className="mb-6 flex gap-1 border-b border-[#1a2134]">
            {(["password", "otp"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                  setMockOtp(null);
                }}
                className={`flex-1 py-3 font-body text-[10px] font-semibold tracking-[0.2em] transition-colors ${
                  mode === m ? "border-b-2 border-cyan-400 text-cyan-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {m === "password" ? "PASSWORD" : "OTP LOGIN"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                EMAIL OR MOBILE
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@arena.in or 7XXXXXXXXX"
                className={inputCls}
              />
            </div>

            {mode === "password" ? (
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
                  className={inputCls}
                />
              </div>
            ) : (
              <>
                <button type="button" onClick={handleSendOtp} disabled={loading} className="btn-ghost w-full px-4 py-3 font-display text-xs">
                  {loading ? "SENDING OTP..." : "SEND OTP"}
                </button>

                {mockOtp && (
                  <div className="border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-center">
                    <p className="font-body text-[9px] tracking-[0.25em] text-emerald-400">DEMO MODE — YOUR OTP</p>
                    <p className="mt-1 font-display text-2xl font-black tracking-[0.3em] text-emerald-400">{mockOtp}</p>
                    <p className="mt-1 font-body text-[9px] tracking-[0.15em] text-slate-500">
                      SENT TO {identifier.toUpperCase()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                    ENTER OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className={inputCls}
                  />
                </div>

                <button type="button" onClick={handleVerifyOtp} disabled={loading} className="btn-primary w-full px-6 py-3.5 font-display text-sm">
                  {loading ? "VERIFYING..." : "VERIFY & ENTER ARENA"}
                </button>
              </>
            )}

            {mode === "password" && (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full px-6 py-3.5 font-display text-sm"
              >
                {loading ? "AUTHENTICATING..." : "ENTER ARENA"}
              </button>
            )}

            {error && (
              <p className="border border-red-500/30 bg-red-500/5 px-4 py-2.5 font-body text-xs text-red-400">
                {error}
              </p>
            )}
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

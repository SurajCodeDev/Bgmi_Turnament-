"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [uid, setUid] = useState("");
  const [team, setTeam] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    return null;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!/^\d{9,10}$/.test(uid)) {
      setError("Enter a valid BGMI UID (9-10 digits).");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const res = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      uid: uid.trim(),
      team: team.trim() || "Team Solo",
    });
    if (!res.ok) {
      setError(res.error || "Registration failed.");
      setLoading(false);
    }
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
        className="relative z-10 w-full max-w-lg"
      >
        <div className="holo-panel scanline clip-corner p-8">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-3 flex h-12 w-12 rotate-45 items-center justify-center border-2 border-cyan-400 shadow-glow">
              <div className="h-2.5 w-2.5 -rotate-45 bg-cyan-400" />
            </div>
            <h1 className="font-display text-2xl font-black tracking-[0.2em] text-white">JOIN THE ARENA</h1>
            <p className="mt-1 font-body text-xs tracking-[0.2em] text-slate-500">CREATE YOUR PLAYER ACCOUNT</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                  PLAYER NAME
                </label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your IGN" className={inputCls} />
              </div>
              <div>
                <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                  BGMI UID
                </label>
                <input type="text" required value={uid} onChange={(e) => setUid(e.target.value)} placeholder="5400000000" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                EMAIL
              </label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@arena.in" className={inputCls} />
            </div>

            <div>
              <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                TEAM NAME
              </label>
              <input type="text" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Team Nova (optional)" className={inputCls} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                  PASSWORD
                </label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className={inputCls} />
              </div>
              <div>
                <label className="mb-2 block font-body text-[10px] font-semibold tracking-[0.25em] text-slate-400">
                  CONFIRM PASSWORD
                </label>
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" className={inputCls} />
              </div>
            </div>

            {error && (
              <p className="border border-red-500/30 bg-red-500/5 px-4 py-2.5 font-body text-xs text-red-400">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full px-6 py-3.5 font-display text-sm">
              {loading ? "CREATING PLAYER..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#1a2134] pt-5 text-center">
            <p className="font-body text-xs text-slate-500">
              ALREADY REGISTERED?{" "}
              <a href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
                SIGN IN
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

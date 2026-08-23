"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getTournament, getTournaments, isRegistered, registerForTournament, unregisterFromTournament } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";

const statusColor: Record<string, string> = {
  LIVE: "text-red-400 border-red-500/50",
  "REGISTRATION OPEN": "text-cyan-400 border-cyan-400/50",
  UPCOMING: "text-blue-400 border-blue-500/50",
  COMPLETED: "text-slate-500 border-slate-600/50",
};

export default function TournamentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const [t, setT] = useState(() => getTournament(id));
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    playerName: user?.name ?? "",
    playerUid: user?.uid ?? "",
    playerEmail: user?.email ?? "",
    teamName: user?.team ?? "",
  });

  useEffect(() => {
    setT(getTournament(id));
  }, [id]);

  useEffect(() => {
    setRegistered(!!user && isRegistered(user.id, id));
    if (user) {
      setForm({
        playerName: user.name ?? "",
        playerUid: user.uid ?? "",
        playerEmail: user.email ?? "",
        teamName: user.team ?? "",
      });
    }
  }, [user, id]);

  if (!t) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-2xl font-black text-white">TOURNAMENT NOT FOUND</p>
          <a href="/" className="btn-primary mt-6 inline-block px-8 py-3 font-display text-sm">
            BACK TO ARENA
          </a>
        </div>
      </main>
    );
  }

  const handleRegister = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (!/^\d{9,10}$/.test(form.playerUid)) {
      alert("Enter a valid BGMI UID (9-10 digits).");
      return;
    }
    if (!form.playerName.trim() || !form.playerEmail.trim() || !form.teamName.trim()) {
      alert("Fill in all player details before registering.");
      return;
    }
    setBusy(true);
    const res = await registerForTournament(user.id, t.id, form);
    setBusy(false);
    if (res.ok) {
      setRegistered(true);
      setT(getTournament(t.id));
    } else {
      alert(res.error || "Registration failed.");
    }
  };

  const handleUnregister = async () => {
    if (!user) return;
    setBusy(true);
    await unregisterFromTournament(user.id, t.id);
    setBusy(false);
    setRegistered(false);
    setT(getTournament(t.id));
  };

  const related = getTournaments().filter((x) => x.id !== t.id).slice(0, 4);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative h-[60vh] min-h-[380px] w-full overflow-hidden">
        <img src={t.image} alt={t.short} className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/60 via-[#05060a]/30 to-[#05060a]" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1200px] px-6 pb-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.15em] ${statusColor[t.status]}`}>
                  {t.status}
                </span>
                <span className="font-body text-[10px] tracking-[0.2em] text-slate-400">{t.game} · {t.mode}</span>
              </div>
              <h1 className="font-display text-3xl font-black tracking-wide text-white text-glow sm:text-5xl">{t.short}</h1>
              <p className="mt-2 font-body text-sm tracking-[0.2em] text-slate-400">{t.name}</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="holo-panel clip-corner p-6 lg:col-span-2"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#1a2134] pb-5">
              <div>
                <p className="font-display text-3xl font-black text-cyan-400 text-glow">{t.prizePool}</p>
                <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">PRIZE POOL</p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-white">{t.teamsJoined} / {t.teams}</p>
                <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">TEAMS REGISTERED</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: "ENTRY FEE", value: t.entryFee },
                { label: "DATE", value: t.date },
                { label: "TIME", value: t.time },
                { label: "FORMAT", value: t.format },
                { label: "MAP", value: t.map },
                { label: "MODE", value: t.mode },
              ].map((info) => (
                <div key={info.label} className="border border-[#1a2134] bg-[#0a0d16]/60 px-4 py-3">
                  <p className="font-body text-[9px] tracking-[0.25em] text-slate-500">{info.label}</p>
                  <p className="mt-1 font-body text-sm font-semibold text-slate-200">{info.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="mb-4 font-display text-sm font-bold tracking-[0.25em] text-cyan-400">TOURNAMENT RULES</h3>
              <ul className="space-y-2.5">
                {t.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 font-body text-sm text-slate-400">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-cyan-400/70" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="holo-panel scanline clip-corner h-fit p-6 lg:sticky lg:top-24"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-xs font-bold tracking-[0.3em] text-white">REGISTRATION</span>
              {t.status === "LIVE" && (
                <span className="flex items-center gap-1.5 font-body text-[10px] text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
                </span>
              )}
            </div>

            <div className="mb-6 space-y-3 border-b border-[#1a2134] pb-6 font-body text-xs text-slate-400">
              <div className="flex justify-between">
                <span>SLOTS FILLED</span>
                <span className="text-slate-200">{t.teamsJoined}/{t.teams}</span>
              </div>
              <div className="flex justify-between">
                <span>ENTRY FEE</span>
                <span className="text-slate-200">{t.entryFee}</span>
              </div>
              <div className="flex justify-between">
                <span>PRIZE POOL</span>
                <span className="text-cyan-400">{t.prizePool}</span>
              </div>
            </div>

            {registered ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 font-body text-xs font-semibold tracking-[0.2em] text-cyan-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> REGISTERED
                </div>
                <button onClick={handleUnregister} disabled={busy} className="btn-ghost w-full px-4 py-3 font-display text-[11px]">
                  {busy ? "PROCESSING..." : "CANCEL REGISTRATION"}
                </button>
              </div>
            ) : user ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 border border-[#1a2134] bg-[#05060a]/60 p-4">
                  <p className="font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500">PLAYER DETAILS</p>
                  {(
                    [
                      { key: "playerName", label: "PLAYER NAME", placeholder: "Your in-game name" },
                      { key: "playerUid", label: "BGMI UID", placeholder: "5401234567" },
                      { key: "playerEmail", label: "EMAIL", placeholder: "you@arena.in" },
                      { key: "teamName", label: "TEAM NAME", placeholder: "Team Nova" },
                    ] as const
                  ).map((f) => (
                    <div key={f.key}>
                      <label className="mb-1 block font-body text-[8px] font-semibold tracking-[0.25em] text-slate-500">
                        {f.label}
                      </label>
                      <input
                        type={f.key === "playerEmail" ? "email" : "text"}
                        value={form[f.key]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full border border-[#1a2134] bg-[#0a0d16] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60"
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleRegister} disabled={busy || t.status === "COMPLETED" || t.teamsJoined >= t.teams} className="btn-primary w-full px-4 py-4 font-display text-sm">
                  {busy
                    ? "PROCESSING..."
                    : t.teamsJoined >= t.teams
                    ? "TOURNAMENT FULL"
                    : t.status === "COMPLETED"
                    ? "TOURNAMENT OVER"
                    : "CONFIRM REGISTRATION"}
                </button>
              </div>
            ) : (
              <button onClick={handleRegister} disabled={t.status === "COMPLETED" || t.teamsJoined >= t.teams} className="btn-primary w-full px-4 py-4 font-display text-sm">
                {t.teamsJoined >= t.teams
                  ? "TOURNAMENT FULL"
                  : t.status === "COMPLETED"
                  ? "TOURNAMENT OVER"
                  : "JOIN TOURNAMENT"}
              </button>
            )}

            {!user && (
              <p className="mt-4 text-center font-body text-[10px] tracking-[0.15em] text-slate-500">
                SIGN IN REQUIRED TO REGISTER
              </p>
            )}
          </motion.div>
        </div>

        <div className="mt-20">
          <h2 className="mb-8 text-center font-display text-2xl font-black tracking-wide text-white sm:text-3xl">
            MORE <span className="text-cyan-400">EVENTS</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((rt) => (
              <a key={rt.id} href={`/tournaments/${rt.id}`} data-cursor="VIEW" className="holo-panel clip-corner-sm group relative overflow-hidden p-4">
                <img src={rt.image} alt={rt.short} className="absolute inset-0 h-full w-full object-cover opacity-25 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0d16]/95" />
                <div className="relative z-10 flex min-h-[120px] flex-col justify-end">
                  <p className="font-display text-sm font-bold text-white">{rt.short}</p>
                  <p className="mt-1 font-body text-[10px] tracking-[0.15em] text-cyan-400">{rt.prizePool} · {rt.date}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

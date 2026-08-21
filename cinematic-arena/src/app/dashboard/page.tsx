"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getRegistrationsForUser, getTournament, getPlayers, getTeams } from "@/lib/store";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [registrations] = useState(() => (user ? getRegistrationsForUser(user.id) : []));

  if (loading) return null;

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="holo-panel clip-corner p-10 text-center">
          <p className="font-display text-xl font-black text-white">ACCESS DENIED</p>
          <p className="mt-2 font-body text-sm text-slate-400">Sign in to view your player dashboard.</p>
          <a href="/login" className="btn-primary mt-6 inline-block px-8 py-3 font-display text-sm">
            SIGN IN
          </a>
        </div>
      </main>
    );
  }

  const userTournaments = registrations
    .map((r) => getTournament(r.tournamentId))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const player = getPlayers().find((p) => p.name.toLowerCase() === user.name.toLowerCase());

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="relative z-10 mx-auto max-w-[1200px]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-10 flex flex-col gap-6 border border-[#1a2134] bg-[#0a0d16]/70 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/10 font-display text-2xl font-black text-cyan-400 shadow-glow">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">WELCOME BACK, PLAYER</p>
                <h1 className="font-display text-2xl font-black tracking-wide text-white">{user.name}</h1>
                <p className="mt-1 font-body text-xs tracking-[0.15em] text-slate-400">
                  UID {user.uid} · {user.team}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/5 px-4 py-2.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <span className="font-body text-[10px] font-semibold tracking-[0.2em] text-cyan-400">READY TO COMPETE</span>
            </div>
          </div>
        </motion.div>

        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "MATCHES", value: player?.matches ?? 0 },
            { label: "WINS", value: player?.wins ?? 0 },
            { label: "KILLS", value: player?.kills ?? 0 },
            { label: "KD", value: player?.kd ?? 0 },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="holo-panel clip-corner-sm flex flex-col items-center py-5 text-center"
            >
              <span className="font-display text-2xl font-black text-white sm:text-3xl">{s.value}</span>
              <span className="mt-1 font-body text-[10px] font-semibold tracking-[0.3em] text-cyan-400">{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="holo-panel scanline clip-corner p-6 lg:col-span-2">
            <h2 className="mb-6 font-display text-sm font-bold tracking-[0.3em] text-white">MY TOURNAMENTS</h2>
            {userTournaments.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <p className="font-body text-sm text-slate-500">No tournaments registered yet.</p>
                <a href="/#tournaments" className="btn-primary mt-5 inline-block px-8 py-3 font-display text-xs">
                  BROWSE TOURNAMENTS
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {userTournaments.map((t) => (
                  <a
                    key={t.id}
                    href={`/tournaments/${t.id}`}
                    data-cursor="VIEW"
                    className="flex items-center justify-between gap-4 border border-[#1a2134] bg-[#0a0d16]/60 px-4 py-4 transition-colors hover:border-cyan-400/40"
                  >
                    <div className="flex items-center gap-3">
                      <img src={t.image} alt={t.short} className="h-12 w-16 object-cover opacity-80" />
                      <div>
                        <p className="font-display text-sm font-bold text-white">{t.short}</p>
                        <p className="font-body text-[10px] tracking-[0.15em] text-slate-500">{t.date} · {t.time} · {t.map}</p>
                      </div>
                    </div>
                    <span className="rounded-sm border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 font-body text-[9px] tracking-[0.2em] text-cyan-400">
                      {t.status}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="holo-panel clip-corner p-6">
            <h2 className="mb-6 font-display text-sm font-bold tracking-[0.3em] text-white">QUICK STATS</h2>
            <div className="space-y-4">
              {getTeams().slice(0, 3).map((team) => (
                <div key={team.id} className="flex items-center justify-between border border-[#1a2134] bg-[#0a0d16]/60 px-4 py-3">
                  <div>
                    <p className="font-body text-xs font-semibold tracking-[0.1em] text-slate-200">{team.name}</p>
                    <p className="font-body text-[9px] tracking-[0.2em] text-slate-500">{team.points} PTS · {team.kills} KILLS</p>
                  </div>
                  <span className="font-display text-base font-black text-cyan-400">#{team.placement.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <a href="/#leaderboard" data-cursor="VIEW" className="btn-ghost mt-6 flex w-full items-center justify-center gap-2 px-4 py-3 font-display text-[11px]">
              FULL LEADERBOARD <span>→</span>
            </a>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getTournaments, type Tournament } from "@/lib/store";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import { isFreeTournament, isInviteOnly } from "@/lib/arena";

const statusColor: Record<Tournament["status"], string> = {
  LIVE: "text-red-400 border-red-500/50",
  "REGISTRATION OPEN": "text-cyan-400 border-cyan-400/50",
  UPCOMING: "text-blue-400 border-blue-500/50",
  COMPLETED: "text-slate-500 border-slate-600/50",
};

type ModeFilter = "ALL" | "SOLO" | "DUO" | "SQUAD";
const MODE_FILTERS: ModeFilter[] = ["ALL", "SOLO", "DUO", "SQUAD"];

function TournamentCard({ t }: { t: Tournament }) {
  const pct = t.teams > 0 ? Math.min(100, Math.round((t.teamsJoined / t.teams) * 100)) : 0;
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      data-cursor="ENTER"
      className="holo-panel scanline clip-corner group relative flex flex-col overflow-hidden p-6"
    >
      <div className="absolute inset-0">
        <img src={t.image} alt={t.short} className="h-full w-full object-cover opacity-20 transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d16]/40 via-transparent to-[#0a0d16]/90" />
      </div>
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-body text-[10px] tracking-[0.25em] text-slate-500">{t.game} / TOURNAMENT</span>
          <div className="flex items-center gap-1.5">
            {t.tag === "HACKER" && (
              <span className="rounded-sm border border-red-500/50 bg-red-500/10 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.15em] text-red-400">
                HACKER
              </span>
            )}
            {isFreeTournament(t) ? (
              <span className="rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.15em] text-emerald-400">
                FREE
              </span>
            ) : isInviteOnly(t) ? (
              <span className="rounded-sm border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.15em] text-purple-400">
                INVITE
              </span>
            ) : (
              <span className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.15em] text-amber-400">
                PAID · {t.entryFee}
              </span>
            )}
            <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.15em] ${statusColor[t.status]}`}>
              {t.status}
            </span>
          </div>
        </div>

        <h3 className="font-display text-xl font-black tracking-wide text-white">{t.short}</h3>
        <p className="mt-0.5 font-body text-xs tracking-[0.15em] text-slate-500">{t.mode} · {t.format} · {t.map}</p>

        <div className="mt-6 flex items-end justify-between border-t border-[#1a2134] pt-5">
          <div>
            <p className="font-display text-2xl font-black text-cyan-400 text-glow">{t.prizePool}</p>
            <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">PRIZE POOL</p>
          </div>
          <div className="text-right">
            <p className="font-display text-sm font-bold text-white">{t.teamsJoined}/{t.teams}</p>
            <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">TEAMS</p>
          </div>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden bg-[#1a2134]">
          <div
            className={`h-full transition-all duration-700 ${pct >= 100 ? "bg-red-500" : "bg-gradient-to-r from-cyan-400 to-blue-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-5 flex items-center justify-between font-body text-xs tracking-[0.15em] text-slate-400">
          <span>{t.date} · {t.time}</span>
          <span className={isFreeTournament(t) ? "text-emerald-400" : ""}>ENTRY {isFreeTournament(t) ? "FREE" : t.entryFee}</span>
        </div>

        <a
          href={`/tournaments/${t.id}`}
          data-cursor="ENTER"
          className="btn-ghost mt-6 flex w-full items-center justify-center gap-2 px-4 py-3 font-display text-[11px]"
        >
          {t.status === "COMPLETED" ? "VIEW RESULTS" : pct >= 100 ? "VIEW EVENT" : "JOIN TOURNAMENT"}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </motion.article>
  );
}

export default function TournamentsPage() {
  useStoreRefresh();
  const tournaments = getTournaments();
  const [mode, setMode] = useState<ModeFilter>("ALL");
  const filtered = mode === "ALL" ? tournaments : tournaments.filter((t) => t.mode === mode);

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="mb-10 text-center">
          <span className="section-label mb-3">TOURNAMENTS</span>
          <h1 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            ALL <span className="text-cyan-400">EVENTS</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-body text-sm text-slate-400">
            Browse every NEXT LEVEL ARENA tournament — free and paid entry, solo to squad.
          </p>
        </div>

        <div className="mb-8 flex justify-center gap-2">
          {MODE_FILTERS.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2.5 font-body text-xs font-semibold tracking-[0.2em] transition-colors ${
                mode === m
                  ? "border border-cyan-400/60 bg-cyan-400/10 text-cyan-400"
                  : "border border-[#1a2134] text-slate-500 hover:text-slate-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center font-body text-sm tracking-[0.15em] text-slate-500">NO TOURNAMENTS FOUND.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <TournamentCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

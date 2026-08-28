"use client";

import { motion } from "framer-motion";
import { getTournaments, type Tournament } from "@/lib/store";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import { isFreeTournament } from "@/lib/arena";

function HackerCard({ t }: { t: Tournament }) {
  const pct = t.teams > 0 ? Math.min(100, Math.round((t.teamsJoined / t.teams) * 100)) : 0;
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -8 }}
      data-cursor="ENTER"
      className="holo-panel scanline clip-corner group relative flex flex-col overflow-hidden border-red-500/20 p-6"
    >
      <div className="absolute inset-0">
        <img src={t.image} alt={t.short} className="h-full w-full object-cover opacity-20 transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d16]/40 via-transparent to-[#0a0d16]/90" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.06] to-transparent" />
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-body text-[10px] tracking-[0.25em] text-red-400/80">HACKER vs HACKER</span>
          <span className="rounded-sm border border-red-500/50 bg-red-500/10 px-2 py-0.5 font-body text-[9px] font-bold tracking-[0.15em] text-red-400">
            NO BANS
          </span>
        </div>

        <h3 className="font-display text-xl font-black tracking-wide text-white">{t.short}</h3>
        <p className="mt-0.5 font-body text-xs tracking-[0.15em] text-slate-500">{t.mode} · {t.format} · {t.map}</p>

        <div className="mt-6 flex items-end justify-between border-t border-[#1a2134] pt-5">
          <div>
            <p className="font-display text-2xl font-black text-red-400 text-glow">{t.prizePool}</p>
            <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">PRIZE POOL</p>
          </div>
          <div className="text-right">
            <p className="font-display text-sm font-bold text-white">{t.teamsJoined}/{t.teams}</p>
            <p className="font-body text-[10px] tracking-[0.25em] text-slate-500">HACKERS</p>
          </div>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden bg-[#1a2134]">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-5 flex items-center justify-between font-body text-xs tracking-[0.15em] text-slate-400">
          <span>{t.date} · {t.time}</span>
          <span>{isFreeTournament(t) ? "ENTRY FREE" : `ENTRY ${t.entryFee}`}</span>
        </div>

        <a
          href={`/tournaments/${t.id}`}
          data-cursor="ENTER"
          className="btn-ghost mt-6 flex w-full items-center justify-center gap-2 border-red-500/30 px-4 py-3 font-display text-[11px] hover:border-red-400 hover:text-red-400"
        >
          ENTER HACK-OFF <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </motion.article>
  );
}

export function HackerSection() {
  useStoreRefresh();
  const tournaments = getTournaments();
  const hacker = tournaments.filter((t) => t.tag === "HACKER" && t.status !== "COMPLETED");

  if (hacker.length === 0) return null;

  return (
    <section id="hacker" className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(239,68,68,0.06),transparent_70%)]" />
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="section-label mb-3 text-red-400">EXPERIMENTAL ZONE</span>
          <h2 className="font-display text-3xl font-black tracking-wide text-white sm:text-5xl">
            HACKER <span className="text-red-400">vs</span> HACKER
          </h2>
          <p className="mt-4 max-w-2xl font-body text-sm text-slate-400">
            No anti-cheat. No bans. No rules. The underground arena where every tool is legal —
            aimbots, ESP, speed hacks, teleports. Only the most dangerous survive.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hacker.map((t) => (
            <HackerCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

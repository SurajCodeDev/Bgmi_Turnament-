"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  getTournaments,
  updateTournament,
  addTournament,
  removeTournament,
  resetTournaments,
  getUsers,
  getRegistrations,
  type Tournament,
} from "@/lib/store";

const emptyTournament: Omit<Tournament, "id"> = {
  name: "New BGMI Tournament",
  short: "NEW EVENT",
  game: "BGMI",
  status: "UPCOMING",
  mode: "SQUAD",
  prizePool: "₹50,000",
  entryFee: "₹99",
  teams: 64,
  teamsJoined: 0,
  date: "01 SEP",
  time: "08:00 PM",
  format: "Point-Based League",
  map: "ERANGEL",
  rules: ["Fair play is mandatory.", "Screenshots required for results."],
  image: "/images/bgmi-9.jpg",
};

const inputCls =
  "w-full border border-[#1a2134] bg-[#05060a] px-3 py-2 font-body text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60";

const labelCls = "mb-1.5 block font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>(() => getTournaments());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Tournament | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState<"tournaments" | "overview" | "users" | "matches">("tournaments");

  if (loading) return null;

  if (!user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="holo-panel clip-corner p-10 text-center">
          <p className="font-display text-xl font-black text-white">RESTRICTED ACCESS</p>
          <p className="mt-2 font-body text-sm text-slate-400">Admin credentials required.</p>
          <a href="/login" className="btn-primary mt-6 inline-block px-8 py-3 font-display text-sm">
            ADMIN LOGIN
          </a>
        </div>
      </main>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const startEdit = (t: Tournament) => {
    setEditingId(t.id);
    setDraft({ ...t });
  };

  const saveEdit = () => {
    if (!draft) return;
    updateTournament(draft);
    setTournaments(getTournaments());
    setEditingId(null);
    setDraft(null);
    showToast("TOURNAMENT UPDATED");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const createTournament = () => {
    const t: Tournament = { ...emptyTournament, id: `t-${Date.now()}`, rules: [...emptyTournament.rules] };
    addTournament(t);
    setTournaments(getTournaments());
    setShowCreate(false);
    showToast("TOURNAMENT CREATED");
  };

  const deleteTournament = (id: string) => {
    removeTournament(id);
    setTournaments(getTournaments());
    showToast("TOURNAMENT REMOVED");
  };

  const handleReset = () => {
    resetTournaments();
    setTournaments(getTournaments());
    showToast("DATA RESET TO SEED");
  };

  const setDraftField = (field: keyof Tournament, value: string | number | string[]) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const registrations = getRegistrations();
  const users = getUsers();
  const activePlayers = registrations.length;
  const liveCount = tournaments.filter((t) => t.status === "LIVE").length;
  const totalPrize = tournaments.reduce((sum, t) => {
    const n = parseInt(t.prizePool.replace(/[^\d]/g, ""), 10) || 0;
    return sum + n;
  }, 0);

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-24">
      <div className="grid-bg absolute inset-0 opacity-25" />
      <div className="relative z-10 mx-auto max-w-[1200px]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="section-label mb-2">TOURNAMENT CONTROL CENTER</span>
              <h1 className="font-display text-3xl font-black tracking-wide text-white sm:text-4xl">
                ADMIN <span className="text-cyan-400">COMMAND</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(true)} className="btn-primary px-5 py-2.5 font-display text-xs">
                + NEW TOURNAMENT
              </button>
              <button onClick={handleReset} className="btn-ghost px-5 py-2.5 font-display text-xs">
                RESET DATA
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 flex gap-1 border-b border-[#1a2134]">
          {(["overview", "tournaments", "users", "matches"] as const).map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`px-5 py-3 font-body text-xs font-semibold tracking-[0.2em] transition-colors ${
                tab === tb ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tb.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "LIVE TOURNAMENTS", value: liveCount },
              { label: "REGISTERED PLAYERS", value: activePlayers },
              { label: "TOTAL ACCOUNTS", value: users.length },
              { label: "TOTAL PRIZE POOL", value: `₹${totalPrize.toLocaleString("en-IN")}` },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="holo-panel clip-corner-sm flex flex-col items-center py-6 text-center"
              >
                <span className="font-display text-2xl font-black text-white sm:text-3xl">{s.value}</span>
                <span className="mt-1.5 font-body text-[9px] font-semibold tracking-[0.3em] text-cyan-400">{s.label}</span>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "tournaments" && (
          <div className="space-y-4">
            <AnimatePresence>
              {tournaments.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border border-[#1a2134] bg-[#0a0d16]/70"
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    <img src={t.image} alt={t.short} className="h-14 w-20 shrink-0 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-sm font-bold text-white">{t.short}</p>
                        <span className="rounded-sm border border-[#1a2134] px-1.5 py-0.5 font-body text-[8px] tracking-[0.15em] text-slate-500">{t.status}</span>
                      </div>
                      <p className="mt-1 font-body text-xs text-slate-400">
                        <span className="text-cyan-400">{t.prizePool}</span> · Entry {t.entryFee} · {t.teamsJoined}/{t.teams} teams · {t.date} {t.time}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => startEdit(t)} className="btn-ghost px-4 py-2 font-display text-[10px]">
                        EDIT
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${t.short}?`)) deleteTournament(t.id);
                        }}
                        className="border border-[#1a2134] px-4 py-2 font-display text-[10px] text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>

                  {editingId === t.id && draft && (
                    <div className="border-t border-[#1a2134] p-5">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className={labelCls}>TOURNAMENT NAME</label>
                          <input className={inputCls} value={draft.name} onChange={(e) => setDraftField("name", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>SHORT NAME</label>
                          <input className={inputCls} value={draft.short} onChange={(e) => setDraftField("short", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>STATUS</label>
                          <select className={inputCls} value={draft.status} onChange={(e) => setDraftField("status", e.target.value)}>
                            <option>LIVE</option>
                            <option>UPCOMING</option>
                            <option>REGISTRATION OPEN</option>
                            <option>COMPLETED</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>PRIZE POOL</label>
                          <input className={inputCls} value={draft.prizePool} onChange={(e) => setDraftField("prizePool", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>ENTRY FEE</label>
                          <input className={inputCls} value={draft.entryFee} onChange={(e) => setDraftField("entryFee", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>MODE</label>
                          <select className={inputCls} value={draft.mode} onChange={(e) => setDraftField("mode", e.target.value)}>
                            <option>SOLO</option>
                            <option>DUO</option>
                            <option>SQUAD</option>
                            <option>TDM</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>TOTAL TEAMS</label>
                          <input type="number" className={inputCls} value={draft.teams} onChange={(e) => setDraftField("teams", parseInt(e.target.value, 10) || 0)} />
                        </div>
                        <div>
                          <label className={labelCls}>DATE</label>
                          <input className={inputCls} value={draft.date} onChange={(e) => setDraftField("date", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>TIME</label>
                          <input className={inputCls} value={draft.time} onChange={(e) => setDraftField("time", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>MAP</label>
                          <select className={inputCls} value={draft.map} onChange={(e) => setDraftField("map", e.target.value)}>
                            <option>ERANGEL</option>
                            <option>MIRAMAR</option>
                            <option>SANHOK</option>
                            <option>LIVIK</option>
                            <option>WAREHOUSE</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>FORMAT</label>
                          <input className={inputCls} value={draft.format} onChange={(e) => setDraftField("format", e.target.value)} />
                        </div>
                        <div>
                          <label className={labelCls}>TEAMS JOINED</label>
                          <input type="number" className={inputCls} value={draft.teamsJoined} onChange={(e) => setDraftField("teamsJoined", parseInt(e.target.value, 10) || 0)} />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#1a2134] pt-4">
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="btn-primary px-6 py-2.5 font-display text-[11px]">
                            SAVE CHANGES
                          </button>
                          <button onClick={cancelEdit} className="btn-ghost px-6 py-2.5 font-display text-[11px]">
                            CANCEL
                          </button>
                        </div>
                        <p className="font-body text-[9px] tracking-[0.2em] text-slate-600">CHANGES SAVE TO BROWSER STORAGE</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {showCreate && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-cyan-400/40 bg-[#0a0d16]/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-sm font-bold text-white">CREATE NEW TOURNAMENT</p>
                    <p className="mt-1 font-body text-xs text-slate-400">Defaults applied — edit after creation.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={createTournament} className="btn-primary px-6 py-2.5 font-display text-[11px]">
                      CREATE
                    </button>
                    <button onClick={() => setShowCreate(false)} className="btn-ghost px-6 py-2.5 font-display text-[11px]">
                      CANCEL
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {users.map((u, i) => {
              const userRegs = registrations.filter((r) => r.userId === u.id);
              return (
                <motion.div key={u.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex flex-col gap-3 border border-[#1a2134] bg-[#0a0d16]/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-[#0e1220] font-display text-base font-black text-cyan-400">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-body text-sm font-semibold text-slate-200">{u.name}</p>
                        <span className={`rounded-sm border px-1.5 py-0.5 font-body text-[8px] tracking-[0.15em] ${u.role === "admin" ? "border-red-500/50 text-red-400" : "border-cyan-400/40 text-cyan-400"}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-0.5 font-body text-[10px] tracking-[0.1em] text-slate-500">
                        {u.email} · UID {u.uid} · {u.team}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-sm border border-[#1a2134] bg-[#05060a] px-3 py-1.5 font-body text-[10px] tracking-[0.15em] text-slate-400">
                      {userRegs.length} REGISTRATIONS
                    </span>
                    <span className="font-body text-[9px] tracking-[0.15em] text-slate-600">JOINED {u.createdAt.slice(0, 10)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {tab === "matches" && (
          <div className="space-y-3">
            {[
              { id: "M04", tournament: "BGMI Championship Series", map: "ERANGEL", status: "LIVE", room: "12345678", pass: "ARENA2024", time: "08:30 PM" },
              { id: "M05", tournament: "BGMI Championship Series", map: "MIRAMAR", status: "UPCOMING", room: "87654321", pass: "NEXTLVL", time: "09:30 PM" },
              { id: "M06", tournament: "BGMI Rising Stars Cup", map: "MIRAMAR", status: "UPCOMING", room: "TBD", pass: "TBD", time: "07:00 PM" },
              { id: "M01", tournament: "BGMI Community Clash", map: "ERANGEL", status: "COMPLETED", room: "11112222", pass: "CLASH24", time: "05:00 PM" },
            ].map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-[#1a2134] bg-[#0a0d16]/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-black text-white">{m.id}</span>
                    <div>
                      <p className="font-body text-sm font-semibold text-slate-200">{m.tournament}</p>
                      <p className="font-body text-[9px] tracking-[0.15em] text-slate-500">MAP {m.map} · {m.time}</p>
                    </div>
                  </div>
                  <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] ${
                    m.status === "LIVE" ? "border-red-500/50 text-red-400" : m.status === "UPCOMING" ? "border-cyan-400/50 text-cyan-400" : "border-slate-600/50 text-slate-400"
                  }`}>
                    {m.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[#1a2134] pt-3 font-body text-[10px] tracking-[0.15em] text-slate-500">
                  <span>ROOM <span className="text-slate-300">{m.room}</span></span>
                  <span>PASS <span className="text-slate-300">{m.pass}</span></span>
                  <button className="ml-auto btn-primary px-4 py-1.5 font-display text-[9px]">EDIT ROOM</button>
                  <button className="btn-ghost px-4 py-1.5 font-display text-[9px]">SUBMIT RESULT</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 z-[999] -translate-x-1/2 border border-cyan-400/50 bg-[#05060a] px-6 py-3 font-body text-xs font-semibold tracking-[0.2em] text-cyan-400 shadow-glow"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

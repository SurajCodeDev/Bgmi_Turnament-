"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useStoreRefresh } from "@/lib/useStoreRefresh";
import {
  apiGetPayments,
  apiProcessPayment,
  apiGetPaymentConfig,
  apiGetWithdrawals,
  apiProcessWithdrawal,
  apiGetMatches,
  apiSaveMatch,
  apiAddMatch,
  apiDeleteMatch,
  apiDeclareWinner,
  apiSetRoom,
  type PaymentProof,
  type Withdrawal,
  type Match,
} from "@/lib/api";
import { formatINR } from "@/lib/arena";
import {
  getTournaments,
  updateTournament,
  addTournament,
  removeTournament,
  resetTournaments,
  getUsers,
  getRegistrations,
  refreshStore,
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
  const refresh = useStoreRefresh();
  const [tournaments, setTournaments] = useState<Tournament[]>(() => getTournaments());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Tournament | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState<"tournaments" | "overview" | "users" | "matches" | "registrations" | "payments" | "withdrawals">("tournaments");
  const [regFilter, setRegFilter] = useState("");
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [payConfig, setPayConfig] = useState<{ upiId: string; whatsappNumber: string } | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [winnerDraft, setWinnerDraft] = useState<{ tournamentId: string; winner: string } | null>(null);
  const [roomDraft, setRoomDraft] = useState<{ tournamentId: string; roomId: string; password: string } | null>(null);
  const [matchDraft, setMatchDraft] = useState<Match | null>(null);
  const [showMatchCreate, setShowMatchCreate] = useState(false);

  useEffect(() => {
    setTournaments(getTournaments());
  }, [refresh]);

  useEffect(() => {
    apiGetPayments()
      .then((res) => {
        if (res.ok) setPayments(res.payments);
      })
      .catch(() => {});
    apiGetPaymentConfig()
      .then(setPayConfig)
      .catch(() => {});
    apiGetWithdrawals()
      .then((res) => {
        if (res.ok) setWithdrawals(res.withdrawals);
      })
      .catch(() => {});
    apiGetMatches()
      .then((ms) => setMatches(ms))
      .catch(() => {});
  }, [refresh]);

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

  const saveEdit = async () => {
    if (!draft) return;
    await updateTournament(draft);
    setTournaments(getTournaments());
    setEditingId(null);
    setDraft(null);
    showToast("TOURNAMENT UPDATED");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const createTournament = async () => {
    const t: Tournament = { ...emptyTournament, id: `t-${Date.now()}`, rules: [...emptyTournament.rules] };
    await addTournament(t);
    setTournaments(getTournaments());
    setShowCreate(false);
    showToast("TOURNAMENT CREATED");
  };

  const deleteTournament = async (id: string) => {
    await removeTournament(id);
    setTournaments(getTournaments());
    showToast("TOURNAMENT REMOVED");
  };

  const handleReset = async () => {
    await resetTournaments();
    setTournaments(getTournaments());
    showToast("DATA RESET TO SEED");
  };

  const verifyPayment = async (id: string, action: "verify" | "reject") => {
    const remarks = action === "reject" ? prompt("Rejection reason:") || "Payment could not be verified." : undefined;
    const res = await apiProcessPayment(id, action, remarks);
    if (res.ok) {
      const fresh = await apiGetPayments();
      if (fresh.ok) setPayments(fresh.payments);
      await refreshStore();
      setTournaments(getTournaments());
      showToast(action === "verify" ? "PAYMENT VERIFIED" : "PAYMENT REJECTED");
    } else {
      showToast(res.error || "ACTION FAILED");
    }
  };

  const processWithdrawal = async (w: Withdrawal, action: "approve" | "reject") => {
    let opts: { upiId?: string; remarks?: string } = {};
    if (action === "approve") {
      const upiId = prompt(`Player UPI for ${w.userName} (₹${w.amount.toLocaleString("en-IN")}):`);
      if (!upiId) return;
      opts.upiId = upiId;
    } else {
      const remarks = prompt("Rejection reason:") || "Withdrawal rejected by admin.";
      opts.remarks = remarks;
    }
    const res = await apiProcessWithdrawal(w.id, action, opts);
    if (res.ok) {
      const fresh = await apiGetWithdrawals();
      if (fresh.ok) setWithdrawals(fresh.withdrawals);
      showToast(action === "approve" ? "WITHDRAWAL APPROVED" : "WITHDRAWAL REJECTED");
    } else {
      showToast(res.error || "ACTION FAILED");
    }
  };

  const declareWinner = async () => {
    if (!winnerDraft) return;
    const res = await apiDeclareWinner(winnerDraft.tournamentId, winnerDraft.winner.trim());
    if (res.ok) {
      await refreshStore();
      setTournaments(getTournaments());
      setWinnerDraft(null);
      showToast(res.creditedTo ? `PRIZE ${formatINR(res.amount || 0)} CREDITED TO ${res.creditedTo}` : "WINNER DECLARED");
    } else {
      showToast(res.error || "DECLARE FAILED");
    }
  };

  const setRoom = async () => {
    if (!roomDraft) return;
    const res = await apiSetRoom(roomDraft.tournamentId, roomDraft.roomId, roomDraft.password);
    if (res.ok) {
      setRoomDraft(null);
      showToast("ROOM UPDATED");
    } else {
      showToast(res.error || "ROOM UPDATE FAILED");
    }
  };

  const saveMatch = async () => {
    if (!matchDraft) return;
    const res = await apiSaveMatch(matchDraft);
    if (res.ok) {
      const ms = await apiGetMatches();
      setMatches(ms);
      setMatchDraft(null);
      showToast("MATCH SAVED");
    } else {
      showToast(res.error || "SAVE FAILED");
    }
  };

  const createMatch = async () => {
    const m: Match = {
      id: `M${String(Date.now()).slice(-4)}`,
      tournamentId: "",
      tournament: "New Match",
      map: "ERANGEL",
      mode: "SQUAD",
      date: "01 SEP",
      time: "08:00 PM",
      status: "UPCOMING",
      teams: [],
      roomId: "",
      password: "",
    };
    const res = await apiAddMatch(m);
    if (res.ok) {
      const ms = await apiGetMatches();
      setMatches(ms);
      setShowMatchCreate(false);
      showToast("MATCH CREATED");
    } else {
      showToast(res.error || "CREATE FAILED");
    }
  };

  const deleteMatch = async (id: string) => {
    await apiDeleteMatch(id);
    const ms = await apiGetMatches();
    setMatches(ms);
    showToast("MATCH REMOVED");
  };

  const setDraftField = (field: keyof Tournament, value: string | number | string[]) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const registrations = getRegistrations();
  const users = getUsers();
  const filteredRegistrations = registrations.filter((r) => {
    const q = regFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      r.playerName.toLowerCase().includes(q) ||
      r.playerUid.includes(q) ||
      r.teamName.toLowerCase().includes(q) ||
      r.tournamentName.toLowerCase().includes(q)
    );
  });
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

        <div className="mb-8 flex gap-1 overflow-x-auto border-b border-[#1a2134]">
          {(["overview", "tournaments", "registrations", "payments", "withdrawals", "users", "matches"] as const).map((tb) => (
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
                      <button onClick={() => setRoomDraft({ tournamentId: t.id, roomId: "", password: "" })} className="btn-ghost px-4 py-2 font-display text-[10px]">
                        ROOM
                      </button>
                      <button
                        onClick={() => setWinnerDraft({ tournamentId: t.id, winner: t.winner || t.short })}
                        className="border border-amber-400/50 px-4 py-2 font-display text-[10px] text-amber-400 transition-colors hover:bg-amber-400/10"
                      >
                        {t.winner ? "RE-DECLARE" : "DECLARE WINNER"}
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
                        <p className="font-body text-[9px] tracking-[0.2em] text-slate-600">CHANGES SAVE TO SERVER DATABASE</p>
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

        {tab === "registrations" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-body text-[11px] tracking-[0.2em] text-slate-400">
                TOTAL REGISTRATIONS: <span className="font-bold text-cyan-400">{registrations.length}</span>
              </p>
              <input
                value={regFilter}
                onChange={(e) => setRegFilter(e.target.value)}
                placeholder="SEARCH PLAYER / UID / TEAM..."
                className="w-full border border-[#1a2134] bg-[#05060a] px-3 py-2 font-body text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/60 sm:w-80"
              />
            </div>

            {registrations.length === 0 ? (
              <div className="holo-panel clip-corner flex flex-col items-center py-16 text-center">
                <p className="font-display text-sm font-bold text-white">NO REGISTRATIONS YET</p>
                <p className="mt-2 font-body text-xs text-slate-500">Players who register will appear here with full details.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#1a2134] bg-[#0a0d16]/70">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-[#1a2134] bg-[#05060a]">
                      {["#", "TOURNAMENT", "PLAYER (CAPTAIN)", "BGMI UID", "EMAIL", "TEAM", "ROSTER", "REGISTERED AT"].map((h) => (
                        <th key={h} className="px-4 py-3 font-body text-[9px] font-semibold tracking-[0.25em] text-cyan-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((r, i) => (
                      <motion.tr
                        key={`${r.userId}-${r.tournamentId}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-[#12182a] transition-colors hover:bg-[#0a0d16]/40"
                      >
                        <td className="px-4 py-3.5 font-display text-xs font-bold text-slate-500">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-body text-xs font-semibold text-slate-200">{r.tournamentName}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-body text-xs font-semibold text-white">{r.playerName}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-sm border border-cyan-400/30 bg-cyan-400/5 px-2 py-1 font-body text-[10px] font-semibold tracking-[0.15em] text-cyan-400">
                            {r.playerUid}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-body text-xs text-slate-400">{r.playerEmail}</td>
                        <td className="px-4 py-3.5 font-body text-xs text-slate-300">{r.teamName}</td>
                        <td className="px-4 py-3.5">
                          {r.members && r.members.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {r.members.map((m, mi) => (
                                <span
                                  key={mi}
                                  title={`UID: ${m.uid}`}
                                  className="rounded-sm border border-[#1a2134] bg-[#05060a] px-2 py-0.5 font-body text-[9px] tracking-[0.1em] text-slate-400"
                                >
                                  {m.name} <span className="text-cyan-500">{m.uid}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="font-body text-[10px] text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-body text-[10px] tracking-[0.1em] text-slate-500">
                          {new Date(r.registeredAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-4">
            <div className="holo-panel clip-corner flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-body text-[9px] font-semibold tracking-[0.25em] text-slate-500">YOUR UPI DETAILS</p>
                <p className="mt-1 break-all font-display text-sm font-black text-cyan-400">{payConfig?.upiId || "ksuraj138@ybl"}</p>
                <p className="mt-1 font-body text-[9px] tracking-[0.2em] text-slate-500">PAYMENT PROOF WHATSAPP: +{payConfig?.whatsappNumber || "917015742792"}</p>
              </div>
              <p className="font-body text-[11px] tracking-[0.2em] text-slate-400">
                TOTAL PAYMENTS: <span className="font-bold text-cyan-400">{payments.length}</span>
              </p>
            </div>

            {payments.length === 0 ? (
              <div className="holo-panel clip-corner flex flex-col items-center py-16 text-center">
                <p className="font-display text-sm font-bold text-white">NO PAYMENTS YET</p>
                <p className="mt-2 font-body text-xs text-slate-500">Player top-ups will appear here with payment proof details.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p, i) => {
                  const waMsg = [
                    "NEXT LEVEL ARENA - PAYMENT PROOF",
                    "--------------------------------",
                    `Player: ${p.userName}`,
                    `Amount: ${formatINR(p.amount)}`,
                    `UPI ID: ${p.upiId}`,
                    `Txn Ref: ${p.upiTxnRef}`,
                    p.note ? `Note: ${p.note}` : "",
                    `Status: ${p.status}`,
                    `Time: ${new Date(p.createdAt).toLocaleString("en-IN")}`,
                  ].filter(Boolean).join("\n");
                  const waLink = `https://wa.me/${payConfig?.whatsappNumber || "917015742792"}?text=${encodeURIComponent(waMsg)}`;
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-[#1a2134] bg-[#0a0d16]/70 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-[#0e1220] font-display text-base font-black text-cyan-400">
                            {p.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-body text-sm font-semibold text-slate-200">{p.userName}</p>
                            <p className="font-body text-[10px] tracking-[0.15em] text-slate-500">
                              {formatINR(p.amount)} · {p.upiTxnRef} · {new Date(p.createdAt).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-sm border border-emerald-500/40 bg-emerald-500/5 px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] text-emerald-400">
                          {p.status}
                        </span>
                      </div>
                      {p.note && (
                        <p className="mt-3 border-t border-[#1a2134] pt-3 font-body text-xs italic text-slate-400">
                          NOTE: {p.note}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary px-4 py-2 font-display text-[10px]">
                          VIEW / FORWARD ON WHATSAPP
                        </a>
                        <span className="font-body text-[9px] tracking-[0.15em] text-slate-600">PAID TO {p.upiId}</span>
                        {p.status === "PENDING VERIFICATION" && (
                          <div className="ml-auto flex gap-2">
                            <button onClick={() => verifyPayment(p.id, "verify")} className="border border-emerald-500/50 px-4 py-2 font-display text-[10px] text-emerald-400 transition-colors hover:bg-emerald-500/10">
                              VERIFY
                            </button>
                            <button onClick={() => verifyPayment(p.id, "reject")} className="border border-red-500/50 px-4 py-2 font-display text-[10px] text-red-400 transition-colors hover:bg-red-500/10">
                              REJECT
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
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
                    <span className="font-body text-[9px] tracking-[0.15em] text-slate-600">JOINED {u.createdAt ? u.createdAt.slice(0, 10) : "—"}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {tab === "matches" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-body text-[11px] tracking-[0.2em] text-slate-400">
                TOTAL MATCHES: <span className="font-bold text-cyan-400">{matches.length}</span>
              </p>
              <button onClick={() => setShowMatchCreate(true)} className="btn-primary px-5 py-2.5 font-display text-[10px]">
                + NEW MATCH
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="holo-panel clip-corner flex flex-col items-center py-16 text-center">
                <p className="font-display text-sm font-bold text-white">NO MATCHES YET</p>
                <p className="mt-2 font-body text-xs text-slate-500">Create a match to start tracking results.</p>
              </div>
            ) : (
              matches.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border border-[#1a2134] bg-[#0a0d16]/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-black text-white">{m.id}</span>
                      <div>
                        <p className="font-body text-sm font-semibold text-slate-200">{m.tournament}</p>
                        <p className="font-body text-[9px] tracking-[0.15em] text-slate-500">MAP {m.map} · {m.mode} · {m.time}</p>
                      </div>
                    </div>
                    <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] ${
                      m.status === "LIVE" ? "border-red-500/50 text-red-400" : m.status === "UPCOMING" ? "border-cyan-400/50 text-cyan-400" : "border-slate-600/50 text-slate-400"
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  {m.teams && m.teams.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                      {m.teams.map((t) => (
                        <div key={t.tag} className="flex items-center justify-between border border-[#12182a] bg-[#05060a] px-3 py-1.5">
                          <span className="font-body text-[10px] text-slate-400">{t.name}</span>
                          <span className="font-display text-xs font-black text-cyan-400">{t.points}{typeof t.kills === "number" ? ` · ${t.kills}K` : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[#1a2134] pt-3 font-body text-[10px] tracking-[0.15em] text-slate-500">
                    <span>ROOM <span className="text-slate-300">{m.roomId || "TBD"}</span></span>
                    <span>PASS <span className="text-slate-300">{m.password || "TBD"}</span></span>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => setMatchDraft(m)} className="btn-primary px-4 py-1.5 font-display text-[9px]">EDIT / SCORES</button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove match ${m.id}?`)) deleteMatch(m.id);
                        }}
                        className="border border-[#1a2134] px-4 py-1.5 font-display text-[9px] text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-400"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {showMatchCreate && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-cyan-400/40 bg-[#0a0d16]/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-sm font-bold text-white">CREATE NEW MATCH</p>
                    <p className="mt-1 font-body text-xs text-slate-400">Defaults applied — edit scores after creation.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={createMatch} className="btn-primary px-6 py-2.5 font-display text-[11px]">CREATE</button>
                    <button onClick={() => setShowMatchCreate(false)} className="btn-ghost px-6 py-2.5 font-display text-[11px]">CANCEL</button>
                  </div>
                </div>
              </motion.div>
            )}

            {matchDraft && (
              <div className="border border-cyan-400/40 bg-[#0a0d16]/90 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-white">EDIT MATCH {matchDraft.id}</p>
                  <button onClick={() => setMatchDraft(null)} className="btn-ghost px-4 py-2 font-display text-[10px]">CLOSE</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>TOURNAMENT</label>
                    <input className={inputCls} value={matchDraft.tournament} onChange={(e) => setMatchDraft({ ...matchDraft, tournament: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>TOURNAMENT ID</label>
                    <input className={inputCls} value={matchDraft.tournamentId} onChange={(e) => setMatchDraft({ ...matchDraft, tournamentId: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>STATUS</label>
                    <select className={inputCls} value={matchDraft.status} onChange={(e) => setMatchDraft({ ...matchDraft, status: e.target.value as Match["status"] })}>
                      <option>LIVE</option>
                      <option>UPCOMING</option>
                      <option>COMPLETED</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>MAP</label>
                    <select className={inputCls} value={matchDraft.map} onChange={(e) => setMatchDraft({ ...matchDraft, map: e.target.value })}>
                      <option>ERANGEL</option>
                      <option>MIRAMAR</option>
                      <option>SANHOK</option>
                      <option>LIVIK</option>
                      <option>WAREHOUSE</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>TIME</label>
                    <input className={inputCls} value={matchDraft.time} onChange={(e) => setMatchDraft({ ...matchDraft, time: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>DATE</label>
                    <input className={inputCls} value={matchDraft.date} onChange={(e) => setMatchDraft({ ...matchDraft, date: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>ROOM ID</label>
                    <input className={inputCls} value={matchDraft.roomId || ""} onChange={(e) => setMatchDraft({ ...matchDraft, roomId: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>PASSWORD</label>
                    <input className={inputCls} value={matchDraft.password || ""} onChange={(e) => setMatchDraft({ ...matchDraft, password: e.target.value })} />
                  </div>
                </div>

                <div className="mt-4 border-t border-[#1a2134] pt-4">
                  <label className={labelCls}>SCORES (JSON: [{"{\"name\":\"Team Nova\",\"tag\":\"NV\",\"points\":42,\"kills\":18}"}])</label>
                  <textarea
                    className={inputCls}
                    rows={4}
                    value={JSON.stringify(matchDraft.teams || [], null, 1)}
                    onChange={(e) => {
                      try {
                        const teams = JSON.parse(e.target.value);
                        if (Array.isArray(teams)) setMatchDraft({ ...matchDraft, teams });
                      } catch {
                        // invalid JSON while typing — ignore
                      }
                    }}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={saveMatch} className="btn-primary px-6 py-2.5 font-display text-[11px]">SAVE MATCH</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "withdrawals" && (
          <div className="space-y-3">
            <p className="font-body text-[11px] tracking-[0.2em] text-slate-400">
              TOTAL REQUESTS: <span className="font-bold text-cyan-400">{withdrawals.length}</span> · PENDING:{" "}
              <span className="font-bold text-amber-400">{withdrawals.filter((w) => w.status === "PENDING").length}</span>
            </p>
            {withdrawals.length === 0 ? (
              <div className="holo-panel clip-corner flex flex-col items-center py-16 text-center">
                <p className="font-display text-sm font-bold text-white">NO WITHDRAWAL REQUESTS</p>
                <p className="mt-2 font-body text-xs text-slate-500">Player withdrawal requests will appear here.</p>
              </div>
            ) : (
              withdrawals.map((w, i) => (
                <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="border border-[#1a2134] bg-[#0a0d16]/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-[#0e1220] font-display text-base font-black text-cyan-400">
                        {w.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-body text-sm font-semibold text-slate-200">{w.userName}</p>
                        <p className="font-body text-[10px] tracking-[0.15em] text-slate-500">
                          {formatINR(w.amount)} · {new Date(w.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-sm border px-2 py-0.5 font-body text-[9px] font-semibold tracking-[0.2em] ${
                        w.status === "APPROVED" ? "border-emerald-500/40 text-emerald-400" : w.status === "REJECTED" ? "border-red-500/40 text-red-400" : "border-amber-400/40 text-amber-400"
                      }`}>
                        {w.status}
                      </span>
                      {w.status === "PENDING" && (
                        <>
                          <button onClick={() => processWithdrawal(w, "approve")} className="border border-emerald-500/50 px-4 py-2 font-display text-[10px] text-emerald-400 transition-colors hover:bg-emerald-500/10">
                            APPROVE
                          </button>
                          <button onClick={() => processWithdrawal(w, "reject")} className="border border-red-500/50 px-4 py-2 font-display text-[10px] text-red-400 transition-colors hover:bg-red-500/10">
                            REJECT
                          </button>
                        </>
                      )}
                      {w.upiId && <span className="font-body text-[9px] tracking-[0.1em] text-slate-500">{w.upiId}</span>}
                    </div>
                  </div>
                  {w.remarks && <p className="mt-3 border-t border-[#1a2134] pt-3 font-body text-xs italic text-slate-400">{w.remarks}</p>}
                </motion.div>
              ))
            )}
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

      <AnimatePresence>
        {winnerDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 px-6"
            onClick={() => setWinnerDraft(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="holo-panel scanline clip-corner w-full max-w-sm p-6"
            >
              <p className="mb-1 font-display text-sm font-bold tracking-[0.3em] text-white">DECLARE WINNER</p>
              <p className="mb-4 font-body text-[10px] tracking-[0.2em] text-slate-500">
                AUTO-CREDITS 50% PRIZE TO THE WINNING TEAM CAPTAIN
              </p>
              <label className={labelCls}>WINNING TEAM / PLAYER NAME</label>
              <input
                className={inputCls}
                value={winnerDraft.winner}
                onChange={(e) => setWinnerDraft({ ...winnerDraft, winner: e.target.value })}
                placeholder="e.g. Team Nova"
              />
              <p className="mt-3 font-body text-[9px] leading-relaxed tracking-[0.1em] text-slate-500">
                Tournament will be marked COMPLETED. Prize is credited to the registered captain matching this team name.
              </p>
              <div className="mt-5 flex gap-2">
                <button onClick={declareWinner} className="btn-primary flex-1 px-4 py-3 font-display text-xs">
                  DECLARE & PAY
                </button>
                <button onClick={() => setWinnerDraft(null)} className="btn-ghost flex-1 px-4 py-3 font-display text-xs">
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {roomDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 px-6"
            onClick={() => setRoomDraft(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="holo-panel scanline clip-corner w-full max-w-sm p-6"
            >
              <p className="mb-1 font-display text-sm font-bold tracking-[0.3em] text-white">SET LIVE ROOM</p>
              <p className="mb-4 font-body text-[10px] tracking-[0.2em] text-slate-500">
                REGISTERED PLAYERS WILL SEE THIS ON THE TOURNAMENT PAGE
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>ROOM ID</label>
                  <input className={inputCls} value={roomDraft.roomId} onChange={(e) => setRoomDraft({ ...roomDraft, roomId: e.target.value })} placeholder="12345678" />
                </div>
                <div>
                  <label className={labelCls}>PASSWORD</label>
                  <input className={inputCls} value={roomDraft.password} onChange={(e) => setRoomDraft({ ...roomDraft, password: e.target.value })} placeholder="ARENA2024" />
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button onClick={setRoom} className="btn-primary flex-1 px-4 py-3 font-display text-xs">
                  SAVE ROOM
                </button>
                <button onClick={() => setRoomDraft(null)} className="btn-ghost flex-1 px-4 py-3 font-display text-xs">
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

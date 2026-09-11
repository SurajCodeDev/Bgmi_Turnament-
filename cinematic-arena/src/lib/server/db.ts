import fs from "fs";
import path from "path";
import { head as blobHead, put as blobPut } from "@vercel/blob";
import { tournaments as seedTournaments, teams as seedTeams, players as seedPlayers, matches as seedMatches, defaultNotifications, type Tournament, type Notification } from "@/data/arena";

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "player";
  uid: string;
  team: string;
  wallet: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

export type RegistrationStatus = "PAID" | "PENDING" | "WALLET" | "FREE";

export interface ServerRegistration {
  userId: string;
  tournamentId: string;
  tournamentName: string;
  playerName: string;
  playerUid: string;
  playerEmail: string;
  teamName: string;
  members: { name: string; uid: string }[];
  claimed: boolean;
  status: RegistrationStatus;
  paymentId?: string;
  registeredAt: string;
}

export interface ServerPayment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  upiId: string;
  upiTxnRef: string;
  note: string;
  status: string;
  createdAt: string;
  type?: "TOPUP" | "ENTRY";
  tournamentId?: string;
  tournamentName?: string;
  verifyRemarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ServerWithdrawal {
  id: string;
  userId: string;
  userName: string;
  upiId: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  processedAt?: string;
  remarks?: string;
}

export interface ServerRoom {
  tournamentId: string;
  roomId: string;
  password: string;
  updatedAt: string;
}

interface DBShape {
  tournaments: Tournament[];
  users: ServerUser[];
  registrations: ServerRegistration[];
  matches: typeof seedMatches;
  notifications: Notification[];
  disputes: {
    id: string;
    userId: string;
    userName: string;
    tournamentId: string;
    type: string;
    description: string;
    status: string;
    createdAt: string;
  }[];
  transactions: {
    id: string;
    userId: string;
    label: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  payments: ServerPayment[];
  withdrawals: ServerWithdrawal[];
  rooms: ServerRoom[];
  telegram: { enabled: boolean; botToken: string; channelId: string; announcements: string[] };
  payment: { upiId: string; whatsappNumber: string; payeeName: string };
  otps: {
    id: string;
    userId: string;
    identifier: string;
    otp: string;
    purpose: string;
    expiresAt: number;
    consumed: boolean;
  }[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const BLOB_KEY = "nla-db/db.json";
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

let memDB: DBShape | null = null;

const seedUsers: ServerUser[] = [
  { id: "u-admin", name: "Arena Admin", email: "admin@arena.in", phone: "7000000001", password: "admin123", role: "admin", uid: "5400000001", team: "NEXT LEVEL ARENA", wallet: 1000000, emailVerified: true, phoneVerified: true, createdAt: "2024-08-01" },
  { id: "u-demo", name: "Viper", email: "player@arena.in", phone: "7001234567", password: "player123", role: "player", uid: "5401234567", team: "Team Nova", wallet: 25000, emailVerified: true, phoneVerified: true, createdAt: "2024-08-01" },
];

const seedDB: DBShape = {
  tournaments: seedTournaments,
  users: seedUsers,
  registrations: [
    {
      userId: "u-demo",
      tournamentId: "t-006",
      tournamentName: "BGMI Community Clash",
      playerName: "Viper",
      playerUid: "5401234567",
      playerEmail: "player@arena.in",
      teamName: "Team Nova",
      members: [
        { name: "Blitz", uid: "5402222333" },
        { name: "Cipher", uid: "5403333444" },
        { name: "Frost", uid: "5404444555" },
      ],
      claimed: false,
      status: "PAID",
      registeredAt: "2024-08-14T10:00:00.000Z",
    },
  ],
  matches: seedMatches,
  notifications: defaultNotifications,
  disputes: [],
  transactions: [
    { id: "tx-1", userId: "u-demo", label: "Prize — BGMI Championship Series", amount: 210000, status: "CREDITED", createdAt: "2024-08-15" },
    { id: "tx-2", userId: "u-demo", label: "Entry Fee — Rising Stars Cup", amount: -99, status: "PAID", createdAt: "2024-08-20" },
  ],
  telegram: { enabled: false, botToken: "", channelId: "", announcements: [] },
  payments: [],
  withdrawals: [],
  rooms: [],
  payment: {
    upiId: "ksuraj138@ybl",
    whatsappNumber: "917015742792",
    payeeName: "NEXT LEVEL ARENA",
  },
  otps: [],
};

function defaultDB(): DBShape {
  return JSON.parse(JSON.stringify(seedDB));
}

function normalizeShape(parsed: unknown): DBShape {
  const base = defaultDB();
  const data = (parsed || {}) as Partial<DBShape>;
  const merged: DBShape = {
    ...base,
    ...data,
    telegram: { ...base.telegram, ...(data.telegram || {}) },
    payment: { ...base.payment, ...(data.payment || {}) },
  };
  merged.users = (merged.users || []).map((u) => ({
    ...u,
    wallet: typeof u.wallet === "number" ? u.wallet : 0,
    phone: u.phone || "",
    emailVerified: !!u.emailVerified,
    phoneVerified: !!u.phoneVerified,
  }));
  merged.registrations = (merged.registrations || []).map((r) => ({
    ...r,
    members: Array.isArray(r.members) ? r.members : [],
    claimed: !!r.claimed,
    status: (r.status as RegistrationStatus) || (r.claimed ? "PAID" : "PAID"),
  }));
  merged.tournaments = (merged.tournaments || []).map((t) => ({
    ...t,
    tag: t.tag || undefined,
    winner: t.winner || undefined,
  }));
  const knownIds = new Set(merged.tournaments.map((t) => t.id));
  for (const seedT of seedTournaments) {
    if (!knownIds.has(seedT.id)) {
      merged.tournaments.push(seedT);
      knownIds.add(seedT.id);
    }
  }
  merged.payments = Array.isArray(merged.payments) ? merged.payments : [];
  merged.otps = Array.isArray(merged.otps) ? merged.otps : [];
  merged.withdrawals = Array.isArray(merged.withdrawals) ? merged.withdrawals : [];
  merged.rooms = Array.isArray(merged.rooms) ? merged.rooms : [];
  merged.notifications = Array.isArray(merged.notifications) ? merged.notifications : [];
  merged.matches = Array.isArray(merged.matches) ? merged.matches : seedMatches;
  merged.transactions = Array.isArray(merged.transactions) ? merged.transactions : [];
  merged.disputes = Array.isArray(merged.disputes) ? merged.disputes : [];
  return merged;
}

async function readBlobText(): Promise<string | null> {
  try {
    const meta = await blobHead(BLOB_KEY);
    if (!meta || !meta.url) return null;
    const res = await fetch(`${meta.url}?download=1&_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    const msg = String((err as Error)?.message || "").toLowerCase();
    if (msg.includes("not found") || msg.includes("404")) return null;
    throw err;
  }
}

async function writeBlobText(text: string) {
  await blobPut(BLOB_KEY, text, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function readDB(): Promise<DBShape> {
  if (memDB) return memDB;
  let raw: string | null = null;
  if (USE_BLOB) {
    raw = await readBlobText();
  } else if (fs.existsSync(DB_PATH)) {
    raw = fs.readFileSync(DB_PATH, "utf-8");
  }
  if (raw) {
    memDB = normalizeShape(JSON.parse(raw) as unknown);
    return memDB;
  }
  const fresh = defaultDB();
  await writeDB(fresh);
  return fresh;
}

export async function writeDB(db: DBShape) {
  memDB = db;
  const text = JSON.stringify(db);
  if (USE_BLOB) {
    await writeBlobText(text);
  } else {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, text, "utf-8");
  }
}

export async function resetDB() {
  const fresh = defaultDB();
  await writeDB(fresh);
  return fresh;
}

// Session helpers (token = userId, kept in an httpOnly cookie handled by routes)

export { seedTeams, seedPlayers };

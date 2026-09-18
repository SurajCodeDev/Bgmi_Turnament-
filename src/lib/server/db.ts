import fs from "fs";
import path from "path";
import { head as blobHead, put as blobPut } from "@vercel/blob";
import { tournaments as seedTournaments, teams as seedTeams, players as seedPlayers, matches as seedMatches, defaultNotifications, type Tournament, type Notification } from "@/data/arena";

export interface ServerUser {
  id: string;
  name: string;
  username?: string;
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

// --- Secret owner/admin account (only credentials to be used for admin access) ---
export const ADMIN_USERNAME = "adminsk";
export const ADMIN_PASSWORD = "skadmin123";

const seedUsers: ServerUser[] = [
  {
    id: "u-admin",
    name: "SK Admin",
    username: ADMIN_USERNAME,
    email: "adminsk@nextlevelarena.in",
    phone: "7000000001",
    password: ADMIN_PASSWORD,
    role: "admin",
    uid: "5400000001",
    team: "NEXT LEVEL ARENA",
    wallet: 0,
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2024-08-01",
  },
];

const LEGACY_DEMO_EMAILS = new Set(["admin@arena.in", "player@arena.in"]);
const LEGACY_DEMO_IDS = new Set(["u-demo"]);

const seedDB: DBShape = {
  tournaments: seedTournaments,
  users: seedUsers,
  registrations: [],
  matches: seedMatches,
  notifications: defaultNotifications,
  disputes: [],
  transactions: [],
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
  merged.users = (merged.users || [])
    .filter((u) => !LEGACY_DEMO_IDS.has(u.id) && !LEGACY_DEMO_EMAILS.has((u.email || "").toLowerCase()))
    .map((u) => ({
      ...u,
      username: u.username || undefined,
      wallet: typeof u.wallet === "number" ? u.wallet : 0,
      phone: u.phone || "",
      emailVerified: !!u.emailVerified,
      phoneVerified: !!u.phoneVerified,
    }));
  // Guarantee the secret owner/admin account always exists and keeps its credentials.
  const adminSeed = seedUsers[0];
  const adminIndex = merged.users.findIndex(
    (u) => u.role === "admin" && (u.id === adminSeed.id || u.username === ADMIN_USERNAME)
  );
  if (adminIndex >= 0) {
    merged.users[adminIndex] = { ...merged.users[adminIndex], ...adminSeed };
  } else {
    merged.users.unshift({ ...adminSeed });
  }
  merged.registrations = (merged.registrations || [])
    .filter((r) => !LEGACY_DEMO_IDS.has(r.userId) && !LEGACY_DEMO_EMAILS.has((r.playerEmail || "").toLowerCase()))
    .map((r) => ({
      ...r,
      members: Array.isArray(r.members) ? r.members : [],
      claimed: !!r.claimed,
      status: (r.status as RegistrationStatus) || (r.claimed ? "PAID" : "PAID"),
    }));
  merged.tournaments = seedTournaments.map((t) => ({
    ...t,
    tag: t.tag || undefined,
    winner: undefined,
  }));
  merged.payments = (Array.isArray(merged.payments) ? merged.payments : []).filter((p) => !LEGACY_DEMO_IDS.has(p.userId));
  merged.otps = (Array.isArray(merged.otps) ? merged.otps : []).filter((o) => !LEGACY_DEMO_IDS.has(o.userId));
  merged.withdrawals = (Array.isArray(merged.withdrawals) ? merged.withdrawals : []).filter((w) => !LEGACY_DEMO_IDS.has(w.userId));
  merged.rooms = [];
  merged.notifications = defaultNotifications.map((n) => ({ ...n }));
  merged.matches = seedMatches.map((m) => ({ ...m, teams: (m.teams || []).map((t) => ({ ...t })) }));
  merged.transactions = (Array.isArray(merged.transactions) ? merged.transactions : []).filter((t) => !LEGACY_DEMO_IDS.has(t.userId));
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

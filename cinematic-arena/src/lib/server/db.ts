import fs from "fs";
import path from "path";
import { tournaments as seedTournaments, teams as seedTeams, players as seedPlayers, matches as seedMatches, defaultNotifications, type Tournament, type Notification } from "@/data/arena";

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "player";
  uid: string;
  team: string;
  wallet: number;
  createdAt: string;
}

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
  registeredAt: string;
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
  payments: {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    upiId: string;
    upiTxnRef: string;
    note: string;
    status: string;
    createdAt: string;
  }[];
  telegram: { enabled: boolean; botToken: string; channelId: string; announcements: string[] };
  payment: { upiId: string; whatsappNumber: string; payeeName: string };
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const seedUsers: ServerUser[] = [
  { id: "u-admin", name: "Arena Admin", email: "admin@arena.in", password: "admin123", role: "admin", uid: "5400000001", team: "NEXT LEVEL ARENA", wallet: 1000000, createdAt: "2024-08-01" },
  { id: "u-demo", name: "Viper", email: "player@arena.in", password: "player123", role: "player", uid: "5401234567", team: "Team Nova", wallet: 25000, createdAt: "2024-08-01" },
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
  payment: {
    upiId: "ksuraj138@ybl",
    whatsappNumber: "917015742792",
    payeeName: "NEXT LEVEL ARENA",
  },
};

function defaultDB(): DBShape {
  return JSON.parse(JSON.stringify(seedDB));
}

export function readDB(): DBShape {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDB(defaultDB());
      return defaultDB();
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DBShape;
    const base = defaultDB();
    const merged: DBShape = {
      ...base,
      ...parsed,
      telegram: { ...base.telegram, ...(parsed.telegram || {}) },
      payment: { ...base.payment, ...(parsed.payment || {}) },
    };
    merged.users = (merged.users || []).map((u) => ({ ...u, wallet: typeof u.wallet === "number" ? u.wallet : 0 }));
    merged.registrations = (merged.registrations || []).map((r) => ({
      ...r,
      members: Array.isArray(r.members) ? r.members : [],
      claimed: !!r.claimed,
    }));
    merged.payments = Array.isArray(merged.payments) ? merged.payments : [];
    return merged;
  } catch {
    return defaultDB();
  }
}

export function writeDB(db: DBShape) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    // ignore write errors
  }
}

export function resetDB() {
  writeDB(defaultDB());
  return readDB();
}

// Session helpers (token = userId, kept in an httpOnly cookie handled by routes)

export { seedTeams, seedPlayers };

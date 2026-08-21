import { tournaments as seedTournaments, teams as seedTeams, players as seedPlayers, type Tournament } from "@/data/arena";

export type { Tournament };

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "player";
  uid: string;
  team: string;
  createdAt: string;
}

export interface Registration {
  userId: string;
  tournamentId: string;
  teamName: string;
  registeredAt: string;
}

const KEYS = {
  tournaments: "arena_tournaments_v1",
  users: "arena_users_v1",
  session: "arena_session_v1",
  registrations: "arena_registrations_v1",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function load<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

// ---------- Tournaments ----------

export function getTournaments(): Tournament[] {
  const stored = load<Tournament[]>(KEYS.tournaments, seedTournaments);
  if (stored.length === 0) return seedTournaments;
  return stored;
}

export function saveTournaments(list: Tournament[]) {
  save(KEYS.tournaments, list);
}

export function resetTournaments() {
  save(KEYS.tournaments, seedTournaments);
}

export function getTournament(id: string): Tournament | undefined {
  return getTournaments().find((t) => t.id === id);
}

export function updateTournament(updated: Tournament) {
  const list = getTournaments();
  const idx = list.findIndex((t) => t.id === updated.id);
  if (idx >= 0) {
    list[idx] = updated;
    saveTournaments(list);
  }
}

export function addTournament(t: Tournament) {
  const list = getTournaments();
  list.push(t);
  saveTournaments(list);
}

export function removeTournament(id: string) {
  const list = getTournaments().filter((t) => t.id !== id);
  saveTournaments(list);
}

// ---------- Users / Auth ----------

export function getUsers(): User[] {
  const admin: User = {
    id: "u-admin",
    name: "Arena Admin",
    email: "admin@arena.in",
    password: "admin123",
    role: "admin",
    uid: "5400000001",
    team: "CINEMATIC ARENA",
    createdAt: "2024-08-01",
  };
  const demo: User = {
    id: "u-demo",
    name: "Viper",
    email: "player@arena.in",
    password: "player123",
    role: "player",
    uid: "5401234567",
    team: "Team Nova",
    createdAt: "2024-08-01",
  };
  const stored = load<User[]>(KEYS.users, []);
  const merged = [admin, demo, ...stored];
  const seen = new Set<string>();
  return merged.filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

function saveUsers(users: User[]) {
  const [admin, demo, ...rest] = users;
  save(KEYS.users, rest);
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(data: { name: string; email: string; password: string; uid: string; team: string }): User {
  const user: User = {
    id: `u-${Date.now()}`,
    role: "player",
    createdAt: new Date().toISOString(),
    ...data,
  };
  const users = getUsers().filter((u) => u.id !== "u-admin" && u.id !== "u-demo");
  users.push(user);
  saveUsers([...getUsers().filter((u) => u.id === "u-admin" || u.id === "u-demo"), ...users]);
  return user;
}

export function getSessionUserId(): string | null {
  return load<string | null>(KEYS.session, null);
}

export function setSession(userId: string | null) {
  save(KEYS.session, userId);
}

export function getCurrentUser(): User | null {
  const id = getSessionUserId();
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}

// ---------- Registrations ----------

export function getRegistrations(): Registration[] {
  return load<Registration[]>(KEYS.registrations, []);
}

export function getRegistrationsForUser(userId: string): Registration[] {
  return getRegistrations().filter((r) => r.userId === userId);
}

export function isRegistered(userId: string, tournamentId: string): boolean {
  return getRegistrations().some((r) => r.userId === userId && r.tournamentId === tournamentId);
}

export function registerForTournament(userId: string, tournamentId: string, teamName: string) {
  if (isRegistered(userId, tournamentId)) return;
  const list = getRegistrations();
  list.push({
    userId,
    tournamentId,
    teamName,
    registeredAt: new Date().toISOString(),
  });
  save(KEYS.registrations, list);

  const t = getTournament(tournamentId);
  if (t && t.teamsJoined < t.teams) {
    updateTournament({ ...t, teamsJoined: t.teamsJoined + 1 });
  }
}

export function unregisterFromTournament(userId: string, tournamentId: string) {
  const list = getRegistrations().filter(
    (r) => !(r.userId === userId && r.tournamentId === tournamentId)
  );
  save(KEYS.registrations, list);

  const t = getTournament(tournamentId);
  if (t && t.teamsJoined > 0) {
    updateTournament({ ...t, teamsJoined: t.teamsJoined - 1 });
  }
}

// ---------- Teams / Players (derived) ----------

export function getTeams() {
  return seedTeams;
}

export function getPlayers() {
  return seedPlayers;
}

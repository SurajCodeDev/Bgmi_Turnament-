import {
  tournaments as seedTournaments,
  teams as seedTeams,
  players as seedPlayers,
  matches as seedMatches,
  defaultNotifications,
  type Tournament,
  type Notification,
} from "@/data/arena";
import {
  apiGetTournaments,
  apiSaveTournament,
  apiAddTournament,
  apiDeleteTournament,
  apiResetTournaments,
  apiGetRegistrations,
  apiRegisterForTournament,
  apiUnregisterFromTournament,
  apiGetUsers,
  type ApiUser,
  type ApiRegistration,
} from "@/lib/api";

export type { Tournament };
export type { ApiUser as User, ApiRegistration as Registration };

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "player";
  uid: string;
  team: string;
  createdAt?: string;
}

// ---------- In-memory cache (hydrated from server API) ----------

let cachedTournaments: Tournament[] | null = null;
let cachedRegistrations: ApiRegistration[] = [];
let cachedUsers: ApiUser[] = [];
let hydrated = false;

export function isStoreHydrated() {
  return hydrated;
}

export async function hydrateStore() {
  try {
    const [tours, regs, users] = await Promise.all([
      apiGetTournaments(),
      apiGetRegistrations(),
      apiGetUsers(),
    ]);
    if (tours.length) cachedTournaments = tours;
    cachedRegistrations = regs;
    cachedUsers = users;
    hydrated = true;
  } catch {
    // keep seed fallback on failure
  }
}

// ---------- Tournaments ----------

export function getTournaments(): Tournament[] {
  return cachedTournaments ?? seedTournaments;
}

export function getTournament(id: string): Tournament | undefined {
  return getTournaments().find((t) => t.id === id);
}

export async function updateTournament(updated: Tournament) {
  await apiSaveTournament(updated);
  cachedTournaments = getTournaments().map((t) => (t.id === updated.id ? updated : t));
}

export async function addTournament(t: Tournament) {
  await apiAddTournament(t);
  cachedTournaments = [...getTournaments(), t];
}

export async function removeTournament(id: string) {
  await apiDeleteTournament(id);
  cachedTournaments = getTournaments().filter((t) => t.id !== id);
}

export async function resetTournaments() {
  const res = await apiResetTournaments();
  cachedTournaments = res.tournaments;
  cachedRegistrations = [];
}

// ---------- Users / Auth ----------

export function getUsers(): LocalUser[] {
  const defaults: LocalUser[] = [
    { id: "u-admin", name: "Arena Admin", email: "admin@arena.in", role: "admin", uid: "5400000001", team: "NEXT LEVEL ARENA", createdAt: "2024-08-01" },
    { id: "u-demo", name: "Viper", email: "player@arena.in", role: "player", uid: "5401234567", team: "Team Nova", createdAt: "2024-08-01" },
  ];
  const merged = [...defaults, ...cachedUsers];
  const seen = new Set<string>();
  return merged.filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

export async function refreshUsers() {
  cachedUsers = await apiGetUsers();
}

export function findUserByEmail(email: string): LocalUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// ---------- Registrations ----------

export function getRegistrations(): ApiRegistration[] {
  return cachedRegistrations;
}

export function getRegistrationsForUser(userId: string): ApiRegistration[] {
  return getRegistrations().filter((r) => r.userId === userId);
}

export function isRegistered(userId: string, tournamentId: string): boolean {
  return getRegistrations().some((r) => r.userId === userId && r.tournamentId === tournamentId);
}

export async function registerForTournament(
  userId: string,
  tournamentId: string,
  details: { teamName: string; playerName: string; playerUid: string; playerEmail: string }
) {
  if (isRegistered(userId, tournamentId)) return { ok: false, error: "Already registered." };
  const res = await apiRegisterForTournament(userId, tournamentId, details);
  if (res.ok) {
    cachedRegistrations = await apiGetRegistrations(userId);
    const t = getTournament(tournamentId);
    if (t) {
      cachedTournaments = getTournaments().map((x) =>
        x.id === tournamentId ? { ...x, teamsJoined: Math.min(x.teams, x.teamsJoined + 1) } : x
      );
    }
  }
  return res;
}

export async function unregisterFromTournament(userId: string, tournamentId: string) {
  await apiUnregisterFromTournament(userId, tournamentId);
  cachedRegistrations = await apiGetRegistrations(userId);
  const t = getTournament(tournamentId);
  if (t) {
    cachedTournaments = getTournaments().map((x) =>
      x.id === tournamentId ? { ...x, teamsJoined: Math.max(0, x.teamsJoined - 1) } : x
    );
  }
}

// ---------- Teams / Players (static seed) ----------

export function getTeams() {
  return seedTeams;
}

export function getPlayers() {
  return seedPlayers;
}

export function getTeam(id: string) {
  return seedTeams.find((t) => t.id === id);
}

export function getPlayer(id: string) {
  return seedPlayers.find((p) => p.id === id);
}

export { seedMatches, defaultNotifications };

// ---------- Notifications (static seed for now) ----------

export function getNotifications(): Notification[] {
  return defaultNotifications;
}

export function getUnreadCount(): number {
  return defaultNotifications.filter((n) => !n.read).length;
}

export function markNotificationRead(id: string) {
  // no-op for server-backed iteration; seed stays static
  void id;
}

export function markAllNotificationsRead() {
  // no-op
}

import type { Tournament } from "@/data/arena";
import type { User } from "@/lib/store";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "player";
  uid: string;
  team: string;
}

async function json<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json() as Promise<T>;
}

// ---- Auth ----

export async function apiLogin(email: string, password: string) {
  return json<{ ok: boolean; error?: string; user?: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(data: { name: string; email: string; password: string; uid: string; team: string }) {
  return json<{ ok: boolean; error?: string; user?: ApiUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiLogout() {
  return json<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export async function apiMe() {
  return json<{ ok: boolean; user: ApiUser | null }>("/api/auth/me");
}

// ---- Tournaments ----

export async function apiGetTournaments(): Promise<Tournament[]> {
  const data = await json<{ ok: boolean; tournaments: Tournament[] }>("/api/tournaments");
  return data.tournaments;
}

export async function apiSaveTournament(t: Tournament) {
  return json<{ ok: boolean }>("/api/tournaments", { method: "PUT", body: JSON.stringify(t) });
}

export async function apiAddTournament(t: Partial<Tournament>) {
  return json<{ ok: boolean }>("/api/tournaments", { method: "POST", body: JSON.stringify(t) });
}

export async function apiDeleteTournament(id: string) {
  return json<{ ok: boolean }>("/api/tournaments", { method: "DELETE", body: JSON.stringify({ id }) });
}

export async function apiResetTournaments() {
  return json<{ ok: boolean; tournaments: Tournament[] }>("/api/tournaments/reset", { method: "POST" });
}

// ---- Registrations ----

export interface ApiRegistration {
  userId: string;
  tournamentId: string;
  tournamentName: string;
  playerName: string;
  playerUid: string;
  playerEmail: string;
  teamName: string;
  registeredAt: string;
}

export async function apiGetRegistrations(userId?: string): Promise<ApiRegistration[]> {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const data = await json<{ ok: boolean; registrations: ApiRegistration[] }>(`/api/registrations${qs}`);
  return data.registrations;
}

export async function apiRegisterForTournament(
  userId: string,
  tournamentId: string,
  details: { teamName: string; playerName: string; playerUid: string; playerEmail: string }
) {
  return json<{ ok: boolean; error?: string }>("/api/registrations", {
    method: "POST",
    body: JSON.stringify({ userId, tournamentId, ...details }),
  });
}

export async function apiUnregisterFromTournament(userId: string, tournamentId: string) {
  return json<{ ok: boolean }>("/api/registrations", {
    method: "DELETE",
    body: JSON.stringify({ userId, tournamentId }),
  });
}

// ---- Users ----

export async function apiGetUsers(): Promise<ApiUser[]> {
  const data = await json<{ ok: boolean; users: ApiUser[] }>("/api/users");
  return data.users;
}

export type { User };

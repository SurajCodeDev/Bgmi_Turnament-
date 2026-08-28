import type { Tournament } from "@/data/arena";
import type { User } from "@/lib/store";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "player";
  uid: string;
  team: string;
  wallet: number;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface ApiRegistrationMember {
  name: string;
  uid: string;
}

export interface ApiRegistration {
  userId: string;
  tournamentId: string;
  tournamentName: string;
  playerName: string;
  playerUid: string;
  playerEmail: string;
  teamName: string;
  members: ApiRegistrationMember[];
  claimed: boolean;
  registeredAt: string;
}

export interface ApiTransaction {
  id: string;
  userId: string;
  label: string;
  amount: number;
  status: string;
  createdAt: string;
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
    body: JSON.stringify({ identifier: email, password }),
  });
}

export async function apiLoginWithIdentifier(identifier: string, password: string) {
  return json<{ ok: boolean; error?: string; user?: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export async function apiRegister(data: { name: string; email: string; phone: string; password: string; uid: string; team: string }) {
  return json<{ ok: boolean; error?: string; pendingUserId?: string; mockOtp?: string | null }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiSendOtp(identifier: string, purpose = "login") {
  return json<{ ok: boolean; error?: string; mockOtp?: string | null; sentTo?: string }>("/api/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ identifier, purpose }),
  });
}

export async function apiVerifyOtp(data: { userId?: string; identifier?: string; otp: string; purpose?: string }) {
  return json<{ ok: boolean; error?: string; user?: ApiUser }>("/api/auth/otp/verify", {
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

export async function apiGetRegistrations(userId?: string): Promise<ApiRegistration[]> {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const data = await json<{ ok: boolean; registrations: ApiRegistration[] }>(`/api/registrations${qs}`);
  return data.registrations;
}

export async function apiRegisterForTournament(
  userId: string,
  tournamentId: string,
  details: { teamName: string; playerName: string; playerUid: string; playerEmail: string; members: ApiRegistrationMember[] }
) {
  return json<{ ok: boolean; error?: string; wallet?: number }>("/api/registrations", {
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

// ---- Wallet ----

export interface PaymentProof {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  upiId: string;
  upiTxnRef: string;
  note: string;
  status: string;
  createdAt: string;
}

export interface PaymentConfig {
  ok: boolean;
  upiId: string;
  whatsappNumber: string;
  payeeName: string;
}

export async function apiGetWallet() {
  return json<{ ok: boolean; balance: number; transactions: ApiTransaction[] }>("/api/wallet");
}

export async function apiTopUp(amount: number, upiTxnRef?: string, note?: string) {
  return json<{ ok: boolean; balance: number; payment?: PaymentProof; error?: string }>("/api/wallet/topup", {
    method: "POST",
    body: JSON.stringify({ amount, upiTxnRef, note }),
  });
}

export async function apiWithdraw(amount: number) {
  return json<{ ok: boolean; balance: number; error?: string }>("/api/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function apiGetPaymentConfig(): Promise<PaymentConfig> {
  return json<PaymentConfig>("/api/payment/config");
}

export async function apiGetPayments(): Promise<{ ok: boolean; payments: PaymentProof[] }> {
  return json<{ ok: boolean; payments: PaymentProof[] }>("/api/payments");
}

// ---- Prize ----

export async function apiClaimPrize(tournamentId: string) {
  return json<{ ok: boolean; balance: number; amount: number; error?: string }>("/api/prize/claim", {
    method: "POST",
    body: JSON.stringify({ tournamentId }),
  });
}

// ---- Users ----

export async function apiGetUsers(): Promise<ApiUser[]> {
  const data = await json<{ ok: boolean; users: ApiUser[] }>("/api/users");
  return data.users;
}

export type { User };

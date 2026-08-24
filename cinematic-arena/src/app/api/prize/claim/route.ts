import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDB, writeDB } from "@/lib/server/db";
import { prizeNumber, squadSizeFor } from "@/lib/arena";

const SESSION_COOKIE = "nla_session";

export async function POST(req: Request) {
  const { tournamentId } = await req.json();

  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const reg = db.registrations.find((r) => r.userId === userId && r.tournamentId === tournamentId);
  if (!reg) {
    return NextResponse.json({ ok: false, error: "You are not registered for this tournament." }, { status: 404 });
  }
  if (reg.claimed) {
    return NextResponse.json({ ok: false, error: "Prize already claimed." }, { status: 409 });
  }

  const t = db.tournaments.find((x) => x.id === tournamentId);
  if (!t || t.status !== "COMPLETED") {
    return NextResponse.json({ ok: false, error: "Prize available only after tournament completion." }, { status: 400 });
  }

  const share = Math.floor(prizeNumber(t) / squadSizeFor(t.mode));
  user.wallet += share;
  reg.claimed = true;
  db.transactions.push({
    id: `tx-${Date.now()}`,
    userId: user.id,
    label: `Prize — ${t.name}`,
    amount: share,
    status: "CREDITED",
    createdAt: new Date().toISOString(),
  });
  writeDB(db);

  return NextResponse.json({ ok: true, balance: user.wallet, amount: share });
}

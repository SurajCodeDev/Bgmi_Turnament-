import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { prizeNumber, squadSizeFor } from "@/lib/arena";

export async function POST(req: Request) {
  const { tournamentId } = await req.json();

  const db = readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const reg = db.registrations.find((r) => r.userId === user.id && r.tournamentId === tournamentId);
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

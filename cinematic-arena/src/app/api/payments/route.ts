import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDB, writeDB } from "@/lib/server/db";

const SESSION_COOKIE = "nla_session";

function makeRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  const db = readDB();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const user = db.users.find((u) => u.id === userId);
  const payments =
    user?.role === "admin"
      ? db.payments
      : db.payments.filter((p) => p.userId === userId);
  const sorted = [...payments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ ok: true, payments: sorted });
}

export async function POST(req: Request) {
  const { amount, upiTxnRef, note } = await req.json();
  const n = Math.floor(Number(amount) || 0);
  if (n <= 0) {
    return NextResponse.json({ ok: false, error: "Enter a valid amount." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const payment = {
    id: `pay-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    amount: n,
    upiId: db.payment.upiId,
    upiTxnRef: String(upiTxnRef || makeRef()).trim(),
    note: String(note || "").trim(),
    status: "PENDING VERIFICATION",
    createdAt: new Date().toISOString(),
  };

  db.payments.push(payment);
  writeDB(db);

  return NextResponse.json({ ok: true, payment });
}

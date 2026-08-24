import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDB, writeDB } from "@/lib/server/db";

const SESSION_COOKIE = "nla_session";

export async function POST(req: Request) {
  const { amount } = await req.json();
  const n = Math.floor(Number(amount) || 0);
  if (n <= 0 || n > 1000000) {
    return NextResponse.json({ ok: false, error: "Enter a valid amount between ₹1 and ₹10,00,000." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  user.wallet += n;
  db.transactions.push({
    id: `tx-${Date.now()}`,
    userId: user.id,
    label: `Wallet Top-up (UPI Mock)`,
    amount: n,
    status: "CREDITED",
    createdAt: new Date().toISOString(),
  });
  writeDB(db);

  return NextResponse.json({ ok: true, balance: user.wallet });
}

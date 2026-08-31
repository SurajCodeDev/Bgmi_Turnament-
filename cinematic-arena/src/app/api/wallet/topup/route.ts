import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

function makeRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(req: Request) {
  const { amount, upiTxnRef, note } = await req.json();
  const n = Math.floor(Number(amount) || 0);
  if (n <= 0 || n > 1000000) {
    return NextResponse.json({ ok: false, error: "Enter a valid amount between ₹1 and ₹10,00,000." }, { status: 400 });
  }

  const db = readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const txnRef = String(upiTxnRef || makeRef()).trim();
  const payment = {
    id: `pay-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    amount: n,
    upiId: db.payment.upiId,
    upiTxnRef: txnRef,
    note: String(note || "").trim(),
    status: "PENDING VERIFICATION",
    createdAt: new Date().toISOString(),
    type: "TOPUP" as const,
  };
  db.payments.push(payment);
  writeDB(db);

  return NextResponse.json({ ok: true, balance: user.wallet, payment });
}

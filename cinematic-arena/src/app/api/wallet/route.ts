import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDB } from "@/lib/server/db";

const SESSION_COOKIE = "nla_session";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const transactions = db.transactions.filter((t) => t.userId === user.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ ok: true, balance: user.wallet, transactions });
}

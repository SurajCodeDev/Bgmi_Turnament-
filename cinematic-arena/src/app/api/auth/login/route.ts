import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDB, writeDB } from "@/lib/server/db";

const SESSION_COOKIE = "nla_session";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const db = readDB();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === (email || "").toString().toLowerCase() && u.password === password
  );

  if (!user) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, uid: user.uid, team: user.team, wallet: user.wallet },
  });
}

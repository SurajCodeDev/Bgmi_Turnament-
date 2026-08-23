import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDB, writeDB } from "@/lib/server/db";

const SESSION_COOKIE = "nla_session";

export async function POST(req: Request) {
  const { name, email, password, uid, team } = await req.json();

  if (!name || !email || !password || !uid) {
    return NextResponse.json({ ok: false, error: "All fields are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
  }
  if (!/^\d{9,10}$/.test(String(uid))) {
    return NextResponse.json({ ok: false, error: "Enter a valid BGMI UID." }, { status: 400 });
  }

  const db = readDB();
  const exists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return NextResponse.json({ ok: false, error: "An account with this email already exists." }, { status: 409 });
  }

  const user = {
    id: `u-${Date.now()}`,
    name: String(name).trim(),
    email: String(email).trim(),
    password: String(password),
    role: "player" as const,
    uid: String(uid).trim(),
    team: String(team || "Team Solo").trim(),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  writeDB(db);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, uid: user.uid, team: user.team },
  });
}

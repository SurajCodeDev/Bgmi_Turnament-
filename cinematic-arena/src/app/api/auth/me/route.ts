import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDB } from "@/lib/server/db";

const SESSION_COOKIE = "nla_session";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) {
    return NextResponse.json({ ok: false, user: null });
  }

  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ ok: false, user: null });
  }

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, uid: user.uid, team: user.team },
  });
}

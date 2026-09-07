import { NextResponse } from "next/server";
import { readDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function GET() {
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const safe = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    uid: u.uid,
    team: u.team,
    createdAt: u.createdAt,
  }));
  return NextResponse.json({ ok: true, users: safe });
}

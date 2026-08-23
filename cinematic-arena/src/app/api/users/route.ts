import { NextResponse } from "next/server";
import { readDB } from "@/lib/server/db";

export async function GET() {
  const db = readDB();
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

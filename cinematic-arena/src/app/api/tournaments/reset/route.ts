import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function POST() {
  const db = await readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }
  const seed = (await import("@/data/arena")).tournaments;
  db.tournaments = seed;
  await writeDB(db);
  return NextResponse.json({ ok: true, tournaments: db.tournaments });
}

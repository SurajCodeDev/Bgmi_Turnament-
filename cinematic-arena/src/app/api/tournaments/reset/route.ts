import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";

export async function POST() {
  const db = readDB();
  const seed = (await import("@/data/arena")).tournaments;
  db.tournaments = seed;
  writeDB(db);
  return NextResponse.json({ ok: true, tournaments: db.tournaments });
}

import { NextResponse } from "next/server";
import { readDB } from "@/lib/server/db";

export async function GET() {
  const db = readDB();
  return NextResponse.json({ ok: true, ...db.payment });
}

import { NextResponse } from "next/server";
import { readDB } from "@/lib/server/db";

export async function GET() {
  const db = await readDB();
  return NextResponse.json({ ok: true, ...db.payment });
}

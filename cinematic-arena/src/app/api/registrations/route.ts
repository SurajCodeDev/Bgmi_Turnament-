import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const db = readDB();
  const regs = userId ? db.registrations.filter((r) => r.userId === userId) : db.registrations;
  return NextResponse.json({ ok: true, registrations: regs });
}

export async function POST(req: Request) {
  const { userId, tournamentId, teamName, playerName, playerUid, playerEmail } = await req.json();
  const db = readDB();

  if (db.registrations.some((r) => r.userId === userId && r.tournamentId === tournamentId)) {
    return NextResponse.json({ ok: false, error: "Already registered." }, { status: 409 });
  }

  const t = db.tournaments.find((x) => x.id === tournamentId);
  if (!t) {
    return NextResponse.json({ ok: false, error: "Tournament not found." }, { status: 404 });
  }
  if (t.teamsJoined >= t.teams) {
    return NextResponse.json({ ok: false, error: "Tournament is full." }, { status: 400 });
  }

  const user = db.users.find((u) => u.id === userId);
  const fallbackName = user?.name ?? "Player";
  const fallbackUid = user?.uid ?? "—";
  const fallbackEmail = user?.email ?? "—";

  db.registrations.push({
    userId,
    tournamentId,
    tournamentName: t.name,
    playerName: playerName || fallbackName,
    playerUid: playerUid || fallbackUid,
    playerEmail: playerEmail || fallbackEmail,
    teamName: teamName || "Team Solo",
    registeredAt: new Date().toISOString(),
  });
  t.teamsJoined += 1;
  writeDB(db);

  return NextResponse.json({ ok: true, registrations: db.registrations.filter((r) => r.userId === userId) });
}

export async function DELETE(req: Request) {
  const { userId, tournamentId } = await req.json();
  const db = readDB();

  const before = db.registrations.length;
  db.registrations = db.registrations.filter(
    (r) => !(r.userId === userId && r.tournamentId === tournamentId)
  );

  if (db.registrations.length !== before) {
    const t = db.tournaments.find((x) => x.id === tournamentId);
    if (t && t.teamsJoined > 0) t.teamsJoined -= 1;
  }
  writeDB(db);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { entryFeeNumber, isFreeTournament, isInviteOnly } from "@/lib/arena";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const db = readDB();
  const regs = userId ? db.registrations.filter((r) => r.userId === userId) : db.registrations;
  return NextResponse.json({ ok: true, registrations: regs });
}

export async function POST(req: Request) {
  const { tournamentId, teamName, playerName, playerUid, playerEmail, members } = await req.json();
  const db = readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const userId = user.id;

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
  if (isInviteOnly(t)) {
    return NextResponse.json({ ok: false, error: "This tournament is invite-only." }, { status: 403 });
  }

  const fee = entryFeeNumber(t);
  if (!isFreeTournament(t)) {
    if (user.wallet < fee) {
      return NextResponse.json(
        { ok: false, error: `Insufficient wallet balance. Entry fee is ₹${fee.toLocaleString("en-IN")}. Add funds first.` },
        { status: 400 }
      );
    }
    user.wallet -= fee;
    db.transactions.push({
      id: `tx-${Date.now()}`,
      userId,
      label: `Entry Fee — ${t.name}`,
      amount: -fee,
      status: "PAID",
      createdAt: new Date().toISOString(),
    });
  }

  const cleanMembers = Array.isArray(members)
    ? members
        .map((m: { name?: string; uid?: string }) => ({
          name: (m?.name || "").toString().trim(),
          uid: (m?.uid || "").toString().trim(),
        }))
        .filter((m: { name: string; uid: string }) => m.name && m.uid)
    : [];

  db.registrations.push({
    userId,
    tournamentId,
    tournamentName: t.name,
    playerName: playerName || user.name,
    playerUid: playerUid || user.uid,
    playerEmail: playerEmail || user.email,
    teamName: teamName || "Team Solo",
    members: cleanMembers,
    claimed: false,
    registeredAt: new Date().toISOString(),
  });
  t.teamsJoined += 1;
  writeDB(db);

  return NextResponse.json({ ok: true, wallet: user.wallet, registrations: db.registrations.filter((r) => r.userId === userId) });
}

export async function DELETE(req: Request) {
  const { tournamentId } = await req.json();
  const db = readDB();
  const user = await getSessionUser(db);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const userId = user.id;

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

import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action, remarks } = await req.json();
  const db = readDB();
  const admin = await getSessionUser(db);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const pay = db.payments.find((p) => p.id === id);
  if (!pay) {
    return NextResponse.json({ ok: false, error: "Payment not found." }, { status: 404 });
  }

  if (action === "verify") {
    pay.status = "VERIFIED";
    pay.verifyRemarks = String(remarks || "").trim();
    pay.verifiedAt = new Date().toISOString();
    pay.verifiedBy = admin.name;

    const user = db.users.find((u) => u.id === pay.userId);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Payer account not found." }, { status: 404 });
    }

    if (pay.type === "ENTRY" && pay.tournamentId) {
      const reg = db.registrations.find(
        (r) => r.userId === pay.userId && r.tournamentId === pay.tournamentId && r.paymentId === pay.id
      );
      if (reg) {
        reg.status = "PAID";
        const t = db.tournaments.find((x) => x.id === pay.tournamentId);
        if (t && t.teamsJoined < t.teams) t.teamsJoined += 1;
        db.notifications.push({
          id: `nt-${Date.now()}`,
          type: "PAYMENT",
          message: `Your entry payment for ${pay.tournamentName || "the tournament"} is verified. You are now registered!`,
          date: new Date().toISOString().slice(0, 10),
          read: false,
          userId: pay.userId,
        });
      }
    } else {
      // Top-up verification credits the wallet
      user.wallet += pay.amount;
      db.transactions.push({
        id: `tx-${Date.now()}`,
        userId: pay.userId,
        label: "Wallet Top-up (UPI)",
        amount: pay.amount,
        status: "CREDITED",
        createdAt: new Date().toISOString(),
      });
      db.notifications.push({
        id: `nt-${Date.now()}`,
        type: "PAYMENT",
        message: `Your UPI payment of ₹${pay.amount.toLocaleString("en-IN")} was verified. Wallet credited!`,
        date: new Date().toISOString().slice(0, 10),
        read: false,
        userId: pay.userId,
      });
    }
  } else if (action === "reject") {
    pay.status = "REJECTED";
    pay.verifyRemarks = String(remarks || "Payment could not be verified.").trim();
    pay.verifiedAt = new Date().toISOString();
    pay.verifiedBy = admin.name;

    if (pay.type === "ENTRY" && pay.tournamentId) {
      db.registrations = db.registrations.filter(
        (r) => !(r.userId === pay.userId && r.tournamentId === pay.tournamentId && r.paymentId === pay.id)
      );
    }
    db.notifications.push({
      id: `nt-${Date.now()}`,
      type: "PAYMENT",
      message: `Your payment of ₹${pay.amount.toLocaleString("en-IN")} was rejected. ${pay.verifyRemarks}`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
      userId: pay.userId,
    });
  } else {
    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  }

  writeDB(db);
  return NextResponse.json({ ok: true, payment: pay });
}

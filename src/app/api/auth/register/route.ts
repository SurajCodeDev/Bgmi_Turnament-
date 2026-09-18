import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/server/db";
import { isValidEmail, isValidPhone, isValidUid, issueOtp, OTP_MOCK } from "@/lib/server/otp";
import { emailDeliveryEnabled, emailReachable, sendOtpEmail } from "@/lib/server/email";

export async function POST(req: Request) {
  const { name, email, phone, password, uid, team } = await req.json();

  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPhone = String(phone || "").trim();

  if (!name) return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  if (!cleanEmail && !cleanPhone) {
    return NextResponse.json({ ok: false, error: "Email or mobile number is required." }, { status: 400 });
  }
  if (cleanEmail && !isValidEmail(cleanEmail)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }
  if (cleanPhone && !isValidPhone(cleanPhone)) {
    return NextResponse.json({ ok: false, error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
  }
  if (!isValidUid(String(uid || ""))) {
    return NextResponse.json({ ok: false, error: "Enter a valid BGMI UID (9-10 digits)." }, { status: 400 });
  }

  const db = await readDB();
  const exists = db.users.find(
    (u) => (cleanEmail && u.email.toLowerCase() === cleanEmail) || (cleanPhone && u.phone === cleanPhone)
  );
  if (exists) {
    return NextResponse.json({ ok: false, error: "An account with this email or mobile already exists." }, { status: 409 });
  }

  const user = {
    id: `u-${Date.now()}`,
    name: String(name).trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: String(password),
    role: "player" as const,
    uid: String(uid).trim(),
    team: String(team || "Team Solo").trim(),
    wallet: 0,
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  await writeDB(db);

  const otp = await issueOtp(user.id, cleanEmail || cleanPhone, "register");
  const mockOtps: Record<string, string> = {};

  let deliveredEmail = false;
  if (cleanEmail && emailDeliveryEnabled() && emailReachable(cleanEmail)) {
    deliveredEmail = await sendOtpEmail(cleanEmail, user.name, otp);
  }

  if (cleanEmail && !deliveredEmail && OTP_MOCK) mockOtps.email = otp;
  if (cleanPhone && !deliveredEmail && OTP_MOCK) mockOtps.phone = otp;

  return NextResponse.json({
    ok: true,
    pendingUserId: user.id,
    sentTo: [cleanEmail || "", cleanPhone || ""].filter(Boolean),
    delivery: deliveredEmail ? "email" : "mock",
    mockOtp: OTP_MOCK && !deliveredEmail ? otp : null,
    mockOtps,
  });
}

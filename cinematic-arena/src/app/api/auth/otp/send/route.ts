import { NextResponse } from "next/server";
import { findByIdentifier, issueOtp, OTP_MOCK, isValidEmail, isValidPhone } from "@/lib/server/otp";

export async function POST(req: Request) {
  const { identifier, purpose } = await req.json();
  const id = String(identifier || "").trim().toLowerCase();

  if (!id || (!isValidEmail(id) && !isValidPhone(id))) {
    return NextResponse.json({ ok: false, error: "Enter a valid email or 10-digit mobile number." }, { status: 400 });
  }

  const { user } = findByIdentifier(id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "No account found with this email/mobile. Please register first." }, { status: 404 });
  }

  const otp = issueOtp(user.id, id, purpose || "login");
  return NextResponse.json({
    ok: true,
    sentTo: id,
    mockOtp: OTP_MOCK ? otp : null,
  });
}

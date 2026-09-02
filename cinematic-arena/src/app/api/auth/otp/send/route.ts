import { NextResponse } from "next/server";
import { findByIdentifier, issueOtp, OTP_MOCK, isValidEmail, isValidPhone } from "@/lib/server/otp";
import { emailDeliveryEnabled, emailReachable, sendOtpEmail } from "@/lib/server/email";

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

  const isEmail = isValidEmail(id);
  const canDeliver = isEmail && emailDeliveryEnabled() && emailReachable(id);

  if (canDeliver) {
    const ok = await sendOtpEmail(id, user.name, otp);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Failed to send the OTP email. Please try again." }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      sentTo: id,
      delivery: "email",
      mockOtp: null,
    });
  }

  return NextResponse.json({
    ok: true,
    sentTo: id,
    delivery: "mock",
    mockOtp: OTP_MOCK ? otp : null,
  });
}

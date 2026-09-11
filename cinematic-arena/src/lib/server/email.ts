import { Resend } from "resend";

export function emailDeliveryEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.OTP_EMAIL_FROM);
}

export function emailReachable(email: string): boolean {
  const address = String(email || "").trim().toLowerCase();
  const domain = (process.env.OTP_EMAIL_TO_DOMAIN || "").toLowerCase().trim();
  const testRecipient = (process.env.OTP_TEST_RECIPIENT || "").toLowerCase().trim();

  if (testRecipient && address === testRecipient) return true;
  if (domain) return address.endsWith("@" + domain);
  return false;
}

export async function sendOtpEmail(to: string, name: string, otp: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OTP_EMAIL_FROM || "NEXT LEVEL ARENA <onboarding@resend.dev>";
  if (!apiKey) return false;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: "NEXT LEVEL ARENA — Your OTP",
      html: `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#05060c;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;transform:rotate(45deg);border:2px solid #22d3ee;padding:8px;margin-bottom:12px">
          <div style="width:10px;height:10px;background:#22d3ee"></div>
        </div>
        <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:4px;font-weight:900">NEXT LEVEL ARENA</h1>
      </div>
      <div style="background:#0a0d16;border:1px solid #1a2134;padding:32px 24px;text-align:center">
        <p style="margin:0 0 6px;color:#94a3b8;font-size:13px">HEY ${(name || "PLAYER").toUpperCase()},</p>
        <p style="margin:0 0 18px;color:#e2e8f0;font-size:14px">Your one-time code to enter the arena:</p>
        <p style="margin:0 0 18px;font-size:36px;letter-spacing:12px;font-weight:900;color:#22d3ee">${otp}</p>
        <p style="margin:0 0 4px;color:#64748b;font-size:12px">This code expires in 10 minutes.</p>
        <p style="margin:0;color:#64748b;font-size:12px">Never share this code with anyone.</p>
      </div>
      <p style="text-align:center;color:#334155;font-size:11px;margin-top:20px">
        NEXT LEVEL ARENA — DROP. FIGHT. CLAIM.
      </p>
    </div>
  </body>
</html>`,
    });
    return !error;
  } catch {
    return false;
  }
}

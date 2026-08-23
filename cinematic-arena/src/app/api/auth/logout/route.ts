import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "nla_session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}

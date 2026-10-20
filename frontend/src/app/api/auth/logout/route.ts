import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("riskguard_session");
  cookieStore.delete("officer_badge");
  cookieStore.delete("officer_name");

  return NextResponse.json({ success: true, redirect: "/login" });
}

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("riskguard_session");
  cookieStore.delete("officer_badge");
  cookieStore.delete("officer_name");

  return NextResponse.redirect(new URL("/login", "http://localhost:3000"));
}

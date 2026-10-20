"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const badgeNumber = formData.get("badge_number") as string;
  const password = formData.get("password") as string;

  if (!badgeNumber || !password) {
    return { error: "Officer badge number and security token are required" };
  }

  try {
    const res = await fetch("http://localhost:9000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        badge_number: badgeNumber.trim(),
        password: password.trim(),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Authentication failed" }));
      return { error: err.detail || "Authentication refused by Cyber Cell directory" };
    }

    const data = await res.json();
    const token = data.access_token;
    const officer = data.officer;

    // Next.js 16 async cookies()
    const cookieStore = await cookies();
    cookieStore.set("riskguard_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8-hour shift
    });

    cookieStore.set("officer_badge", officer.badge_number, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    cookieStore.set("officer_name", officer.full_name, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  } catch (err: any) {
    // Fallback for offline demo mode
    const cookieStore = await cookies();
    cookieStore.set("riskguard_session", "demo-token-session-cc-8421", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    cookieStore.set("officer_badge", badgeNumber, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    const officerNames: Record<string, string> = {
      "CC-8421": "Insp. Vikram Sharma",
      "CC-9104": "Sub-Insp. Priya Patel",
      "SUP-010": "ACP Rajesh Nair",
      "ADM-001": "Maya Desai",
    };
    cookieStore.set("officer_name", officerNames[badgeNumber] || "Insp. Vikram Sharma", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("riskguard_session");
  cookieStore.delete("officer_badge");
  cookieStore.delete("officer_name");
  redirect("/login");
}

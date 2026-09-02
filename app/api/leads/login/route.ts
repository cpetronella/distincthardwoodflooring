import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createLeadSession, findDashboardUser, leadSessionCookie, normalizeUsername, verifyPassword } from "../../../../lib/leads-auth";

async function throttleKey(request: Request, username: string) {
  const clientAddress = request.headers.get("cf-connecting-ip") ?? "unknown";
  const value = `${normalizeUsername(username)}:${clientAddress}`;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { username?: unknown; password?: unknown };
    const username = typeof payload.username === "string" ? normalizeUsername(payload.username) : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const [{ getDb }, { dashboardLoginThrottles }] = await Promise.all([import("../../../../db"), import("../../../../db/schema")]);
    const db = getDb();
    const key = await throttleKey(request, username);
    const now = new Date();
    const nowIso = now.toISOString();
    const [throttle] = await db.select().from(dashboardLoginThrottles).where(eq(dashboardLoginThrottles.key, key)).limit(1);
    if (throttle?.lockedUntil && new Date(throttle.lockedUntil) > now) {
      return NextResponse.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });
    }

    const user = username ? await findDashboardUser(username) : null;
    if (user && await verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      await db.delete(dashboardLoginThrottles).where(eq(dashboardLoginThrottles.key, key));
      const response = NextResponse.json({ ok: true });
      response.cookies.set(leadSessionCookie.name, await createLeadSession(user), leadSessionCookie.options);
      return response;
    }

    const previousAttempts = throttle && (!throttle.lockedUntil || new Date(throttle.lockedUntil) <= now) ? throttle.attempts : 0;
    const attempts = previousAttempts + 1;
    const lockedUntil = attempts >= 5 ? new Date(now.valueOf() + 15 * 60 * 1000).toISOString() : "";
    await db.insert(dashboardLoginThrottles).values({ key, attempts, lockedUntil, updatedAt: nowIso }).onConflictDoUpdate({
      target: [dashboardLoginThrottles.key],
      set: { attempts, lockedUntil, updatedAt: nowIso },
    });
    return NextResponse.json({ error: lockedUntil ? "Too many attempts. Please try again in 15 minutes." : "Your username or password is not correct." }, { status: lockedUntil ? 429 : 401 });
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}

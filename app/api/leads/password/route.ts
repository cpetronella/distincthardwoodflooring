import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createLeadSession, createPasswordRecord, getLeadSession, leadSessionCookie, validPassword, verifyPassword } from "../../../../lib/leads-auth";

export async function PATCH(request: Request) {
  const session = await getLeadSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  try {
    const payload = (await request.json()) as { currentPassword?: unknown; newPassword?: unknown };
    const currentPassword = typeof payload.currentPassword === "string" ? payload.currentPassword : "";
    const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";
    if (!validPassword(newPassword, session.username)) {
      return NextResponse.json({ error: "Use a password with at least 14 characters that does not include your username." }, { status: 400 });
    }

    const [{ getDb }, { dashboardUsers }] = await Promise.all([import("../../../../db"), import("../../../../db/schema")]);
    const db = getDb();
    const [user] = await db.select().from(dashboardUsers).where(eq(dashboardUsers.id, session.id)).limit(1);
    if (!user || !(await verifyPassword(currentPassword, user.passwordSalt, user.passwordHash))) {
      return NextResponse.json({ error: "Your current password is not correct." }, { status: 401 });
    }

    const passwordRecord = await createPasswordRecord(newPassword);
    const updatedUser = { ...session, sessionVersion: user.sessionVersion + 1 };
    await db.update(dashboardUsers).set({ ...passwordRecord, passwordUpdatedAt: new Date().toISOString(), sessionVersion: updatedUser.sessionVersion }).where(eq(dashboardUsers.id, session.id));
    const response = NextResponse.json({ ok: true });
    response.cookies.set(leadSessionCookie.name, await createLeadSession(updatedUser), leadSessionCookie.options);
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to update your password right now." }, { status: 500 });
  }
}

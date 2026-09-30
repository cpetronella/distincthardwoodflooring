import { NextResponse } from "next/server";
import { getLeadSession, leadSessionCookie } from "../../../../lib/leads-auth";

export async function POST(request: Request) {
  const session = await getLeadSession();
  if (session) {
    const { rawDb } = await import('../../../../lib/raw-db');
    await rawDb().prepare('UPDATE dashboard_users SET session_version=session_version+1 WHERE id=?').bind(session.id).run();
  }
  const response = NextResponse.redirect(new URL("/leads/sign-in", request.url), 303);
  response.cookies.set(leadSessionCookie.name, "", { ...leadSessionCookie.options, maxAge: 0 });
  return response;
}

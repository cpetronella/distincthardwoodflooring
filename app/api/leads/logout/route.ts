import { NextResponse } from "next/server";
import { leadSessionCookie } from "../../../../lib/leads-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/leads/sign-in", request.url), 303);
  response.cookies.set(leadSessionCookie.name, "", { ...leadSessionCookie.options, maxAge: 0 });
  return response;
}

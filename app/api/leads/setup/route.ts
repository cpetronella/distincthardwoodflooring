import { NextResponse } from "next/server";
import { createLeadSession, createPasswordRecord, dashboardUsersExist, findDashboardUser, isCorrectLeadPasscode, leadSessionCookie, normalizeUsername, validPassword, validUsername } from "../../../../lib/leads-auth";

type AccountInput = { displayName?: unknown; username?: unknown; password?: unknown };

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  let stage = "reading setup request";
  try {
    const payload = (await request.json()) as { setupCode?: unknown; accounts?: unknown };
    const setupCode = typeof payload.setupCode === "string" ? payload.setupCode : "";
    const accounts = Array.isArray(payload.accounts) ? payload.accounts as AccountInput[] : [];
    stage = "checking setup code";
    if (accounts.length !== 2 || !(await isCorrectLeadPasscode(setupCode))) {
      return NextResponse.json({ error: "The setup information is not correct." }, { status: 401 });
    }
    stage = "checking dashboard database";
    if (await dashboardUsersExist()) {
      return NextResponse.json({ error: "Dashboard accounts have already been set up." }, { status: 409 });
    }

    const prepared = accounts.map((account) => ({
      displayName: clean(account.displayName, 60),
      username: normalizeUsername(clean(account.username, 120)),
      password: typeof account.password === "string" ? account.password : "",
    }));
    if (prepared.some((account) => !account.displayName || !validUsername(account.username) || !validPassword(account.password, account.username)) || prepared[0].username === prepared[1].username || prepared[0].password === prepared[1].password) {
      return NextResponse.json({ error: "Use two different usernames or email addresses. Each password must be unique, at least 14 characters, and must not include its login identifier." }, { status: 400 });
    }

    stage = "creating password records";
    const records = await Promise.all(prepared.map(async (account) => ({ ...account, ...(await createPasswordRecord(account.password)) })));
    const [{ getDb }, { dashboardUsers }] = await Promise.all([import("../../../../db"), import("../../../../db/schema")]);
    const db = getDb();
    const now = new Date().toISOString();
    stage = "saving dashboard accounts";
    await db.batch(records.map(({ displayName, username, passwordSalt, passwordHash }) => db.insert(dashboardUsers).values({
      displayName,
      username,
      passwordSalt,
      passwordHash,
      passwordUpdatedAt: now,
    })));

    stage = "starting dashboard session";
    const firstUser = await findDashboardUser(prepared[0].username);
    if (!firstUser) throw new Error("Unable to start the dashboard session.");
    const response = NextResponse.json({ ok: true });
    response.cookies.set(leadSessionCookie.name, await createLeadSession(firstUser), leadSessionCookie.options);
    return response;
  } catch (error) {
    console.error("Lead dashboard setup failed", {
      stage,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Unable to set up dashboard access right now." }, { status: 500 });
  }
}

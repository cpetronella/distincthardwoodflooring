import { eq } from "drizzle-orm";
import { hasLeadSession } from "../../../../lib/leads-auth";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export async function PATCH(request: Request) {
  if (!(await hasLeadSession())) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as { id?: unknown; channel?: unknown };
    const id = typeof payload.id === "number" ? payload.id : Number(payload.id);
    const channel = typeof payload.channel === "string" ? payload.channel : "";
    if (!Number.isSafeInteger(id) || id < 1 || (channel !== "email" && channel !== "phone")) {
      return Response.json({ error: "Invalid marketing preference update." }, { status: 400 });
    }

    const [{ getDb }, { estimates, marketingSuppressions }] = await Promise.all([
      import("../../../../db"),
      import("../../../../db/schema"),
    ]);
    const db = getDb();
    const optedOutAt = new Date().toISOString();
    const [lead] = await db.select({ email: estimates.email, phone: estimates.phone }).from(estimates).where(eq(estimates.id, id)).limit(1);
    if (!lead) return Response.json({ error: "Contact not found." }, { status: 404 });

    if (channel === "email") {
      await db.insert(marketingSuppressions).values({ channel, contact: normalizeEmail(lead.email), optedOutAt, source: "dashboard" }).onConflictDoUpdate({
        target: [marketingSuppressions.channel, marketingSuppressions.contact],
        set: { optedOutAt, source: "dashboard" },
      });
      await db.update(estimates).set({ emailMarketingConsent: false, emailMarketingOptedOutAt: optedOutAt }).where(eq(estimates.id, id));
    } else {
      await db.insert(marketingSuppressions).values({ channel, contact: normalizePhone(lead.phone), optedOutAt, source: "dashboard" }).onConflictDoUpdate({
        target: [marketingSuppressions.channel, marketingSuppressions.contact],
        set: { optedOutAt, source: "dashboard" },
      });
      await db.update(estimates).set({ phoneMarketingConsent: false, phoneMarketingOptedOutAt: optedOutAt }).where(eq(estimates.id, id));
    }

    return Response.json({ ok: true, optedOutAt });
  } catch {
    return Response.json({ error: "Unable to update this marketing preference." }, { status: 500 });
  }
}

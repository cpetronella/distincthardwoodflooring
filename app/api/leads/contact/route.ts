import { eq } from "drizzle-orm";
import { hasLeadSession } from "../../../../lib/leads-auth";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export async function DELETE(request: Request) {
  if (!(await hasLeadSession())) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as { id?: unknown };
    const id = typeof payload.id === "number" ? payload.id : Number(payload.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return Response.json({ error: "Invalid contact." }, { status: 400 });
    }

    const [{ getDb }, { estimates, marketingSuppressions }] = await Promise.all([
      import("../../../../db"),
      import("../../../../db/schema"),
    ]);
    const db = getDb();
    const [lead] = await db.select({
      email: estimates.email,
      phone: estimates.phone,
      emailOptedOutAt: estimates.emailMarketingOptedOutAt,
      phoneOptedOutAt: estimates.phoneMarketingOptedOutAt,
    }).from(estimates).where(eq(estimates.id, id)).limit(1);
    if (!lead) return Response.json({ error: "Contact not found." }, { status: 404 });

    if (lead.emailOptedOutAt && lead.email) {
      await db.insert(marketingSuppressions).values({ channel: "email", contact: normalizeEmail(lead.email), optedOutAt: lead.emailOptedOutAt, source: "lead-deletion" }).onConflictDoUpdate({
        target: [marketingSuppressions.channel, marketingSuppressions.contact],
        set: { optedOutAt: lead.emailOptedOutAt, source: "lead-deletion" },
      });
    }
    if (lead.phoneOptedOutAt && lead.phone) {
      await db.insert(marketingSuppressions).values({ channel: "phone", contact: normalizePhone(lead.phone), optedOutAt: lead.phoneOptedOutAt, source: "lead-deletion" }).onConflictDoUpdate({
        target: [marketingSuppressions.channel, marketingSuppressions.contact],
        set: { optedOutAt: lead.phoneOptedOutAt, source: "lead-deletion" },
      });
    }

    await db.delete(estimates).where(eq(estimates.id, id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to delete this contact." }, { status: 500 });
  }
}

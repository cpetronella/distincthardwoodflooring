import { eq } from "drizzle-orm";
import { hasLeadSession } from "../../../../lib/leads-auth";

function escapeVCard(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function safeFilename(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 80) || "customer";
}

export async function GET(request: Request) {
  if (!(await hasLeadSession())) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) {
      return Response.json({ error: "Invalid contact." }, { status: 400 });
    }

    const [{ getDb }, { estimates }] = await Promise.all([
      import("../../../../db"),
      import("../../../../db/schema"),
    ]);
    const [lead] = await getDb().select().from(estimates).where(eq(estimates.id, id)).limit(1);
    if (!lead) return Response.json({ error: "Contact not found." }, { status: 404 });

    const firstName = lead.firstName || lead.name.split(" ")[0] || "";
    const lastName = lead.lastName || lead.name.split(" ").slice(1).join(" ");
    const fullName = `${firstName} ${lastName}`.trim() || lead.name;
    const billingAddress = lead.billingAddress || lead.address;
    const billingCity = lead.billingCity || lead.city;
    const billingState = lead.billingState || lead.state;
    const billingZipCode = lead.billingZipCode || lead.zipCode;
    const notes = [
      lead.service ? `Project type: ${lead.service}` : "",
      lead.estimateAmountCents > 0 ? `Estimate: $${(lead.estimateAmountCents / 100).toFixed(2)}` : "",
    ].filter(Boolean).join(" | ");

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
      `FN:${escapeVCard(fullName)}`,
      `TEL;TYPE=CELL:${escapeVCard(lead.phone)}`,
      lead.email ? `EMAIL;TYPE=INTERNET:${escapeVCard(lead.email)}` : "",
      `item1.ADR;TYPE=HOME:;;${escapeVCard(billingAddress)};${escapeVCard(billingCity)};${escapeVCard(billingState)};${escapeVCard(billingZipCode)};USA`,
      "item1.X-ABLabel:Billing",
      `item2.ADR;TYPE=WORK:;;${escapeVCard(lead.address)};${escapeVCard(lead.city)};${escapeVCard(lead.state)};${escapeVCard(lead.zipCode)};USA`,
      "item2.X-ABLabel:Service",
      notes ? `NOTE:${escapeVCard(notes)}` : "",
      "CATEGORIES:Distinct Hardwood Flooring Lead",
      "END:VCARD",
    ].filter(Boolean);

    return new Response(`${lines.join("\r\n")}\r\n`, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${safeFilename(fullName)}-joist-contact.vcf"`,
        "Content-Type": "text/vcard; charset=utf-8",
      },
    });
  } catch {
    return Response.json({ error: "Unable to create this contact card." }, { status: 500 });
  }
}

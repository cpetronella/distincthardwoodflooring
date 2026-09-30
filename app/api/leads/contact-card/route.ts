import { hasLeadSession } from "../../../../lib/leads-auth";

function vcard(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export async function GET(request: Request) {
  if (!(await hasLeadSession())) return Response.json({ error: "Sign in required." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) return Response.json({ error: "Choose a valid contact." }, { status: 400, headers: { "Cache-Control": "no-store" } });

  try {
    const { rawDb } = await import("../../../../lib/raw-db");
    const lead = await rawDb().prepare("SELECT name,first_name,last_name,phone,email,address,city,state,zip_code FROM estimates WHERE id=? AND archived_at=''").bind(id).first<{
      name: string; first_name: string; last_name: string; phone: string; email: string;
      address: string; city: string; state: string; zip_code: string;
    }>();
    if (!lead) return Response.json({ error: "Contact not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    const lines = [
      "BEGIN:VCARD", "VERSION:3.0", `FN:${vcard(lead.name)}`,
      `N:${vcard(lead.last_name)};${vcard(lead.first_name)};;;`,
      `TEL;TYPE=CELL:${vcard(lead.phone)}`,
    ];
    if (lead.email) lines.push(`EMAIL;TYPE=INTERNET:${vcard(lead.email)}`);
    if (lead.address || lead.city || lead.state || lead.zip_code) lines.push(`ADR;TYPE=HOME:;;${vcard(lead.address)};${vcard(lead.city)};${vcard(lead.state)};${vcard(lead.zip_code)};USA`);
    lines.push("END:VCARD", "");
    return new Response(lines.join("\r\n"), { headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="contact-${id}.vcf"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return Response.json({ error: "Unable to create this contact card." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

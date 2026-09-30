import { getLeadSession, isSuperadmin } from "../../../../lib/leads-auth";
import { smallJson } from "../../../../lib/request-security";
import { audit } from "../../../../lib/retention";

export async function PATCH(request: Request) {
  const user = await getLeadSession();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

  try {
    const input = await smallJson(request);
    const id = Number(input.id);
    if (!Number.isSafeInteger(id) || id < 1 || typeof input.archived !== "boolean") {
      return Response.json({ error: "Choose a contact to update." }, { status: 400 });
    }
    const note = typeof input.note === "string" ? input.note.trim() : "";
    if (input.archived && (note.length < 5 || note.length > 500)) {
      return Response.json({ error: "Explain why you are removing this lead in 5 to 500 characters." }, { status: 400 });
    }
    if (!input.archived && !isSuperadmin(user)) return Response.json({ error: "Only superadmins can restore records from Database Management." }, { status: 403 });

    const { rawDb } = await import("../../../../lib/raw-db");
    const db = rawDb();
    const record = await db.prepare("SELECT archived_at FROM estimates WHERE id=?").bind(id).first<{ archived_at: string }>();
    if (!record) return Response.json({ error: "This contact is no longer available." }, { status: 404 });
    if (Boolean(record.archived_at) === input.archived) {
      return Response.json({ error: "This contact has already been updated. Refresh the page." }, { status: 409 });
    }

    const now = new Date().toISOString();
    const archivedAt = input.archived ? now : "";
    const results = await db.batch([
      db.prepare("UPDATE estimates SET archived_at=? WHERE id=? AND archived_at=?").bind(archivedAt, id, record.archived_at),
      audit(db, id, user.id, input.archived ? "removed_from_leads" : "restored_to_leads", input.archived ? note : "", now),
    ]);
    if (!results[0].meta.changes) return Response.json({ error: "This contact changed. Refresh the page." }, { status: 409 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to update this contact. Please try again." }, { status: 500 });
  }
}

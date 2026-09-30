export const classifications = ["prospect", "active-project", "completed-project", "review-required"] as const;
export type Classification = typeof classifications[number];
export type StoredLead = {id:number;created_at:string;status:string;estimate_amount_cents:number;classification:string;last_activity_at:string;completed_at:string;retention_due_at:string;retention_hold:number;retention_hold_reason:string;email:string;phone:string;email_marketing_opted_out_at:string;phone_marketing_opted_out_at:string};

export function retentionDue(classification: string, activity: string, completion = "") {
  const years = classification === "prospect" ? 2 : classification === "completed-project" ? 7 : 0;
  if (!years) return "";
  const date = new Date(classification === "completed-project" ? completion : activity);
  if (!Number.isFinite(date.valueOf())) throw new Error("A valid activity or completion date is required.");
  const month = date.getUTCMonth();
  date.setUTCFullYear(date.getUTCFullYear() + years);
  if (date.getUTCMonth() !== month) date.setUTCDate(0);
  return date.toISOString();
}

// Inbox warnings begin near eligibility. Legacy records have no verified
// classification, so creation or recorded activity is only a review reminder,
// never a deletion date.
export function retentionAttention(lead: {classification:string;createdAt:string;lastActivityAt:string;retentionDueAt:string;retentionHold:boolean}, now = new Date()) {
  if (lead.retentionHold || lead.classification === "active-project") return null;
  const threshold = new Date(now);
  threshold.setUTCDate(threshold.getUTCDate() + 90);
  if (lead.classification === "review-required") {
    const activity = lead.lastActivityAt || lead.createdAt;
    const parsed = new Date(activity.includes("T") ? activity : activity.replace(" ", "T") + "Z");
    if (!Number.isFinite(parsed.valueOf())) return "review";
    return Date.parse(retentionDue("prospect", parsed.toISOString())) <= threshold.valueOf() ? "review" : null;
  }
  const due = Date.parse(lead.retentionDueAt);
  return Number.isFinite(due) && due <= threshold.valueOf() ? "due" : null;
}

export function normalizeContact(channel: string, value: string) {
  if (channel === "email") return value.trim().toLowerCase();
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

export function audit(db: D1Database, leadId: number | null, actorId: number | null, action: string, details = "", now = new Date().toISOString()) {
  return db.prepare("INSERT INTO audit_events (lead_id,actor_id,action,details,created_at) VALUES (?,?,?,?,?)").bind(leadId,actorId,action,details,now);
}

// All statements run in one D1 transaction. No identity is retained in outcomes.
export async function removePersonalData(db: D1Database, id: number, actor: number | null, preserveOutcome = false, now = new Date().toISOString(), expiredOnly = false, manualReason = "") {
  const lead = await db.prepare("SELECT * FROM estimates WHERE id=?").bind(id).first<StoredLead>();
  if (!lead || lead.retention_hold ||
      (!expiredOnly && ["active-project","review-required"].includes(lead.classification)) ||
      (expiredOnly && (!lead.retention_due_at || lead.retention_due_at > now || !["prospect","completed-project"].includes(lead.classification)))) return false;
  const guard = expiredOnly ? "AND retention_hold=0 AND retention_due_at<>'' AND retention_due_at<=? AND classification IN ('prospect','completed-project')" : "AND retention_hold=0 AND classification IN ('prospect','completed-project')";
  const params = expiredOnly ? [id, now] : [id];
  const statements = [];
  for (const channel of ["email","phone"]) {
    const opted = channel === "email" ? lead.email_marketing_opted_out_at : lead.phone_marketing_opted_out_at;
    const contact = normalizeContact(channel, channel === "email" ? lead.email : lead.phone);
    if (opted && contact) statements.push(db.prepare("INSERT INTO marketing_suppressions (channel,contact,opted_out_at,source) VALUES (?,?,?,'deletion') ON CONFLICT(channel,contact) DO NOTHING").bind(channel,contact,opted));
  }
  if (preserveOutcome) statements.push(db.prepare(`INSERT INTO anonymous_outcomes (year,outcome) SELECT substr(created_at,1,4), CASE WHEN classification='completed-project' THEN 'completed' ELSE 'unconverted' END FROM estimates WHERE id=? ${guard}`).bind(...params));
  // Remove consent/lead history with identity; retain the actor, record ID and time of removal.
  statements.push(db.prepare(`DELETE FROM audit_events WHERE lead_id IN (SELECT id FROM estimates WHERE id=? ${guard})`).bind(...params));
  statements.push(db.prepare(`INSERT INTO audit_events(lead_id,actor_id,action,details,created_at) SELECT id,?,?,?,? FROM estimates WHERE id=? ${guard}`).bind(actor,preserveOutcome ? "personal_data_anonymized" : "personal_data_deleted",JSON.stringify({source:expiredOnly?"retention_cleanup":"dashboard",classification:lead.classification,...(!expiredOnly?{reason:manualReason}:{})}),now,...params));
  statements.push(db.prepare(`DELETE FROM estimates WHERE id=? ${guard}`).bind(...params));
  const results = await db.batch(statements);
  return (results[results.length-1].meta.changes ?? 0) > 0;
}

export async function cleanupExpired(db: D1Database, now = new Date().toISOString()) {
  const day = now.slice(0,10);
  const lock = await db.prepare("INSERT OR IGNORE INTO maintenance_runs(day) VALUES (?)").bind(day).run();
  if (!lock.meta.changes) return { skipped: true, removed: 0 };
  let removed = 0;
  try {
    const rows = await db.prepare("SELECT id FROM estimates WHERE retention_hold=0 AND retention_due_at<>'' AND retention_due_at<=? AND classification IN ('prospect','completed-project') ORDER BY retention_due_at LIMIT 100").bind(now).all<{id:number}>();
    for (const row of rows.results) if (await removePersonalData(db,row.id,null,true,now,true)) removed++;
    await db.batch([
      db.prepare("UPDATE maintenance_runs SET completed_at=?,removed=? WHERE day=?").bind(now,removed,day),
      db.prepare("DELETE FROM dashboard_login_throttles WHERE updated_at<?").bind(new Date(new Date(now).valueOf()-86400000).toISOString()),
      audit(db,null,null,"retention_cleanup",JSON.stringify({removed}),now),
    ]);
    return { skipped:false, removed };
  } catch (error) {
    await db.prepare("DELETE FROM maintenance_runs WHERE day=? AND completed_at=''").bind(day).run();
    throw error;
  }
}

import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLeadSession, isSuperadmin } from "../../../lib/leads-auth";
import { retentionAttention } from "../../../lib/retention";
import { formatPhone } from "../../../lib/phone";
import { RetentionControl, RetentionCountdown } from "../retention-control";
import { DashboardNav } from "../dashboard-nav";
import { LeadArchiveControl } from "../lead-archive";
import { LeadDeleteControl } from "../lead-delete";

export const dynamic = "force-dynamic";

function readableDate(value: string) {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "America/New_York" }).format(date);
}

export default async function RetentionPage() {
  const currentUser = await getLeadSession();
  if (!currentUser) redirect("/leads/sign-in");
  if (!isSuperadmin(currentUser)) redirect("/leads");

  const [{ getDb }, { estimates }] = await Promise.all([import("../../../db"), import("../../../db/schema")]);
  const leads = await getDb().select().from(estimates).orderBy(desc(estimates.createdAt));
  const { rawDb } = await import("../../../lib/raw-db");
  const db = rawDb();
  const maintenance = await db.prepare("SELECT completed_at FROM maintenance_runs WHERE completed_at<>'' ORDER BY day DESC LIMIT 1").first<{ completed_at: string }>();
  const history = await db.prepare("SELECT lead_id,actor_id,action,details,created_at FROM audit_events WHERE lead_id IN (SELECT id FROM estimates) ORDER BY id DESC").all<{ lead_id: number; actor_id: number | null; action: string; details: string; created_at: string }>();
  const now = new Date().toISOString();
  const attention = leads.map(lead => retentionAttention(lead, new Date(now))).filter(Boolean);
  const reviewCount = attention.filter(type => type === "review").length;
  const dueCount = attention.filter(type => type === "due").length;
  const active = leads.filter(lead => !lead.archivedAt);
  const archived = leads.filter(lead => lead.archivedAt).sort((a, b) => b.archivedAt.localeCompare(a.archivedAt));
  const ordered = [...active].sort((a, b) => {
    const priority = (lead: typeof a) => lead.classification === "review-required" ? 0 : lead.retentionHold ? 3 : lead.retentionDueAt && lead.retentionDueAt <= now ? 1 : 2;
    return priority(a) - priority(b) || (a.retentionDueAt || "9999").localeCompare(b.retentionDueAt || "9999");
  });
  const renderRecord = (lead: typeof leads[number]) => {
    const customerType = lead.customerType === "homeowner" ? "Homeowner" : lead.customerType === "contractor" ? "Contractor" : lead.customerType === "other" ? `Other${lead.customerTypeOther ? `: ${lead.customerTypeOther}` : ""}` : "Not recorded";
    const removalNote = lead.archivedAt ? history.results.find(event => event.lead_id === lead.id && event.action === "removed_from_leads")?.details.trim() : "";
    return <article className="retention-record" key={lead.id}>
    <div className="retention-record-head"><div><h3>{lead.name}</h3><p className="retention-record-meta"><span><strong>Customer type:</strong> {customerType}</span><span><strong>Project type:</strong> {lead.service || "Not specified"}</span><span><strong>Received:</strong> {readableDate(lead.createdAt)}</span></p>{lead.archivedAt && <p><strong>Removed from leads:</strong> {readableDate(lead.archivedAt)}</p>}</div><RetentionCountdown lead={lead} asOf={now} /></div>
    {lead.archivedAt && <div className="retention-archived-actions">
      <div className="retention-removal-note"><strong>Reason removed from Leads</strong><p>{removalNote || "No reason was recorded for this earlier removal."}</p></div>
      <LeadArchiveControl id={lead.id} name={lead.name} archived />
      <details className="lead-record-details"><summary>Contact details</summary>
        <p>Phone: {formatPhone(lead.phone)}{lead.email && <> · Email: {lead.email}</>}</p>
        <p>Service address: {[lead.address, lead.city, lead.state, lead.zipCode].filter(Boolean).join(", ") || "Not recorded"}</p>
        <p><strong>Customer type:</strong> {customerType}</p>
        <p><strong>Project type:</strong> {lead.service || "Not specified"}</p>
        {lead.details && <p><strong>Project description:</strong> {lead.details}</p>}
      </details>
    </div>}
    <details className="lead-record-details"><summary>Consent evidence and history</summary>
      <p><strong>Service communication:</strong> {lead.consent ? "Requested" : "Not recorded"}</p>
      <p><strong>Marketing choices recorded:</strong> {lead.marketingConsentCapturedAt ? readableDate(lead.marketingConsentCapturedAt) : "Not recorded"}. <strong>Version:</strong> {lead.marketingConsentVersion || "Not recorded"}. <strong>Source:</strong> {lead.marketingConsentSource || "Not recorded"}.</p>
      <pre>{lead.marketingConsentText || "No historic disclosure stored."}</pre>
      <p>Legacy disclosure text is preserved as recorded. Records predating the audit do not have a complete change history.</p>
      <h4>Activity history</h4>
      <ul>{history.results.filter(event => event.lead_id === lead.id).map((event, index) => <li key={index}>{readableDate(event.created_at)} · {event.action.replaceAll("_", " ")} · {event.actor_id ? `Account ${event.actor_id}` : "Form / system"}{event.details && <small>{event.details}</small>}</li>)}</ul>
    </details>
    <RetentionControl lead={lead} />
    <div className="lead-data-removal"><h4>Permanent deletion</h4><LeadDeleteControl id={lead.id} name={lead.name} classification={lead.classification} retentionHold={lead.retentionHold} /></div>
  </article>;
  };

  return <main className="leads-shell">
    <header className="leads-header">
      <Link className="leads-brand" href="/leads" aria-label="Return to lead inbox"><img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" /></Link>
      <DashboardNav user={currentUser} />
    </header>
    <section className="leads-content retention-page" aria-labelledby="retention-title">
      <Link className="retention-back" href="/leads">← Back to leads</Link>
      <div className="leads-title-row"><div><h1 id="retention-title">Database Management</h1><p>Review records, track cleanup dates, and restore contacts removed from leads.</p></div><span className="leads-count">{leads.length} {leads.length === 1 ? "record" : "records"}</span></div>
      {attention.length > 0 && <p className="leads-review-notice">{reviewCount > 0 && `${reviewCount} ${reviewCount === 1 ? "record needs" : "records need"} classification. `}{dueCount > 0 && `${dueCount} ${dueCount === 1 ? "record is" : "records are"} near or past its retention date.`}</p>}
      <section className="retention-group" aria-labelledby="removed-leads-title"><h2 id="removed-leads-title">Removed from leads ({archived.length})</h2><p>These contacts are off the Leads page. Their records and history stay here until they are eligible for deletion. You can restore them.</p>
        {archived.length > 0 && <div className="retention-list">{archived.map(renderRecord)}</div>}
      </section>
      <section className="retention-group" aria-labelledby="current-leads-title"><h2 id="current-leads-title">Records in leads ({active.length})</h2>
        {active.length === 0 ? <div className="leads-empty"><p>No current leads to review.</p></div> : <div className="retention-list">{ordered.map(renderRecord)}</div>}
      </section>
      <details className="leads-help"><summary>How retention works</summary><p>Unconverted prospects become eligible for cleanup two years after their last meaningful business activity. Completed projects become eligible approximately seven years after completion. Active projects and records on hold are not automatically deleted.</p><p>Views, logins, exports, and preference changes do not reset retention. Last successful cleanup: {maintenance ? readableDate(maintenance.completed_at) : "not yet run"}. The scheduled check requires site access and may be paused while the site is private.</p><p>Cleanup removes personal data from the active database while preserving minimum marketing opt-out information. Copies already exported to Contacts or Joist and historical backups need separate handling.</p></details>
    </section>
  </main>;
}

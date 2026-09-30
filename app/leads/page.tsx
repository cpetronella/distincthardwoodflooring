import { desc, eq } from "drizzle-orm";
import { BellRing, ContactRound, MapPin, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLeadSession, isSuperadmin } from "../../lib/leads-auth";
import { LeadArchiveControl } from "./lead-archive";
import { LeadStatusControl } from "./lead-status";
import { MarketingPreferences } from "./marketing-preferences";
import { DashboardLoadingGate } from "./dashboard-loading";
import { NewLeadToast } from "./new-lead-toast";
import { DashboardNav } from "./dashboard-nav";
import { RefreshLeads } from "./refresh-leads";
import { normalizeContact, retentionAttention } from "../../lib/retention";
import { formatPhone } from "../../lib/phone";

export const dynamic = "force-dynamic";

function readableDate(value: string) {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(date);
}

function fullAddress(lead: { address: string; city: string; state: string; zipCode: string }) {
  return [lead.address, [lead.city, lead.state].filter(Boolean).join(", "), lead.zipCode].filter(Boolean).join(" ");
}

function currency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function normalizedStatus(status: string) {
  if (status === "estimate-complete" || status === "closed") return "estimate-complete";
  if (status === "missed-opportunity") return "missed-opportunity";
  return "new-business";
}

export default async function LeadsPage() {
  const currentUser = await getLeadSession();
  if (!currentUser) redirect("/leads/sign-in");
  const [{ getDb }, { estimates }] = await Promise.all([import("../../db"), import("../../db/schema")]);
  const leads = await getDb().select().from(estimates).where(eq(estimates.archivedAt, "")).orderBy(desc(estimates.createdAt));
  const {rawDb} = await import("../../lib/raw-db");
  const db=rawDb();
  const suppressions=await db.prepare("SELECT channel,contact,opted_out_at FROM marketing_suppressions").all<{channel:string;contact:string;opted_out_at:string}>();
  const suppressed=new Map(suppressions.results.map(row=>[row.channel+":"+normalizeContact(row.channel,row.contact),row.opted_out_at]));
  for(const lead of leads) {
    const email= suppressed.get("email:"+normalizeContact("email",lead.email));
    const phone= suppressed.get("phone:"+normalizeContact("phone",lead.phone));
    if(email){lead.emailMarketingConsent=false;lead.emailMarketingOptedOutAt=email;}
    if(phone){lead.phoneMarketingConsent=false;lead.phoneMarketingOptedOutAt=phone;}
  }
  const attention=leads.map(lead=>retentionAttention(lead)).filter(Boolean);
  const reviewCount=attention.filter(type=>type==="review").length;
  const dueCount=attention.filter(type=>type==="due").length;
  const statusCounts = leads.reduce((counts, lead) => {
    counts[normalizedStatus(lead.status)] += 1;
    return counts;
  }, { "new-business": 0, "estimate-complete": 0, "missed-opportunity": 0 });
  const previousLogin = Date.parse(currentUser.previousLoginAt);
  const currentLogin = Date.parse(currentUser.lastLoginAt);
  const newSinceLastLogin = Number.isFinite(previousLogin) && Number.isFinite(currentLogin)
    ? leads.filter(lead => {
        const received = Date.parse(lead.createdAt.includes("T") ? lead.createdAt : lead.createdAt.replace(" ", "T") + "Z");
        return Number.isFinite(received) && received > previousLogin && received <= currentLogin;
      }).length
    : 0;

  return <DashboardLoadingGate><main className="leads-shell">
    {newSinceLastLogin > 0 && <NewLeadToast count={newSinceLastLogin} accountId={currentUser.id} loginAt={currentUser.lastLoginAt} />}
    <header className="leads-header">
      <Link className="leads-brand" href="/" aria-label="Return to Distinct Hardwood Flooring"><img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" /></Link>
      <DashboardNav user={currentUser} />
    </header>
    <section className="leads-content" aria-labelledby="leads-title">
      {/* Keep one beta badge on the leads dashboard. */}
      <div className="leads-beta-strip" aria-label="Beta features"><span>BETA</span></div>
      <div className="leads-title-row"><div><h1 id="leads-title">Leads</h1><p>Open a request to see details and update it.</p></div><div className="leads-header-actions"><span className="leads-count">{leads.length} total</span><RefreshLeads /></div></div>
      {newSinceLastLogin > 0 && <div className="leads-new-notice" role="status"><BellRing aria-hidden="true" /><p><strong>{newSinceLastLogin} new {newSinceLastLogin === 1 ? "lead" : "leads"} since your last login.</strong> {newSinceLastLogin === 1 ? "The request" : "The requests"} arrived while you were away.</p></div>}
      <div className="leads-overview" aria-label="Lead status summary"><span><strong>{statusCounts["new-business"]}</strong> New business</span><span><strong>{statusCounts["estimate-complete"]}</strong> Estimate complete</span><span><strong>{statusCounts["missed-opportunity"]}</strong> Missed opportunity</span></div>
      {attention.length > 0 && isSuperadmin(currentUser) && <p className="leads-review-notice">{reviewCount > 0 && `${reviewCount} ${reviewCount===1?"record needs":"records need"} classification. `}{dueCount > 0 && `${dueCount} ${dueCount===1?"record is":"records are"} near or past its retention date. `}<Link href="/leads/retention">Review retention</Link></p>}
      {leads.length === 0 ? <div className="leads-empty"><h2>No requests yet</h2><p>New contact information, project type, and service addresses will appear here.</p></div> : <div className="leads-list" id="leads-list" tabIndex={-1}>
        {leads.map((lead) => {
          const serviceAddress = fullAddress(lead);
          const billingAddress = fullAddress({
            address: lead.billingAddress,
            city: lead.billingCity,
            state: lead.billingState,
            zipCode: lead.billingZipCode,
          });
          const mapsUrl = serviceAddress ? `https://maps.apple.com/?daddr=${encodeURIComponent(serviceAddress)}&dirflg=d` : "";
          const statusLabel = normalizedStatus(lead.status) === "estimate-complete" ? "Estimate complete" : normalizedStatus(lead.status) === "missed-opportunity" ? "Missed opportunity" : "New business";
          const customerTypeLabel = lead.customerType === "homeowner" ? "Homeowner" : lead.customerType === "contractor" ? "Contractor" : lead.customerType === "other" ? (lead.customerTypeOther ? `Other: ${lead.customerTypeOther}` : "Other") : "Not provided";
          const jobCity = [lead.city, lead.state].filter(Boolean).join(", ") || "Not provided";
          return <div className="lead-card-wrap" key={lead.id}><details className="lead-card">
            <summary className="lead-card-summary"><span className="lead-summary-identity"><strong>{lead.name}</strong><small className="lead-summary-project">Project type: {lead.service || "Not specified"}</small><span className="lead-summary-facts" aria-label="Lead summary details"><span className="lead-summary-fact"><span>Customer type</span><strong>{customerTypeLabel}</strong></span><span className="lead-summary-fact"><span>Job city</span><strong>{jobCity}</strong></span><span className="lead-summary-fact"><span>Date created</span><strong>{readableDate(lead.createdAt)}</strong></span></span></span><span className="lead-summary-status" data-status={normalizedStatus(lead.status)}>{statusLabel}</span><span className="lead-summary-expand">Details <span aria-hidden="true">⌄</span></span></summary>
            <div className="lead-card-body"><div className="lead-card-heading"><LeadStatusControl id={lead.id} initialStatus={lead.status} initialEstimateAmountCents={lead.estimateAmountCents} /></div>
            <div className="lead-information">
              <div className="lead-field"><span>Phone</span><a href={`tel:${lead.phone}`}>{formatPhone(lead.phone)}</a></div>
              {lead.email && <div className="lead-field"><span>Email</span><a href={`mailto:${lead.email}`}>{lead.email}</a></div>}
              {lead.customerType && <div className="lead-field"><span>Customer type</span><strong>{lead.customerType==="homeowner"?"Homeowner":lead.customerType==="contractor"?"Contractor":lead.customerTypeOther?`Other: ${lead.customerTypeOther}`:"Other"}</strong></div>}
              {lead.estimateAmountCents > 0 && <div className="lead-field"><span>Estimate price</span><strong>{currency(lead.estimateAmountCents)}</strong></div>}
            </div>
            <div className="lead-addresses">
              {mapsUrl ? <a className="lead-address-card" href={mapsUrl} target="_blank" rel="noreferrer" aria-label={`Open directions to ${serviceAddress} in Apple Maps`}><MapPin aria-hidden="true" /><span><small>Service address</small><strong>{serviceAddress}</strong><em>Open in Apple Maps <span aria-hidden="true">↗</span></em></span></a> : <div className="lead-address-card is-empty"><MapPin aria-hidden="true" /><span><small>Service address</small><strong>Not provided</strong></span></div>}
              {billingAddress && <div className="lead-address-card lead-billing-address"><MapPin aria-hidden="true" /><span><small>Billing address</small><strong>{billingAddress}</strong></span></div>}
            </div>
            {lead.details && <div className="lead-notes"><span>Project description</span><p>{lead.details}</p></div>}
            <div className="lead-card-footer"><div className="lead-actions"><a href={`tel:${lead.phone}`} className="leads-primary-button"><Phone aria-hidden="true" /> Call</a><a href={`sms:${lead.phone}`} className="leads-secondary-button"><MessageSquare aria-hidden="true" /> Text about estimate</a><a href={`/api/leads/contact-card?id=${lead.id}`} className="leads-secondary-button"><ContactRound aria-hidden="true" /> Save contact</a></div></div>
            <details className="lead-advanced"><summary>Marketing preferences</summary><div className="lead-advanced-content"><MarketingPreferences id={lead.id} emailActive={lead.emailMarketingConsent} phoneActive={lead.phoneMarketingConsent} emailOptedOutAt={lead.emailMarketingOptedOutAt} phoneOptedOutAt={lead.phoneMarketingOptedOutAt} capturedAt={lead.marketingConsentCapturedAt} /></div></details></div>
          </details><div className="lead-card-toolbar"><LeadArchiveControl id={lead.id} name={lead.name} icon /></div></div>;
        })}
      </div>}
    </section>
  </main></DashboardLoadingGate>;
}

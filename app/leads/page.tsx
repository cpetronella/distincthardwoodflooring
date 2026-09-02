import { desc } from "drizzle-orm";
import { BriefcaseBusiness, CircleX, ClipboardCheck, ContactRound, MapPin, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLeadSession } from "../../lib/leads-auth";
import { LeadDeleteControl } from "./lead-delete";
import { LeadStatusControl } from "./lead-status";
import { MarketingPreferences } from "./marketing-preferences";

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
  const leads = await getDb().select().from(estimates).orderBy(desc(estimates.createdAt));
  const statusCounts = leads.reduce((counts, lead) => {
    counts[normalizedStatus(lead.status)] += 1;
    return counts;
  }, { "new-business": 0, "estimate-complete": 0, "missed-opportunity": 0 });

  return <main className="leads-shell">
    <header className="leads-header">
      <Link className="leads-brand" href="/" aria-label="Return to Distinct Hardwood Flooring"><img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" /></Link>
      <div><p>{currentUser.displayName}</p><Link className="leads-text-button" href="/leads/security">Security</Link><form action="/api/leads/logout" method="post"><button type="submit" className="leads-text-button">Sign out</button></form></div>
    </header>
    <section className="leads-content" aria-labelledby="leads-title">
      <div className="leads-title-row"><div><p className="leads-eyebrow">Estimate requests</p><h1 id="leads-title">Lead inbox</h1><p>New requests from the website appear here.</p></div><span className="leads-count">{leads.length} {leads.length === 1 ? "lead" : "leads"}</span></div>
      <div className="leads-summary" aria-label="Lead status summary">
        <div><BriefcaseBusiness aria-hidden="true" /><span>New business</span><strong>{statusCounts["new-business"]}</strong></div>
        <div><ClipboardCheck aria-hidden="true" /><span>Estimate complete</span><strong>{statusCounts["estimate-complete"]}</strong></div>
        <div><CircleX aria-hidden="true" /><span>Missed opportunity</span><strong>{statusCounts["missed-opportunity"]}</strong></div>
      </div>
      {leads.length === 0 ? <div className="leads-empty"><h2>No requests yet</h2><p>When someone submits the estimate form, their contact information, project type, and service and billing addresses will appear here.</p></div> : <div className="leads-list">
        {leads.map((lead) => {
          const serviceAddress = fullAddress(lead);
          const billingAddress = fullAddress({
            address: lead.billingAddress || lead.address,
            city: lead.billingCity || lead.city,
            state: lead.billingState || lead.state,
            zipCode: lead.billingZipCode || lead.zipCode,
          });
          const mapsUrl = serviceAddress ? `https://maps.apple.com/?daddr=${encodeURIComponent(serviceAddress)}&dirflg=d` : "";
          const textPermission = lead.phoneMarketingConsent ? "Promotional text consent recorded" : lead.phoneMarketingOptedOutAt ? "Promotional texts opted out" : "No promotional text consent";
          return <article className="lead-card" key={lead.id}>
            <div className="lead-card-heading"><div><h2>{lead.name}</h2><p>Submitted {readableDate(lead.createdAt)}</p></div><LeadStatusControl id={lead.id} initialStatus={lead.status} initialEstimateAmountCents={lead.estimateAmountCents} /></div>
            <div className="lead-information">
              <div className="lead-field"><span>Phone</span><a href={`tel:${lead.phone}`}>{lead.phone}</a></div>
              <div className="lead-field"><span>Project type</span><strong>{lead.service || "Not specified"}</strong></div>
              {lead.email && <div className="lead-field"><span>Email</span><a href={`mailto:${lead.email}`}>{lead.email}</a></div>}
              {lead.estimateAmountCents > 0 && <div className="lead-field"><span>Estimate price</span><strong>{currency(lead.estimateAmountCents)}</strong></div>}
            </div>
            <div className="lead-addresses">
              {mapsUrl ? <a className="lead-address-card" href={mapsUrl} target="_blank" rel="noreferrer" aria-label={`Open directions to ${serviceAddress} in Apple Maps`}><MapPin aria-hidden="true" /><span><small>Service address</small><strong>{serviceAddress}</strong><em>Open in Apple Maps <span aria-hidden="true">↗</span></em></span></a> : <div className="lead-address-card is-empty"><MapPin aria-hidden="true" /><span><small>Service address</small><strong>Not provided</strong></span></div>}
              <div className="lead-address-card lead-billing-address"><MapPin aria-hidden="true" /><span><small>Billing address</small><strong>{billingAddress || "Not provided"}</strong></span></div>
            </div>
            <MarketingPreferences id={lead.id} emailActive={lead.emailMarketingConsent} phoneActive={lead.phoneMarketingConsent} emailOptedOutAt={lead.emailMarketingOptedOutAt} phoneOptedOutAt={lead.phoneMarketingOptedOutAt} capturedAt={lead.marketingConsentCapturedAt} />
            {lead.details && <div className="lead-notes"><span>Project notes</span><p>{lead.details}</p></div>}
            <div className="lead-card-footer"><div className="lead-actions"><a href={`tel:${lead.phone}`} className="leads-primary-button"><Phone aria-hidden="true" /> Call</a><div className="lead-project-text-action"><a href={`sms:${lead.phone}`} className="leads-secondary-button"><MessageSquare aria-hidden="true" /> Text about estimate</a><small>{textPermission}. Use this only for estimate or project communication.</small></div><div className="lead-joist-action"><a href={`/api/leads/contact-card?id=${lead.id}`} className="leads-secondary-button"><ContactRound aria-hidden="true" /> Save for Joist</a><small>Saves a contact card that Joist can sync.</small></div></div><LeadDeleteControl id={lead.id} name={lead.name} /></div>
          </article>;
        })}
      </div>}
    </section>
  </main>;
}

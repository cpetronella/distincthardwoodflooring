import Link from "next/link";
import { redirect } from "next/navigation";
import { hasLeadSession } from "../../../lib/leads-auth";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function LeadSetupPage() {
  if (await hasLeadSession()) redirect("/leads");

  return <main className="leads-shell leads-sign-in-shell">
    <Link className="leads-brand dashboard-login-brand" href="/" aria-label="Return to Distinct Hardwood Flooring"><img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" /></Link>
    <section className="leads-sign-in-card dashboard-setup-card" aria-labelledby="dashboard-setup-title">
      <p className="leads-eyebrow">Private dashboard setup</p>
      <h1 id="dashboard-setup-title">Create secure access</h1>
      <p>Create two equal dashboard accounts for the business. Each person chooses a separate username and password.</p>
      <SetupForm />
      <Link className="dashboard-return-link" href="/leads/sign-in">Return to sign in</Link>
    </section>
  </main>;
}

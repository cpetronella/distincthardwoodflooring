import Link from "next/link";
import { redirect } from "next/navigation";
import { hasLeadSession } from "../../../lib/leads-auth";
import { SignInForm } from "./sign-in-form";

export const dynamic = "force-dynamic";

export default async function LeadSignInPage() {
  if (await hasLeadSession()) redirect("/leads");

  return <main className="leads-shell leads-sign-in-shell">
    <Link className="leads-brand dashboard-login-brand" href="/" aria-label="Return to Distinct Hardwood Flooring"><img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" /></Link>
    <section className="leads-sign-in-card" aria-labelledby="lead-sign-in-title">
      <p className="leads-eyebrow">Distinct Hardwood Flooring</p>
      <h1 id="lead-sign-in-title">Lead inbox</h1>
      <p>Private access for Distinct Hardwood Flooring, Inc. Sign in with your individual dashboard account.</p>
      <SignInForm />
      <Link className="dashboard-return-link" href="/leads/setup">First time? Set up the two dashboard accounts.</Link>
    </section>
  </main>;
}

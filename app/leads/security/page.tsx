import Link from "next/link";
import { redirect } from "next/navigation";
import { getLeadSession } from "../../../lib/leads-auth";
import { PasswordForm } from "./password-form";

export const dynamic = "force-dynamic";

export default async function DashboardSecurityPage() {
  const user = await getLeadSession();
  if (!user) redirect("/leads/sign-in");

  return <main className="leads-shell leads-sign-in-shell">
    <Link className="leads-brand dashboard-login-brand" href="/leads" aria-label="Return to lead inbox"><img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" /></Link>
    <section className="leads-sign-in-card" aria-labelledby="dashboard-security-title">
      <p className="leads-eyebrow">Signed in as {user.displayName}</p>
      <h1 id="dashboard-security-title">Security</h1>
      <p>Change only your own password. Each dashboard account has the same access to leads.</p>
      <PasswordForm />
      <Link className="dashboard-return-link" href="/leads">Return to lead inbox</Link>
    </section>
  </main>;
}

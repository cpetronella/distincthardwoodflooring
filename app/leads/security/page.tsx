import { redirect } from "next/navigation";
import { getLeadSession } from "../../../lib/leads-auth";
import { PasswordForm } from "./password-form";
import Link from "next/link";
import { DashboardNav } from "../dashboard-nav";

export const dynamic = "force-dynamic";

export default async function DashboardSecurityPage() {
  const user = await getLeadSession();
  if (!user) redirect("/leads/sign-in");

  return <main className="leads-shell">
    <header className="leads-header">
      <Link className="leads-brand" href="/leads" aria-label="Return to lead inbox"><img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" /></Link>
      <DashboardNav user={user} />
    </header>
    <section className="leads-content dashboard-password-content" aria-labelledby="dashboard-security-title">
      <div className="leads-title-row"><div><h1 id="dashboard-security-title">Change password</h1><p>Update your dashboard password.</p></div></div>
      <div className="leads-sign-in-card">
      <p>Change only your own password. Both accounts can manage leads. Database Management is reserved for the superadmin.</p>
      <PasswordForm />
      <Link className="dashboard-return-link" href="/leads">Return to leads</Link>
      </div>
    </section>
  </main>;
}

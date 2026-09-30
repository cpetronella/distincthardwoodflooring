import Link from "next/link";
import { LockKeyhole, Menu, X } from "lucide-react";
import { SignOutButton } from "./sign-out-button";
import type { DashboardUser } from "../../lib/leads-auth";
import { getLeadSessionExpiresAt, isSuperadmin } from "../../lib/leads-auth";
import { SessionTimeout } from "./session-timeout";

export async function DashboardNav({ user }: { user: DashboardUser }) {
  const expiresAt = await getLeadSessionExpiresAt();
  return <nav className="leads-header-nav" aria-label="Dashboard navigation">
    <SessionTimeout expiresAt={expiresAt} />
    <details className="leads-dashboard-menu">
      <summary aria-label="Open dashboard menu"><Menu className="menu-icon" aria-hidden="true" /><X className="close-icon" aria-hidden="true" /><span className="dashboard-menu-label">Menu</span></summary>
      <div className="leads-dashboard-menu-panel">
        <p>{user.displayName}</p>
        <Link href="/leads">Leads</Link>
        {isSuperadmin(user) ? <Link href="/leads/retention">Database Management</Link> :
          <span className="dashboard-menu-locked" aria-label="Database Management. Only superadmins can view this page."><span><LockKeyhole size={18} aria-hidden="true" />Database Management</span><small>Only superadmins can view this page</small></span>}
        <Link href="/leads/security">Change password</Link>
        <SignOutButton />
      </div>
    </details>
  </nav>;
}

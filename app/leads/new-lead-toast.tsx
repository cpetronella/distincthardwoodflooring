"use client";

import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";

export function NewLeadToast({ count, accountId, loginAt }: { count: number; accountId: number; loginAt: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (count < 1) return;
    const key = `distinct-new-leads:${accountId}:${loginAt}`;
    const showTimer = window.setTimeout(() => {
      try {
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, "shown");
      } catch { /* The notice remains available when storage is disabled. */ }
      setVisible(true);
    }, 0);
    const timer = window.setTimeout(() => setVisible(false), 9000);
    return () => { window.clearTimeout(showTimer); window.clearTimeout(timer); };
  }, [count, accountId, loginAt]);

  if (!visible) return null;

  return <div className="leads-notification-toast" role="group" aria-label="New lead notification">
    <BellRing aria-hidden="true" />
    <div><strong>{count} new {count === 1 ? "lead" : "leads"}</strong><span>Since your last login</span>
      <button type="button" onClick={() => {
        setVisible(false);
        document.getElementById("leads-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}>View leads</button>
    </div>
    <button className="leads-notification-dismiss" type="button" aria-label="Dismiss notification" onClick={() => setVisible(false)}><X aria-hidden="true" /></button>
  </div>;
}

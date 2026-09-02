"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Channel = "email" | "phone";

function PreferenceRow({ id, channel, label, active, optedOutAt }: { id: number; channel: Channel; label: string; active: boolean; optedOutAt: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const status = active ? "Subscribed" : optedOutAt ? "Unsubscribed" : "Not subscribed";

  async function unsubscribe() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/leads/marketing-consent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, channel }),
      });
      if (!response.ok) throw new Error("Unable to save");
      router.refresh();
    } catch {
      setError("Not saved. Please try again.");
      setSaving(false);
    }
  }

  return <div className="marketing-preference-row">
    <div><strong>{label}</strong><span className={`marketing-status ${active ? "is-subscribed" : ""}`}>{status}</span></div>
    {active && <button type="button" onClick={unsubscribe} disabled={saving}>{saving ? "Saving…" : "Mark unsubscribed"}</button>}
    <span className="marketing-preference-message" aria-live="polite">{error}</span>
  </div>;
}

export function MarketingPreferences({ id, emailActive, phoneActive, emailOptedOutAt, phoneOptedOutAt, capturedAt }: { id: number; emailActive: boolean; phoneActive: boolean; emailOptedOutAt: string; phoneOptedOutAt: string; capturedAt: string }) {
  return <section className="lead-marketing-preferences" aria-labelledby={`marketing-title-${id}`}>
    <div className="lead-marketing-heading"><h3 id={`marketing-title-${id}`}>Marketing permissions</h3>{capturedAt && <span>Choices recorded with request</span>}</div>
    <PreferenceRow id={id} channel="email" label="Promotional email" active={emailActive} optedOutAt={emailOptedOutAt} />
    <PreferenceRow id={id} channel="phone" label="Promotional text messages" active={phoneActive} optedOutAt={phoneOptedOutAt} />
  </section>;
}

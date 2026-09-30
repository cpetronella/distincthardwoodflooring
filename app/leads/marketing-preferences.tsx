"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Channel = "email" | "phone";

function PreferenceRow({ id, channel, label, active, optedOutAt }: { id: number; channel: Channel; label: string; active: boolean; optedOutAt: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmedRequest, setConfirmedRequest] = useState(false);
  const status = active ? "Subscribed" : optedOutAt ? "Unsubscribed" : "Not subscribed";

  async function unsubscribe() {
    if (!confirmedRequest || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/leads/marketing-consent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, channel }),
      });
      if (!response.ok) throw new Error("Unable to save");
      setConfirmOpen(false);
      setConfirmedRequest(false);
      router.refresh();
    } catch {
      setError("Not saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="marketing-preference-row">
    <div><strong>{label}</strong><span className={`marketing-status ${active ? "is-subscribed" : ""}`}>{status}</span></div>
    {!optedOutAt && !confirmOpen && <button type="button" onClick={() => { setError(""); setConfirmOpen(true); }}>Record opt-out</button>}
    {!optedOutAt && confirmOpen && <div className="marketing-optout-confirm" role="group" aria-label={`Confirm ${label.toLowerCase()} opt-out`}>
      <p>This stops future promotional {channel === "email" ? "emails" : "texts"} to this contact. Continue only if the customer requested it.</p>
      <label><input type="checkbox" checked={confirmedRequest} onChange={event => setConfirmedRequest(event.target.checked)} disabled={saving} /> The customer asked to opt out</label>
      <div><button type="button" onClick={unsubscribe} disabled={!confirmedRequest || saving}>{saving ? "Saving…" : "Confirm opt-out"}</button><button type="button" onClick={() => { setConfirmOpen(false); setConfirmedRequest(false); setError(""); }} disabled={saving}>Cancel</button></div>
    </div>}
    {optedOutAt && <small>Opted out: {new Date(optedOutAt).toLocaleDateString("en-US")}</small>}
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

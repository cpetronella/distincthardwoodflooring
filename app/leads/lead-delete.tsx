"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export function LeadDeleteControl({ id, name, classification, retentionHold }: { id: number; name: string; classification: string; retentionHold: boolean }) {
  const [reason, setReason] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const protectedRecord = retentionHold || classification === "active-project" || classification === "review-required";

  async function remove() {
    if (typedName !== name) { setError("Name did not match. No data was removed."); return; }
    if (!window.confirm(`Permanently remove ${name}'s personal data from the dashboard? This cannot be undone. Detailed consent and project history will no longer be available here.`)) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch("/api/leads/contact", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, confirm: true, confirmationName: typedName, reviewed, reason }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to delete this contact.");
      window.location.reload();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete this contact.");
      setDeleting(false);
    }
  }

  return <details className="lead-removal-review">
    <summary><Trash2 aria-hidden="true" /><span>Permanently delete personal data</span></summary>
    {protectedRecord ? <p className="lead-removal-unavailable">{retentionHold ? "This record has a retention hold. Review the hold before deleting personal data." : classification === "active-project" ? "This project is still active. Review what must be kept when the project closes." : "Classify this record before permanently deleting it."} {!retentionHold && "If this contact is still on the Leads page, you can remove it from that list there."}</p> : <>
    <p>Use this for a verified customer request or a record created in error. Check what must be kept first. This cannot be undone: the contact, project details, and consent history will be deleted here. A minimal deletion log and marketing opt-outs remain. Exports and backups need separate handling.</p>
    <div className="lead-removal-fields">
      <label htmlFor={`removal-reason-${id}`}>Reason for removal
        <select id={`removal-reason-${id}`} value={reason} onChange={event => setReason(event.target.value)} disabled={deleting}>
          <option value="">Choose a reason</option>
          <option value="customer-request">Verified customer request</option>
          <option value="created-in-error">Record created in error</option>
          <option value="other-reviewed-need">Other reviewed need</option>
        </select>
      </label>
      <label className="lead-removal-check"><input type="checkbox" checked={reviewed} onChange={event => setReviewed(event.target.checked)} disabled={deleting} /> I checked outstanding work and records that may need to be retained.</label>
      <label htmlFor={`removal-name-${id}`}>Type {name} to confirm
        <input id={`removal-name-${id}`} type="text" value={typedName} onChange={event => setTypedName(event.target.value)} autoComplete="off" disabled={deleting} />
      </label>
      <button type="button" onClick={remove} disabled={deleting || !reason || !reviewed || typedName !== name}>{deleting ? "Removing…" : "Permanently remove personal data"}</button>
      <span role="status" aria-live="polite">{error}</span>
    </div>
    </>}
  </details>;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusLabels = {
  "new-business": "New business",
  "estimate-complete": "Estimate complete",
  "missed-opportunity": "Missed opportunity",
} as const;

type LeadStatus = keyof typeof statusLabels;

function normalizeStatus(status: string): LeadStatus {
  if (status === "estimate-complete" || status === "closed") return "estimate-complete";
  if (status === "missed-opportunity") return "missed-opportunity";
  return "new-business";
}

export function LeadStatusControl({ id, initialStatus, initialEstimateAmountCents }: { id: number; initialStatus: string; initialEstimateAmountCents: number }) {
  const router = useRouter();
  const normalizedInitialStatus = normalizeStatus(initialStatus);
  const [status, setStatus] = useState<LeadStatus>(normalizedInitialStatus);
  const [savedStatus, setSavedStatus] = useState<LeadStatus>(normalizedInitialStatus);
  const [estimateAmount, setEstimateAmount] = useState(initialEstimateAmountCents > 0 ? (initialEstimateAmountCents / 100).toFixed(2) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveStatus(nextStatus: LeadStatus, amount?: number) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/leads/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus, estimateAmount: amount }),
      });
      if (!response.ok) throw new Error("Unable to save");
      setSavedStatus(nextStatus);
      router.refresh();
    } catch {
      setStatus(savedStatus);
      setError("Not saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function changeStatus(nextStatus: LeadStatus) {
    setStatus(nextStatus);
    setError("");
    if (nextStatus !== "estimate-complete") void saveStatus(nextStatus);
  }

  function saveCompletedEstimate() {
    const amount = Number(estimateAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter the completed estimate amount.");
      return;
    }
    void saveStatus("estimate-complete", amount);
  }

  return (
    <div className="lead-status-control" data-status={status}>
      <label htmlFor={`lead-status-${id}`}>Status</label>
      <select id={`lead-status-${id}`} value={status} onChange={(event) => changeStatus(event.target.value as LeadStatus)} disabled={saving}>
        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {status === "estimate-complete" && <div className="lead-estimate-amount">
        <label htmlFor={`estimate-amount-${id}`}>Estimate price</label>
        <div className="lead-currency-input"><span aria-hidden="true">$</span><input id={`estimate-amount-${id}`} type="number" min="0.01" step="0.01" inputMode="decimal" value={estimateAmount} onChange={(event) => setEstimateAmount(event.target.value)} disabled={saving} required /></div>
        <button type="button" onClick={saveCompletedEstimate} disabled={saving}>Save completed estimate</button>
      </div>}
      <span className="lead-status-message" aria-live="polite">{saving ? "Saving…" : error}</span>
    </div>
  );
}

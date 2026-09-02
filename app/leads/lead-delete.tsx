"use client";

import { useState } from "react";

export function LeadDeleteControl({ id, name }: { id: number; name: string }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deleteLead() {
    if (!window.confirm(`Delete ${name}'s contact and project details? Any existing marketing opt-out record will be kept so it continues to be honored. This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch("/api/leads/contact", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Unable to delete");
      window.location.reload();
    } catch {
      setError("Not deleted. Please try again.");
      setDeleting(false);
    }
  }

  return <div className="lead-delete-control">
    <button type="button" onClick={deleteLead} disabled={deleting}>{deleting ? "Deleting…" : "Delete contact"}</button>
    <span aria-live="polite">{error}</span>
  </div>;
}

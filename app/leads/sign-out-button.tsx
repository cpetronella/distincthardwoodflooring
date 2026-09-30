"use client";

import { useState } from "react";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/leads/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Sign-out failed");
      window.location.replace("/leads/sign-in");
    } catch {
      setError("Unable to sign out. Please try again.");
      setBusy(false);
    }
  }

  return <div className="dashboard-sign-out">
    <button type="button" onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button>
    {error && <span role="alert">{error}</span>}
  </div>;
}

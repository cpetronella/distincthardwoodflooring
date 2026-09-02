"use client";

import { FormEvent, useState } from "react";

export function SignInForm() {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const startedAt = Date.now();
    try {
      const response = await fetch("/api/leads/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.get("username"), password: formData.get("password") }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to sign in");
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, 850 - (Date.now() - startedAt))));
      window.location.assign("/leads");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
      setSending(false);
    }
  }

  return <form className="leads-sign-in-form" onSubmit={submit} aria-busy={sending}>
    {sending && <div className="dashboard-login-loading" role="status" aria-live="polite">
      <img src="/distinct-logo.jpg" alt="" />
      <div>
        <strong>Opening your lead inbox</strong>
        <span>Securing your dashboard session…</span>
      </div>
      <span className="dashboard-login-loading-bar" aria-hidden="true"><span /></span>
    </div>}
    <label htmlFor="lead-username">Username or email</label>
    <input id="lead-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck="false" required />
    <label htmlFor="lead-password">Password</label>
    <input id="lead-password" name="password" type="password" autoComplete="current-password" required />
    <button type="submit" className="leads-primary-button" disabled={sending}>{sending ? "Opening inbox…" : "Open lead inbox"}</button>
    <p className="leads-form-message" aria-live="polite">{error}</p>
  </form>;
}

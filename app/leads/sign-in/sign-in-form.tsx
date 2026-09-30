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
    try {
      const response = await fetch("/api/leads/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.get("username"), password: formData.get("password") }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to sign in");
      window.location.assign("/leads");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
      setSending(false);
    }
  }

  return <form className="leads-sign-in-form" onSubmit={submit} aria-busy={sending}>
    <label htmlFor="lead-username">Username or email</label>
    <input id="lead-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck="false" required />
    <label htmlFor="lead-password">Password</label>
    <input id="lead-password" name="password" type="password" autoComplete="current-password" required />
    <button type="submit" className="leads-primary-button" disabled={sending}>{sending ? "Signing in…" : "Open lead inbox"}</button>
    <p className="leads-form-message" aria-live="polite">{error}</p>
  </form>;
}

"use client";

import { FormEvent, useState } from "react";

export function PasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("newPassword") || "");
    if (newPassword !== formData.get("newPasswordConfirm")) {
      setError("Your new password and confirmation do not match.");
      return;
    }
    setSending(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/leads/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: formData.get("currentPassword"), newPassword }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to update your password.");
      event.currentTarget.reset();
      setMessage("Password updated. Other open sessions for this account have been signed out.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update your password.");
    } finally {
      setSending(false);
    }
  }

  return <form className="leads-sign-in-form" onSubmit={submit}>
    <label htmlFor="current-password">Current password</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required />
    <label htmlFor="new-password">New password</label><input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={14} required />
    <label htmlFor="new-password-confirm">Confirm new password</label><input id="new-password-confirm" name="newPasswordConfirm" type="password" autoComplete="new-password" minLength={14} required />
    <p className="leads-security-note">Use a unique password with at least 14 characters that does not include your username.</p>
    <button type="submit" className="leads-primary-button" disabled={sending}>{sending ? "Updating password…" : "Update password"}</button>
    <p className="leads-form-message" aria-live="polite">{error || message}</p>
  </form>;
}

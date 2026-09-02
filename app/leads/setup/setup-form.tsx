"use client";

import { FormEvent, useState } from "react";

export function SetupForm() {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const firstPassword = String(formData.get("firstPassword") || "");
    const secondPassword = String(formData.get("secondPassword") || "");
    if (firstPassword !== formData.get("firstPasswordConfirm") || secondPassword !== formData.get("secondPasswordConfirm")) {
      setError("Make sure each password matches its confirmation.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/leads/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupCode: formData.get("setupCode"),
          accounts: [
            { displayName: formData.get("firstName"), username: formData.get("firstUsername"), password: firstPassword },
            { displayName: formData.get("secondName"), username: formData.get("secondUsername"), password: secondPassword },
          ],
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to set up access");
      window.location.assign("/leads");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to set up access. Please try again.");
      setSending(false);
    }
  }

  return <form className="leads-sign-in-form dashboard-setup-form" onSubmit={submit}>
    <label htmlFor="setup-code">One-time setup code</label>
    <input id="setup-code" name="setupCode" type="password" autoComplete="one-time-code" required />
    <p className="leads-security-note">This code works only for this first-time setup. After both accounts are created, it cannot be used to sign in.</p>

    <fieldset className="dashboard-account-fields">
      <legend>First account</legend>
      <label htmlFor="first-name">Display name</label><input id="first-name" name="firstName" autoComplete="name" required />
      <label htmlFor="first-username">Username or email</label><input id="first-username" name="firstUsername" autoComplete="username" autoCapitalize="none" spellCheck="false" required />
      <label htmlFor="first-password">Password</label><input id="first-password" name="firstPassword" type="password" autoComplete="new-password" minLength={14} required />
      <label htmlFor="first-password-confirm">Confirm password</label><input id="first-password-confirm" name="firstPasswordConfirm" type="password" autoComplete="new-password" minLength={14} required />
    </fieldset>

    <fieldset className="dashboard-account-fields">
      <legend>Second account</legend>
      <label htmlFor="second-name">Display name</label><input id="second-name" name="secondName" autoComplete="name" required />
      <label htmlFor="second-username">Username or email</label><input id="second-username" name="secondUsername" autoComplete="username" autoCapitalize="none" spellCheck="false" required />
      <label htmlFor="second-password">Password</label><input id="second-password" name="secondPassword" type="password" autoComplete="new-password" minLength={14} required />
      <label htmlFor="second-password-confirm">Confirm password</label><input id="second-password-confirm" name="secondPasswordConfirm" type="password" autoComplete="new-password" minLength={14} required />
    </fieldset>

    <p className="leads-security-note">Use different usernames or email addresses and unique passwords with at least 14 characters. A long passphrase is a great choice. Both accounts will have the same access.</p>
    <button type="submit" className="leads-primary-button" disabled={sending}>{sending ? "Creating accounts…" : "Create both accounts"}</button>
    <p className="leads-form-message" aria-live="polite">{error}</p>
  </form>;
}

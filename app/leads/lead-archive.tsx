"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function LeadArchiveControl({ id, name, archived = false, icon = false }: { id: number; name: string; archived?: boolean; icon?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  async function update(removalNote = "") {
    if (!archived && (removalNote.trim().length < 5 || removalNote.trim().length > 500)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/leads/archive", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, archived: !archived, ...(archived ? {} : { note: removalNote.trim() }) }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to update this contact.");
      dialogRef.current?.close();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update this contact.");
    } finally {
      setBusy(false);
    }
  }

  function submitRemoval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void update(note);
  }

  return <div className={`lead-archive-control${icon ? " is-icon" : ""}`}>
    <button type="button" onClick={() => { if (archived) void update(); else { setMessage(""); dialogRef.current?.showModal(); } }} disabled={busy} aria-label={icon ? `Remove ${name} from leads` : undefined} title={icon ? "Remove from leads" : undefined}>
      {icon ? <Trash2 aria-hidden="true" /> : busy ? "Saving…" : archived ? "Restore to leads" : "Remove from leads"}
    </button>
    {!archived && !icon && <p>This clears the lead list. The record stays in Database Management and can be restored by a superadmin.</p>}
    {archived && <span role="status" aria-live="polite">{message}</span>}
    {!archived && <dialog ref={dialogRef} className="lead-archive-dialog" aria-labelledby={`lead-archive-title-${id}`} onClose={() => { setNote(""); setMessage(""); }} onCancel={event => { if (busy) event.preventDefault(); }}>
      <form onSubmit={submitRemoval}>
        <h2 id={`lead-archive-title-${id}`}>Remove {name} from leads?</h2>
        <p>This removes the contact from the Leads page. The record stays in Database Management, where a superadmin can restore it.</p>
        <label htmlFor={`lead-archive-note-${id}`}>Why are you removing this lead? <span aria-hidden="true">*</span></label>
        <textarea id={`lead-archive-note-${id}`} required minLength={5} maxLength={500} rows={4} value={note} onChange={event => setNote(event.target.value)} disabled={busy} placeholder="For example, duplicate request or no longer pursuing an estimate" />
        <small>{note.length}/500 characters. At least 5 required. This note will appear in Database Management.</small>
        {message && <p className="lead-archive-error" role="alert">{message}</p>}
        <div className="lead-archive-dialog-actions"><button type="button" onClick={() => dialogRef.current?.close()} disabled={busy}>Cancel</button><button type="submit" disabled={busy || note.trim().length < 5}>{busy ? "Removing…" : "Remove from leads"}</button></div>
      </form>
    </dialog>}
  </div>;
}

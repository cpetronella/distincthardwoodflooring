"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshLeads() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return <button
    type="button"
    className="leads-refresh-button"
    aria-label="Refresh leads"
    aria-busy={isPending}
    disabled={isPending}
    onClick={() => startTransition(() => router.refresh())}
  >
    <RefreshCw aria-hidden="true" className={isPending ? "is-spinning" : undefined} />
    {isPending ? "Refreshing" : "Refresh"}
  </button>;
}

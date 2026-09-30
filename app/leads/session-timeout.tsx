"use client";

import { useEffect } from "react";

export function SessionTimeout({ expiresAt }: { expiresAt: number }) {
  useEffect(() => {
    const checkExpiry = () => {
      if (Date.now() >= expiresAt) window.location.replace("/leads/sign-in");
    };
    checkExpiry();
    const remaining = Math.max(0, expiresAt - Date.now());
    const timer = window.setTimeout(checkExpiry, remaining);
    window.addEventListener("pageshow", checkExpiry);
    document.addEventListener("visibilitychange", checkExpiry);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", checkExpiry);
      document.removeEventListener("visibilitychange", checkExpiry);
    };
  }, [expiresAt]);

  return null;
}

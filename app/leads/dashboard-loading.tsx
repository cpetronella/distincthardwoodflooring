"use client";

import { useEffect, useState, type ReactNode } from "react";

function LoadingScreen() {
  return <main className="dashboard-entry-loading" role="status" aria-live="polite" aria-label="Opening your lead inbox">
    <div className="dashboard-entry-loading-content">
      <img src="/distinct-logo.jpg" alt="Distinct Hardwood Flooring" />
      <span className="dashboard-entry-spinner" aria-hidden="true" />
      <h1>Opening your lead inbox</h1>
      <p>Getting your dashboard ready…</p>
      <span className="dashboard-entry-progress" aria-hidden="true"><span /></span>
    </div>
  </main>;
}

export function DashboardLoadingGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const showDashboard = () => {
      setReady(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setReady(true), 1400);
    };

    showDashboard();
    window.addEventListener("pageshow", showDashboard);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", showDashboard);
    };
  }, []);

  return ready ? children : <LoadingScreen />;
}

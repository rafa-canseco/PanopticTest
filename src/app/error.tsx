"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard render failed:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-xl border border-line bg-surface p-6">
        <h1 className="text-lg font-bold text-ink">Dashboard failed to render</h1>
        <p className="mt-2 text-sm text-muted">
          The points engine or UI threw while computing this view.
        </p>
        <pre className="mt-3 overflow-x-auto bg-bg p-3 font-mono text-xs text-foreground">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
        <p className="mt-3 text-xs text-muted">
          Most often caused by malformed entries in <code className="font-mono">src/data/</code>.
          Fix the offending record and reload, or click retry below.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 inline-flex items-center border border-brand-light bg-brand px-3 py-1.5 text-sm font-medium text-ink hover:border-brand-light hover:bg-brand-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

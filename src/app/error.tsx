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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="max-w-xl rounded-lg border border-rose-200 bg-white p-6 dark:border-rose-900/40 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-rose-700 dark:text-rose-400">
          Dashboard failed to render
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          The points engine or UI threw while computing this view.
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
          Most often caused by malformed entries in <code className="font-mono">src/data/</code>.
          Fix the offending record and reload, or click retry below.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 inline-flex items-center rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

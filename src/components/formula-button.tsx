"use client";

import { useEffect, useRef } from "react";

import { ArcMark } from "@/components/arc-mark";
import { FormulaCard } from "@/components/formula-card";

export function FormulaButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function open(): void {
    const dlg = dialogRef.current;
    if (!dlg || dlg.open) return;
    try {
      dlg.showModal();
    } catch (err) {
      // showModal throws InvalidStateError if already open or NotSupportedError
      // on legacy browsers. Surface the failure and fall back to non-modal show
      // so the user still gets the formula content.
      console.error("Formula dialog failed to open modally:", err);
      dlg.show?.();
    }
  }
  function close(): void {
    dialogRef.current?.close();
  }

  // Close when the backdrop is clicked (target === dialog itself).
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    function handleClick(e: MouseEvent): void {
      // dlg is the captured non-null ref from the outer closure; the optional
      // chaining is for TS's narrowing purposes only (it can't follow the
      // closure's `if (!dlg) return;` guard into the inner function).
      if (e.target === dlg) dlg?.close();
    }
    dlg.addEventListener("click", handleClick);
    return () => dlg.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="View the points formula"
        className="group inline-flex items-center gap-2 self-start border border-brand-light/40 bg-brand-soft px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-light transition-colors hover:border-brand-light/80 hover:bg-brand/35 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
      >
        <ArcMark size={14} variant="primary" className="shrink-0" />
        <span>The formula</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="The exact formula"
        className="formula-dialog backdrop:bg-bg/85 m-auto max-w-2xl border border-brand/40 bg-surface p-0 text-foreground shadow-[0_24px_60px_rgba(78,20,208,0.25)]"
      >
        <div className="relative">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center font-mono text-base text-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            ×
          </button>
          <FormulaCard />
        </div>
      </dialog>
    </>
  );
}

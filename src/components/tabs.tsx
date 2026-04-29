"use client";

import { useId, type KeyboardEvent, type ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  panel: ReactNode;
}

interface TabsProps {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  const baseId = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const idx = tabs.findIndex((t) => t.id === active);
    if (idx === -1) return;
    let next = idx;
    if (event.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
    else if (event.key === "ArrowRight") next = (idx + 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    onChange(tabs[next].id);
    requestAnimationFrame(() => {
      document.getElementById(`${baseId}-tab-${tabs[next].id}`)?.focus();
    });
  }

  return (
    <div>
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        data-tour="tabs"
        className="flex gap-1 border-b border-line"
      >
        {tabs.map((t, i) => {
          const selected = t.id === active;
          const indexLabel = String(i + 1).padStart(2, "0");
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              id={`${baseId}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.id)}
              className={
                "group -mb-px flex items-baseline gap-2 border-b-2 px-2 py-3 text-sm font-medium uppercase tracking-[0.16em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light sm:px-4 " +
                (selected
                  ? "border-brand-light text-ink"
                  : "border-transparent text-muted hover:text-foreground")
              }
            >
              <span
                className={
                  "font-mono text-[10px] tracking-normal " +
                  (selected ? "text-brand-light" : "text-line")
                }
              >
                {indexLabel}
              </span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
      {tabs.map((t) => {
        if (t.id !== active) return null;
        return (
          <div
            key={t.id}
            role="tabpanel"
            id={`${baseId}-panel-${t.id}`}
            aria-labelledby={`${baseId}-tab-${t.id}`}
            className="pt-8"
          >
            {t.panel}
          </div>
        );
      })}
    </div>
  );
}

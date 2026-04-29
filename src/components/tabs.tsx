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
        className="flex gap-1 border-b border-line"
      >
        {tabs.map((t) => {
          const selected = t.id === active;
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
                "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light " +
                (selected
                  ? "border-brand-light text-ink"
                  : "border-transparent text-muted hover:text-foreground")
              }
            >
              {t.label}
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
            className="pt-6"
          >
            {t.panel}
          </div>
        );
      })}
    </div>
  );
}

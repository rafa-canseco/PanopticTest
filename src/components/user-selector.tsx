import type { User } from "@/lib/types";

interface UserSelectorProps {
  users: User[];
  selectedUserId: string;
  onSelect: (userId: string) => void;
}

export function UserSelector({ users, selectedUserId, onSelect }: UserSelectorProps) {
  return (
    <section
      className="flex flex-col gap-3 border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
      aria-label="Inspect user"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        Inspect user
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Select user to inspect">
        {users.map((u, i) => {
          const selected = u.id === selectedUserId;
          const idx = String(i + 1).padStart(2, "0");
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelect(u.id)}
              aria-pressed={selected}
              className={
                "group inline-flex items-baseline gap-2 border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light " +
                (selected
                  ? "border-brand bg-brand text-ink"
                  : "border-line bg-elevated/60 text-foreground hover:border-brand/40 hover:bg-elevated")
              }
            >
              <span
                className={
                  "font-mono text-[10px] tabular-nums " +
                  (selected ? "text-ink/70" : "text-muted")
                }
              >
                {idx}
              </span>
              <span>{u.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

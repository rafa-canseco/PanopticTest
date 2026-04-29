import type { User } from "@/lib/types";

interface UserSelectorProps {
  users: User[];
  selectedUserId: string;
  onSelect: (userId: string) => void;
}

export function UserSelector({ users, selectedUserId, onSelect }: UserSelectorProps) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        Inspect user
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Select user to inspect">
        {users.map((u) => {
          const selected = u.id === selectedUserId;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelect(u.id)}
              aria-pressed={selected}
              className={
                "rounded-full px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light " +
                (selected
                  ? "bg-brand text-ink"
                  : "bg-elevated text-foreground hover:bg-elevated/80")
              }
            >
              {u.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

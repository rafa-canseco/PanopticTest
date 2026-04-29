import type { User } from "@/lib/types";

interface UserSelectorProps {
  users: User[];
  selectedUserId: string;
  onSelect: (userId: string) => void;
}

export function UserSelector({ users, selectedUserId, onSelect }: UserSelectorProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
                "rounded-full px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 " +
                (selected
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700")
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

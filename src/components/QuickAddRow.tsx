import { useState } from "react";
import { Plus } from "lucide-react";
import { createTask, type NewTaskInput } from "../db/actions";

export function QuickAddRow({ defaults }: { defaults: Partial<NewTaskInput> }) {
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(false);

  async function submit() {
    const value = title.trim();
    if (!value) {
      setActive(false);
      return;
    }
    await createTask({ title: value, ...defaults });
    setTitle("");
  }

  return (
    <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-2.5 dark:border-white/[0.06]">
      <Plus size={16} className="shrink-0 text-neutral-400" />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setActive(true)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setTitle("");
            e.currentTarget.blur();
          }
        }}
        placeholder="New To-Do…"
        className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-neutral-400"
      />
      {active && title && (
        <span className="text-[11px] text-neutral-400">Enter to add</span>
      )}
    </div>
  );
}

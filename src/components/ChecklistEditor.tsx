import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Task } from "../db/types";
import { addChecklistItem, removeChecklistItem, toggleChecklistItem } from "../db/actions";

export function ChecklistEditor({ task }: { task: Task }) {
  const [draft, setDraft] = useState("");

  async function submit() {
    const title = draft.trim();
    if (!title) return;
    await addChecklistItem(task.id, title);
    setDraft("");
  }

  return (
    <div className="mt-1.5 space-y-0.5">
      {task.checklist.map((item) => (
        <div key={item.id} className="group flex items-center gap-2 py-0.5">
          <button
            onClick={() => toggleChecklistItem(task.id, item.id)}
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
              item.completed
                ? "border-emerald-500 bg-emerald-500"
                : "border-neutral-400 dark:border-neutral-500"
            }`}
          >
            {item.completed && <span className="block h-1.5 w-1.5 rounded-full bg-white" />}
          </button>
          <span
            className={`flex-1 text-[13px] ${
              item.completed ? "text-neutral-400 line-through" : ""
            }`}
          >
            {item.title}
          </span>
          <button
            onClick={() => removeChecklistItem(task.id, item.id)}
            className="opacity-0 text-neutral-400 hover:text-red-500 group-hover:opacity-100"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 py-0.5">
        <Plus size={14} className="shrink-0 text-neutral-400" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          onBlur={submit}
          placeholder="Add checklist item…"
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Tag as TagIcon } from "lucide-react";
import { Popover } from "./Popover";
import type { Tag, Task } from "../db/types";
import { createTag, updateTask } from "../db/actions";

export function TagPicker({ task, tags }: { task: Task; tags: Tag[] }) {
  const [draft, setDraft] = useState("");

  function toggle(tagId: string) {
    const has = task.tagIds.includes(tagId);
    updateTask(task.id, {
      tagIds: has ? task.tagIds.filter((t) => t !== tagId) : [...task.tagIds, tagId],
    });
  }

  async function addNew() {
    const name = draft.trim();
    if (!name) return;
    const id = await createTag(name);
    updateTask(task.id, { tagIds: [...task.tagIds, id] });
    setDraft("");
  }

  return (
    <Popover
      trigger={(open) => (
        <button
          onClick={open}
          className={`no-drag flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] ${
            task.tagIds.length
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
              : "text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          <TagIcon size={12} />
          {task.tagIds.length
            ? tags
                .filter((t) => task.tagIds.includes(t.id))
                .map((t) => t.name)
                .join(", ")
            : "Tags"}
        </button>
      )}
    >
      {() => (
        <div className="w-48">
          <div className="max-h-40 overflow-y-auto">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[13px] hover:bg-black/5 dark:hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={task.tagIds.includes(tag.id)}
                  onChange={() => toggle(tag.id)}
                />
                {tag.name}
              </label>
            ))}
            {tags.length === 0 && (
              <p className="px-2 py-1 text-[12px] text-neutral-400">No tags yet</p>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 border-t border-black/10 pt-1 dark:border-white/10">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNew()}
              placeholder="New tag…"
              className="w-full rounded-md bg-transparent px-2 py-1 text-[13px] outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>
      )}
    </Popover>
  );
}

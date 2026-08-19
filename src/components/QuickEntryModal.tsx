import { useEffect, useRef, useState } from "react";
import { createTask } from "../db/actions";
import { useAppStore } from "../store/useAppStore";

export function QuickEntryModal() {
  const open = useAppStore((s) => s.quickEntryOpen);
  const close = useAppStore((s) => s.closeQuickEntry);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setNotes("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  async function submit() {
    if (!title.trim()) {
      close();
      return;
    }
    await createTask({ title, notes, when: "inbox" });
    close();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 pt-32"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="w-[420px] rounded-xl border border-black/10 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-neutral-800">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="To-Do Title"
          className="w-full bg-transparent text-[16px] font-medium outline-none placeholder:text-neutral-400"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          rows={3}
          className="mt-2 w-full resize-none bg-transparent text-[13px] outline-none placeholder:text-neutral-400"
        />
        <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2 dark:border-white/10">
          <span className="text-[11px] text-neutral-400">Adds to Inbox · Esc to cancel</span>
          <button
            onClick={submit}
            className="rounded-md bg-blue-500 px-3 py-1 text-[13px] font-medium text-white hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

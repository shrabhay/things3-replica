import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ListChecks, RotateCcw, StickyNote, Trash2, XCircle } from "lucide-react";
import type { Area, Project, Tag, Task } from "../db/types";
import {
  cancelTask,
  deleteTaskForever,
  restoreTask,
  toggleTaskComplete,
  trashTask,
  updateTask,
} from "../db/actions";
import { useAppStore } from "../store/useAppStore";
import { WhenPicker, DeadlinePicker } from "./WhenPicker";
import { TagPicker } from "./TagPicker";
import { ProjectAreaPicker } from "./ProjectAreaPicker";
import { ChecklistEditor } from "./ChecklistEditor";

interface TaskRowProps {
  task: Task;
  tags: Tag[];
  projects: Project[];
  areas: Area[];
  showProjectPicker?: boolean;
  variant?: "active" | "trash";
  draggable?: boolean;
}

export function TaskRow({
  task,
  tags,
  projects,
  areas,
  showProjectPicker = true,
  variant = "active",
  draggable = true,
}: TaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !draggable,
  });
  const selectedTaskId = useAppStore((s) => s.selectedTaskId);
  const setSelectedTaskId = useAppStore((s) => s.setSelectedTaskId);
  const expanded = selectedTaskId === task.id;
  const [title, setTitle] = useState(task.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const done = task.status !== "open";
  const checklistDone = task.checklist.filter((c) => c.completed).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group border-b border-black/[0.06] px-2 dark:border-white/[0.06]"
    >
      <div className="flex items-start gap-2 py-2">
        {draggable && (
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab text-neutral-300 opacity-0 group-hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical size={14} />
          </button>
        )}

        <button
          onClick={() => toggleTaskComplete(task.id)}
          className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
            task.status === "completed"
              ? "border-emerald-500 bg-emerald-500"
              : task.status === "canceled"
                ? "border-neutral-400 bg-neutral-300 dark:bg-neutral-600"
                : "border-neutral-400 hover:border-emerald-500 dark:border-neutral-500"
          }`}
        >
          {task.status === "completed" && (
            <span className="block h-2 w-2 rounded-full bg-white" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== task.title && updateTask(task.id, { title })}
              onFocus={() => setSelectedTaskId(task.id)}
              onKeyDown={(e) => e.currentTarget.blur()}
              className={`min-w-0 flex-1 truncate bg-transparent text-[14px] outline-none ${
                done ? "text-neutral-400 line-through" : ""
              }`}
            />
            {task.notes && <StickyNote size={12} className="shrink-0 text-neutral-400" />}
            {task.checklist.length > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-neutral-400">
                <ListChecks size={12} />
                {checklistDone}/{task.checklist.length}
              </span>
            )}
          </div>

          {!expanded && (task.startDate || task.deadline || task.tagIds.length > 0) && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {task.startDate && (
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[11px] text-blue-600 dark:text-blue-400">
                  {task.evening ? "Evening" : "Scheduled"}
                </span>
              )}
              {task.deadline && (
                <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[11px] text-red-600 dark:text-red-400">
                  Deadline
                </span>
              )}
              {tags
                .filter((t) => task.tagIds.includes(t.id))
                .map((t) => (
                  <span
                    key={t.id}
                    className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[11px] text-purple-600 dark:text-purple-400"
                  >
                    {t.name}
                  </span>
                ))}
            </div>
          )}

          <button
            onClick={() => setSelectedTaskId(expanded ? null : task.id)}
            className="mt-0.5 text-[11px] text-neutral-400 opacity-0 hover:text-neutral-600 group-hover:opacity-100 dark:hover:text-neutral-300"
          >
            {expanded ? "Hide details" : "Details…"}
          </button>

          {expanded && (
            <div className="mt-1.5 space-y-2">
              <textarea
                defaultValue={task.notes}
                onBlur={(e) => updateTask(task.id, { notes: e.target.value })}
                placeholder="Notes"
                rows={2}
                className="w-full resize-none rounded-md bg-black/[0.03] px-2 py-1.5 text-[13px] outline-none placeholder:text-neutral-400 dark:bg-white/[0.05]"
              />
              {variant === "active" && <ChecklistEditor task={task} />}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {variant === "active" && (
                  <>
                    <WhenPicker task={task} />
                    <DeadlinePicker task={task} />
                    <TagPicker task={task} tags={tags} />
                    {showProjectPicker && (
                      <ProjectAreaPicker task={task} projects={projects} areas={areas} />
                    )}
                  </>
                )}
                <div className="flex-1" />
                {variant === "active" ? (
                  <>
                    <button
                      onClick={() => cancelTask(task.id)}
                      title="Cancel"
                      className="no-drag rounded-md p-1 text-neutral-400 hover:bg-black/5 hover:text-neutral-600 dark:hover:bg-white/10"
                    >
                      <XCircle size={14} />
                    </button>
                    <button
                      onClick={() => trashTask(task.id)}
                      title="Move to Trash"
                      className="no-drag rounded-md p-1 text-neutral-400 hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => restoreTask(task.id)}
                      title="Restore"
                      className="no-drag flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <RotateCcw size={13} /> Restore
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this to-do forever? This can't be undone.")) {
                          deleteTaskForever(task.id);
                        }
                      }}
                      title="Delete Forever"
                      className="no-drag rounded-md p-1 text-neutral-400 hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

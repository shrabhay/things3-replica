import { CalendarClock, Moon, Sun, Archive, X } from "lucide-react";
import type { ReactNode } from "react";
import { Popover } from "./Popover";
import type { Task } from "../db/types";
import { updateTask } from "../db/actions";
import { formatFriendlyDate, todayISO } from "../lib/dates";

function Row({
  icon,
  label,
  onClick,
  tint,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tint: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-black/5 dark:hover:bg-white/10"
    >
      <span className={tint}>{icon}</span>
      {label}
    </button>
  );
}

export function WhenPicker({ task }: { task: Task }) {
  const hasWhen = task.when !== "inbox" || task.startDate;
  return (
    <Popover
      trigger={(open) => (
        <button
          onClick={open}
          className={`no-drag flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] ${
            hasWhen
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          <CalendarClock size={12} />
          {task.startDate
            ? formatFriendlyDate(task.startDate) + (task.evening ? " Evening" : "")
            : task.when === "someday"
              ? "Someday"
              : "When"}
        </button>
      )}
    >
      {(close) => (
        <div className="w-44">
          <Row
            icon={<Sun size={14} />}
            tint="text-amber-500"
            label="Today"
            onClick={() => {
              updateTask(task.id, { when: "today", startDate: todayISO(), evening: false });
              close();
            }}
          />
          <Row
            icon={<Moon size={14} />}
            tint="text-indigo-500"
            label="This Evening"
            onClick={() => {
              updateTask(task.id, { when: "today", startDate: todayISO(), evening: true });
              close();
            }}
          />
          <label className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-black/5 dark:hover:bg-white/10">
            <span className="text-red-500">
              <CalendarClock size={14} />
            </span>
            <span className="flex-1">Upcoming</span>
            <input
              type="date"
              className="w-0 opacity-0"
              onChange={(e) => {
                if (!e.target.value) return;
                updateTask(task.id, {
                  when: "anytime",
                  startDate: e.target.value,
                  evening: false,
                });
                close();
              }}
            />
          </label>
          <Row
            icon={<Archive size={14} />}
            tint="text-amber-700"
            label="Someday"
            onClick={() => {
              updateTask(task.id, { when: "someday", startDate: null, evening: false });
              close();
            }}
          />
          <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
          <Row
            icon={<X size={14} />}
            tint="text-neutral-400"
            label="No Date (Anytime)"
            onClick={() => {
              updateTask(task.id, { when: "anytime", startDate: null, evening: false });
              close();
            }}
          />
        </div>
      )}
    </Popover>
  );
}

export function DeadlinePicker({ task }: { task: Task }) {
  return (
    <Popover
      trigger={(open) => (
        <button
          onClick={open}
          className={`no-drag flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] ${
            task.deadline
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          {task.deadline ? `Deadline ${formatFriendlyDate(task.deadline)}` : "Deadline"}
        </button>
      )}
    >
      {(close) => (
        <div className="w-48 space-y-1 p-1">
          <input
            type="date"
            defaultValue={task.deadline ?? ""}
            className="w-full rounded-md border border-black/10 bg-transparent px-2 py-1 text-[13px] dark:border-white/10"
            onChange={(e) => {
              updateTask(task.id, { deadline: e.target.value || null });
            }}
          />
          {task.deadline && (
            <button
              className="w-full rounded-md px-2 py-1 text-left text-[13px] text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => {
                updateTask(task.id, { deadline: null });
                close();
              }}
            >
              Remove Deadline
            </button>
          )}
        </div>
      )}
    </Popover>
  );
}

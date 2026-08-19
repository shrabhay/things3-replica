import type { SmartListId, Task } from "../db/types";
import { isPastDate, isTodayDate, todayISO } from "./dates";

/** Whether a task (already filtered to open + not trashed) belongs to a smart list. */
export function taskBelongsToSmartList(task: Task, list: SmartListId): boolean {
  switch (list) {
    case "trash":
      return task.trashed;
    case "logbook":
      return !task.trashed && task.status !== "open";
    case "inbox":
      return !task.trashed && task.status === "open" && task.when === "inbox";
    case "today":
      return (
        !task.trashed &&
        task.status === "open" &&
        (task.when === "today" ||
          (!!task.startDate && (isPastDate(task.startDate) || isTodayDate(task.startDate))))
      );
    case "upcoming":
      return (
        !task.trashed &&
        task.status === "open" &&
        !!task.startDate &&
        !isTodayDate(task.startDate) &&
        !isPastDate(task.startDate)
      );
    case "anytime":
      return (
        !task.trashed &&
        task.status === "open" &&
        task.when === "anytime" &&
        !task.startDate
      );
    case "someday":
      return (
        !task.trashed && task.status === "open" && task.when === "someday" && !task.startDate
      );
    default:
      return false;
  }
}

export function countOpenAndDue(tasks: Task[]): number {
  const today = todayISO();
  return tasks.filter(
    (t) => !t.trashed && t.status === "open" && (t.when === "today" || t.startDate === today),
  ).length;
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/** 0-100 completion percentage for a project, based on its non-trashed, non-canceled to-dos. */
export function projectProgress(tasks: Task[], projectId: string): number {
  const relevant = tasks.filter(
    (t) => t.projectId === projectId && !t.trashed && t.status !== "canceled",
  );
  if (relevant.length === 0) return 0;
  const done = relevant.filter((t) => t.status === "completed").length;
  return Math.round((done / relevant.length) * 100);
}

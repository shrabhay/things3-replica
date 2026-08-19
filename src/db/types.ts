export type When = "inbox" | "today" | "anytime" | "someday";

export type TaskStatus = "open" | "completed" | "canceled";

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

/** Fields shared by anything the When/Deadline pickers can schedule (Task and Project). */
export interface Schedulable {
  when: When;
  /** ISO date (yyyy-MM-dd) the item is scheduled/started on. Drives Today/Upcoming. */
  startDate: string | null;
  /** Show in the "This Evening" section of Today. */
  evening: boolean;
  /** ISO date (yyyy-MM-dd) deadline, shown as a red chip. */
  deadline: string | null;
}

export interface Task extends Schedulable {
  id: string;
  title: string;
  notes: string;
  status: TaskStatus;
  trashed: boolean;
  projectId: string | null;
  areaId: string | null;
  tagIds: string[];
  checklist: ChecklistItem[];
  order: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface Project extends Schedulable {
  id: string;
  title: string;
  notes: string;
  status: TaskStatus;
  trashed: boolean;
  areaId: string | null;
  tagIds: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface Area {
  id: string;
  title: string;
  order: number;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export type SmartListId =
  | "inbox"
  | "today"
  | "upcoming"
  | "anytime"
  | "someday"
  | "logbook"
  | "trash";

export type ViewSelection =
  | { kind: "smart"; id: SmartListId }
  | { kind: "area"; id: string }
  | { kind: "project"; id: string }
  | { kind: "tag"; id: string };

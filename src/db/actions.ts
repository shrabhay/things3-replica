import { nanoid } from "nanoid";
import { db } from "./db";
import type { Area, ChecklistItem, Project, Task, When } from "./types";

const now = () => Date.now();

async function nextOrder(table: "tasks" | "projects" | "areas" | "tags") {
  const last = await db[table].orderBy("order").last();
  return last ? last.order + 1 : 0;
}

// ---------- Tasks ----------

export interface NewTaskInput {
  title: string;
  notes?: string;
  when?: When;
  startDate?: string | null;
  deadline?: string | null;
  projectId?: string | null;
  areaId?: string | null;
  tagIds?: string[];
}

export async function createTask(input: NewTaskInput): Promise<string> {
  const id = nanoid();
  const order = await nextOrder("tasks");
  const task: Task = {
    id,
    title: input.title.trim() || "New To-Do",
    notes: input.notes ?? "",
    status: "open",
    trashed: false,
    when: input.when ?? "inbox",
    startDate: input.startDate ?? null,
    evening: false,
    deadline: input.deadline ?? null,
    projectId: input.projectId ?? null,
    areaId: input.areaId ?? null,
    tagIds: input.tagIds ?? [],
    checklist: [],
    order,
    createdAt: now(),
    updatedAt: now(),
    completedAt: null,
  };
  await db.tasks.add(task);
  return id;
}

export async function updateTask(id: string, patch: Partial<Task>) {
  await db.tasks.update(id, { ...patch, updatedAt: now() });
}

export async function toggleTaskComplete(id: string) {
  const task = await db.tasks.get(id);
  if (!task) return;
  if (task.status === "completed") {
    await db.tasks.update(id, { status: "open", completedAt: null, updatedAt: now() });
  } else {
    await db.tasks.update(id, { status: "completed", completedAt: now(), updatedAt: now() });
  }
}

export async function cancelTask(id: string) {
  const task = await db.tasks.get(id);
  if (!task) return;
  if (task.status === "canceled") {
    await db.tasks.update(id, { status: "open", completedAt: null, updatedAt: now() });
  } else {
    await db.tasks.update(id, { status: "canceled", completedAt: now(), updatedAt: now() });
  }
}

export async function trashTask(id: string) {
  await db.tasks.update(id, { trashed: true, updatedAt: now() });
}

export async function restoreTask(id: string) {
  await db.tasks.update(id, { trashed: false, updatedAt: now() });
}

export async function deleteTaskForever(id: string) {
  await db.tasks.delete(id);
}

export async function addChecklistItem(taskId: string, title: string) {
  const task = await db.tasks.get(taskId);
  if (!task) return;
  const item: ChecklistItem = { id: nanoid(), title, completed: false };
  await db.tasks.update(taskId, {
    checklist: [...task.checklist, item],
    updatedAt: now(),
  });
}

export async function toggleChecklistItem(taskId: string, itemId: string) {
  const task = await db.tasks.get(taskId);
  if (!task) return;
  const checklist = task.checklist.map((i) =>
    i.id === itemId ? { ...i, completed: !i.completed } : i,
  );
  await db.tasks.update(taskId, { checklist, updatedAt: now() });
}

export async function removeChecklistItem(taskId: string, itemId: string) {
  const task = await db.tasks.get(taskId);
  if (!task) return;
  await db.tasks.update(taskId, {
    checklist: task.checklist.filter((i) => i.id !== itemId),
    updatedAt: now(),
  });
}

export async function reorderTasks(orderedIds: string[]) {
  await db.transaction("rw", db.tasks, async () => {
    await Promise.all(
      orderedIds.map((id, index) => db.tasks.update(id, { order: index })),
    );
  });
}

// ---------- Projects ----------

export interface NewProjectInput {
  title: string;
  areaId?: string | null;
}

export async function createProject(input: NewProjectInput): Promise<string> {
  const id = nanoid();
  const order = await nextOrder("projects");
  const project: Project = {
    id,
    title: input.title.trim() || "New Project",
    notes: "",
    status: "open",
    trashed: false,
    when: "anytime",
    startDate: null,
    evening: false,
    deadline: null,
    areaId: input.areaId ?? null,
    tagIds: [],
    order,
    createdAt: now(),
    updatedAt: now(),
    completedAt: null,
  };
  await db.projects.add(project);
  return id;
}

export async function updateProject(id: string, patch: Partial<Project>) {
  await db.projects.update(id, { ...patch, updatedAt: now() });
}

export async function toggleProjectComplete(id: string) {
  const project = await db.projects.get(id);
  if (!project) return;
  if (project.status === "completed") {
    await db.projects.update(id, { status: "open", completedAt: null, updatedAt: now() });
  } else {
    await db.projects.update(id, { status: "completed", completedAt: now(), updatedAt: now() });
  }
}

export async function trashProject(id: string) {
  await db.transaction("rw", db.projects, db.tasks, async () => {
    await db.projects.update(id, { trashed: true, updatedAt: now() });
    const tasks = await db.tasks.where("projectId").equals(id).toArray();
    await Promise.all(
      tasks.map((t) => db.tasks.update(t.id, { trashed: true, updatedAt: now() })),
    );
  });
}

// ---------- Areas ----------

export async function createArea(title: string): Promise<string> {
  const id = nanoid();
  const order = await nextOrder("areas");
  const area: Area = { id, title: title.trim() || "New Area", order, createdAt: now() };
  await db.areas.add(area);
  return id;
}

export async function updateArea(id: string, patch: Partial<Area>) {
  await db.areas.update(id, patch);
}

export async function deleteArea(id: string) {
  await db.transaction("rw", db.areas, db.projects, db.tasks, async () => {
    await db.areas.delete(id);
    const projects = await db.projects.where("areaId").equals(id).toArray();
    await Promise.all(projects.map((p) => db.projects.update(p.id, { areaId: null })));
    const tasks = await db.tasks.where("areaId").equals(id).toArray();
    await Promise.all(tasks.map((t) => db.tasks.update(t.id, { areaId: null })));
  });
}

// ---------- Tags ----------

export async function createTag(name: string): Promise<string> {
  const id = nanoid();
  const order = await nextOrder("tags");
  await db.tags.add({ id, name: name.trim(), order, createdAt: now() });
  return id;
}

export async function deleteTag(id: string) {
  await db.transaction("rw", db.tags, db.tasks, db.projects, async () => {
    await db.tags.delete(id);
    const tasks = await db.tasks.where("tagIds").equals(id).toArray();
    await Promise.all(
      tasks.map((t) =>
        db.tasks.update(t.id, { tagIds: t.tagIds.filter((tid) => tid !== id) }),
      ),
    );
  });
}

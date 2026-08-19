import Dexie, { type EntityTable } from "dexie";
import type { Area, Project, Tag, Task } from "./types";

class ThingsDB extends Dexie {
  tasks!: EntityTable<Task, "id">;
  projects!: EntityTable<Project, "id">;
  areas!: EntityTable<Area, "id">;
  tags!: EntityTable<Tag, "id">;

  constructor() {
    super("things-replica");
    this.version(1).stores({
      tasks:
        "id, status, trashed, when, startDate, deadline, projectId, areaId, order, createdAt, *tagIds",
      projects: "id, status, trashed, areaId, order, createdAt",
      areas: "id, order, createdAt",
      tags: "id, order, createdAt, name",
    });
  }
}

export const db = new ThingsDB();

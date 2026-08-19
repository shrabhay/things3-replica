import { nanoid } from "nanoid";
import { db } from "./db";
import type { Area, ChecklistItem, Project, Tag, Task, When } from "./types";
import { toISODate } from "../lib/dates";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const now = Date.now();
const today = () => toISODate(new Date(now));
const daysFromNow = (n: number) => toISODate(new Date(now + n * DAY));

let taskOrder = 0;
let projectOrder = 0;
let areaOrder = 0;
let tagOrder = 0;

function checklist(items: [string, boolean][]): ChecklistItem[] {
  return items.map(([title, completed]) => ({ id: nanoid(), title, completed }));
}

function area(title: string): Area {
  return { id: nanoid(), title, order: areaOrder++, createdAt: now };
}

function tag(name: string): Tag {
  return { id: nanoid(), name, order: tagOrder++, createdAt: now };
}

function project(title: string, areaId: string | null, tagIds: string[] = []): Project {
  return {
    id: nanoid(),
    title,
    notes: "",
    status: "open",
    trashed: false,
    areaId,
    tagIds,
    order: projectOrder++,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

interface TaskOpts {
  notes?: string;
  when?: When;
  startDate?: string | null;
  evening?: boolean;
  deadline?: string | null;
  projectId?: string | null;
  areaId?: string | null;
  tagIds?: string[];
  checklist?: ChecklistItem[];
  status?: "open" | "completed" | "canceled";
  trashed?: boolean;
  /** Days ago this was completed/canceled (for realistic Logbook grouping). */
  completedDaysAgo?: number;
  completedHoursAgo?: number;
}

function task(title: string, opts: TaskOpts = {}): Task {
  const status = opts.status ?? "open";
  let completedAt: number | null = null;
  if (status !== "open") {
    if (opts.completedDaysAgo !== undefined) completedAt = now - opts.completedDaysAgo * DAY;
    else if (opts.completedHoursAgo !== undefined) completedAt = now - opts.completedHoursAgo * HOUR;
    else completedAt = now;
  }
  return {
    id: nanoid(),
    title,
    notes: opts.notes ?? "",
    status,
    trashed: opts.trashed ?? false,
    when: opts.when ?? "inbox",
    startDate: opts.startDate ?? null,
    evening: opts.evening ?? false,
    deadline: opts.deadline ?? null,
    projectId: opts.projectId ?? null,
    areaId: opts.areaId ?? null,
    tagIds: opts.tagIds ?? [],
    checklist: opts.checklist ?? [],
    order: taskOrder++,
    createdAt: now,
    updatedAt: now,
    completedAt,
  };
}

/**
 * Populates a demo workspace on first launch so a fresh install has something to explore:
 * a project at each stage of completion (to show the progress ring), tasks in every smart
 * list, checklists, tags, deadlines, and a few Logbook/Trash entries. Only runs once — if
 * any data already exists (including the user's own), it's a no-op.
 */
export async function seedDemoDataIfEmpty(): Promise<void> {
  const [taskCount, projectCount, areaCount, tagCount] = await Promise.all([
    db.tasks.count(),
    db.projects.count(),
    db.areas.count(),
    db.tags.count(),
  ]);
  if (taskCount || projectCount || areaCount || tagCount) return;

  const tags = {
    urgent: tag("Urgent"),
    waiting: tag("Waiting On"),
    errand: tag("Errand"),
    deepWork: tag("Deep Work"),
  };

  const areas = {
    work: area("Work"),
    personal: area("Personal"),
    health: area("Health & Fitness"),
  };

  // --- Website Redesign: ~50% done, demonstrates a half-filled progress ring ---
  const websiteRedesign = project("Website Redesign", areas.work.id, [tags.deepWork.id]);
  const websiteTasks = [
    task("Audit current site & gather feedback", {
      projectId: websiteRedesign.id,
      status: "completed",
      completedDaysAgo: 6,
    }),
    task("Wireframe new homepage", {
      projectId: websiteRedesign.id,
      status: "completed",
      completedDaysAgo: 4,
    }),
    task("Build design system in Figma", {
      projectId: websiteRedesign.id,
      status: "completed",
      completedDaysAgo: 2,
    }),
    task("Build landing page", {
      projectId: websiteRedesign.id,
      when: "today",
      startDate: today(),
      tagIds: [tags.deepWork.id],
      notes: "Use the new design system components. Check with Sam on the hero image.",
    }),
    task("Write new homepage copy", {
      projectId: websiteRedesign.id,
      when: "anytime",
      tagIds: [tags.waiting.id],
      notes: "Waiting on approved messaging from marketing.",
    }),
    task("QA on staging + fix mobile nav", {
      projectId: websiteRedesign.id,
      when: "anytime",
      deadline: daysFromNow(5),
    }),
  ];

  // --- Home Renovation: 0% done, demonstrates an empty ring + a checklist ---
  const homeRenovation = project("Home Renovation", areas.personal.id);
  const renovationTasks = [
    task("Get 3 contractor quotes", {
      projectId: homeRenovation.id,
      when: "anytime",
      tagIds: [tags.waiting.id],
      checklist: checklist([
        ["Call Bob's Construction", true],
        ["Call ABC Renovations", false],
        ["Email quote request to Smith & Sons", false],
      ]),
    }),
    task("Pick paint colors", { projectId: homeRenovation.id, when: "someday" }),
    task("Measure kitchen for new cabinets", { projectId: homeRenovation.id, when: "anytime" }),
    task("Research permits needed", {
      projectId: homeRenovation.id,
      when: "anytime",
      tagIds: [tags.errand.id],
    }),
  ];

  // --- Marathon Training: ~80% done, demonstrates a near-full ring ---
  const marathonTraining = project("Marathon Training", areas.health.id);
  const marathonTasks = [
    task("Buy proper running shoes", {
      projectId: marathonTraining.id,
      status: "completed",
      completedDaysAgo: 20,
    }),
    task("Create 12-week training plan", {
      projectId: marathonTraining.id,
      status: "completed",
      completedDaysAgo: 18,
    }),
    task("Complete weeks 1-4: base building", {
      projectId: marathonTraining.id,
      status: "completed",
      completedDaysAgo: 5,
    }),
    task("Sign up for race", {
      projectId: marathonTraining.id,
      status: "completed",
      completedDaysAgo: 15,
    }),
    task("Weeks 5-8: speed work — track intervals", {
      projectId: marathonTraining.id,
      when: "today",
      startDate: today(),
      evening: true,
      notes: "6x800m at 5k pace, 2min rest.",
    }),
  ];

  // --- Standalone to-dos covering every smart list ---
  const standalone = [
    // Inbox — unsorted capture
    task("Reply to Sarah's email about the conference"),
    task("Look into standing desk options"),

    // Today (+ This Evening)
    task("Take out recycling", { when: "today", startDate: today() }),
    task("Call dentist to reschedule cleaning", {
      when: "today",
      startDate: today(),
      evening: true,
    }),

    // Upcoming (has both a start date and a deadline, to show both chips)
    task("Order flowers for Mom's birthday", { when: "anytime", startDate: daysFromNow(6) }),
    task("Renew car insurance", {
      when: "anytime",
      startDate: daysFromNow(10),
      deadline: daysFromNow(14),
      tagIds: [tags.urgent.id],
    }),

    // Anytime — organized, no date
    task("Read 'Atomic Habits'", { when: "anytime", tagIds: [tags.deepWork.id] }),
    task("Clean out the garage", { when: "anytime", tagIds: [tags.errand.id] }),

    // Someday
    task("Plan a trip to Japan", { when: "someday", notes: "Cherry blossom season, April?" }),
    task("Learn to play guitar", { when: "someday" }),

    // Logbook — completed & canceled
    task("Submit expense report", { status: "completed", completedDaysAgo: 1 }),
    task("Cancel unused streaming subscription", { status: "canceled", completedDaysAgo: 3 }),

    // Trash
    task("Old draft to-do — ignore", { trashed: true }),
  ];

  await db.transaction("rw", db.areas, db.tags, db.projects, db.tasks, async () => {
    await db.areas.bulkAdd(Object.values(areas));
    await db.tags.bulkAdd(Object.values(tags));
    await db.projects.bulkAdd([websiteRedesign, homeRenovation, marathonTraining]);
    await db.tasks.bulkAdd([...websiteTasks, ...renovationTasks, ...marathonTasks, ...standalone]);
  });
}

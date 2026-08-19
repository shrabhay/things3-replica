import { useState } from "react";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Inbox as InboxIcon,
  Layers,
  Plus,
  Search,
  Sun,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import type { Area, Project, SmartListId, Tag, Task } from "../db/types";
import { useAppStore } from "../store/useAppStore";
import { taskBelongsToSmartList, sortByOrder, projectProgress } from "../lib/lists";
import { createArea, createProject } from "../db/actions";
import { ProjectProgressIcon } from "./ProjectProgressIcon";

const SMART_LISTS: { id: SmartListId; label: string; icon: React.ElementType; tint: string }[] = [
  { id: "inbox", label: "Inbox", icon: InboxIcon, tint: "text-blue-500" },
  { id: "today", label: "Today", icon: Sun, tint: "text-amber-500" },
  { id: "upcoming", label: "Upcoming", icon: CalendarDays, tint: "text-red-500" },
  { id: "anytime", label: "Anytime", icon: Layers, tint: "text-sky-600" },
  { id: "someday", label: "Someday", icon: Archive, tint: "text-amber-700" },
];

interface SidebarProps {
  tasks: Task[];
  projects: Project[];
  areas: Area[];
  tags: Tag[];
}

export function Sidebar({ tasks, projects, areas, tags }: SidebarProps) {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const collapsedAreas = useAppStore((s) => s.collapsedAreas);
  const toggleAreaCollapsed = useAppStore((s) => s.toggleAreaCollapsed);
  const [addingArea, setAddingArea] = useState(false);
  const [areaDraft, setAreaDraft] = useState("");

  const openTasks = tasks.filter((t) => !t.trashed && t.status === "open");

  function isActive(sel: typeof view) {
    return JSON.stringify(sel) === JSON.stringify(view);
  }

  async function submitNewArea() {
    const title = areaDraft.trim();
    if (title) await createArea(title);
    setAreaDraft("");
    setAddingArea(false);
  }

  return (
    <div className="flex h-full w-64 shrink-0 flex-col bg-black/[0.025] dark:bg-white/[0.03]">
      <div className="flex items-center gap-2 px-3 pb-2 pt-3">
        <Search size={14} className="text-neutral-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-neutral-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <nav className="space-y-0.5">
          {SMART_LISTS.map(({ id, label, icon: Icon, tint }) => {
            const count = openTasks.filter((t) => taskBelongsToSmartList(t, id)).length;
            const selected = isActive({ kind: "smart", id });
            return (
              <button
                key={id}
                onClick={() => setView({ kind: "smart", id })}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] ${
                  selected
                    ? "bg-blue-500 text-white"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <Icon size={16} className={selected ? "text-white" : tint} />
                <span className="flex-1 truncate text-left">{label}</span>
                {count > 0 && (
                  <span className={`text-[12px] ${selected ? "text-white/80" : "text-neutral-400"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-4">
          <div className="flex items-center justify-between px-2.5 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Areas
            </span>
            <button
              onClick={() => setAddingArea(true)}
              className="rounded p-0.5 text-neutral-400 hover:bg-black/5 hover:text-neutral-600 dark:hover:bg-white/10"
              title="New Area"
            >
              <Plus size={14} />
            </button>
          </div>

          {addingArea && (
            <input
              autoFocus
              value={areaDraft}
              onChange={(e) => setAreaDraft(e.target.value)}
              onBlur={submitNewArea}
              onKeyDown={(e) => e.key === "Enter" && submitNewArea()}
              placeholder="Area name…"
              className="mb-1 w-full rounded-md bg-white px-2.5 py-1 text-[13px] outline-none dark:bg-neutral-800"
            />
          )}

          {sortByOrder(areas).map((area) => {
            const areaProjects = sortByOrder(
              projects.filter((p) => p.areaId === area.id && !p.trashed && p.status === "open"),
            );
            const collapsed = collapsedAreas[area.id];
            return (
              <div key={area.id}>
                <button
                  onClick={() => setView({ kind: "area", id: area.id })}
                  className={`group flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-[13px] ${
                    isActive({ kind: "area", id: area.id })
                      ? "bg-blue-500 text-white"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAreaCollapsed(area.id);
                    }}
                    className="flex h-4 w-4 items-center justify-center"
                  >
                    {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  </span>
                  <span className="flex-1 truncate text-left font-medium">{area.title}</span>
                  <span
                    role="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await createProject({ title: "New Project", areaId: area.id });
                    }}
                    className="rounded p-0.5 opacity-0 hover:bg-black/10 group-hover:opacity-100"
                    title="New Project"
                  >
                    <Plus size={13} />
                  </span>
                </button>
                {!collapsed &&
                  areaProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setView({ kind: "project", id: project.id })}
                      className={`flex w-full items-center gap-2 rounded-md py-1.5 pl-8 pr-2.5 text-[13px] ${
                        isActive({ kind: "project", id: project.id })
                          ? "bg-blue-500 text-white"
                          : "hover:bg-black/5 dark:hover:bg-white/10"
                      }`}
                    >
                      <ProjectProgressIcon
                        percent={projectProgress(tasks, project.id)}
                        size={14}
                        className={
                          isActive({ kind: "project", id: project.id })
                            ? "shrink-0 text-white"
                            : "shrink-0 text-emerald-600"
                        }
                      />
                      <span className="flex-1 truncate text-left">{project.title}</span>
                    </button>
                  ))}
              </div>
            );
          })}
        </div>

        {tags.length > 0 && (
          <div className="mt-4">
            <span className="px-2.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Tags
            </span>
            {sortByOrder(tags).map((tag) => (
              <button
                key={tag.id}
                onClick={() => setView({ kind: "tag", id: tag.id })}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] ${
                  isActive({ kind: "tag", id: tag.id })
                    ? "bg-blue-500 text-white"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <TagIcon
                  size={14}
                  className={isActive({ kind: "tag", id: tag.id }) ? "text-white" : "text-purple-600"}
                />
                <span className="flex-1 truncate text-left">{tag.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-0.5 border-t border-black/[0.06] px-2 py-2 dark:border-white/[0.06]">
        {(
          [
            { id: "logbook", label: "Logbook", icon: CheckCircle2, tint: "text-emerald-600" },
            { id: "trash", label: "Trash", icon: Trash2, tint: "text-neutral-400" },
          ] as const
        ).map(({ id, label, icon: Icon, tint }) => {
          const selected = isActive({ kind: "smart", id });
          return (
            <button
              key={id}
              onClick={() => setView({ kind: "smart", id })}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] ${
                selected ? "bg-blue-500 text-white" : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Icon size={16} className={selected ? "text-white" : tint} />
              <span className="flex-1 truncate text-left">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

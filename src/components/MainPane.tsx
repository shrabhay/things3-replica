import { useMemo, useState } from "react";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Inbox as InboxIcon,
  Layers,
  Sun,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import type { Area, Project, SmartListId, Tag, Task } from "../db/types";
import { useAppStore } from "../store/useAppStore";
import { taskBelongsToSmartList, sortByOrder } from "../lib/lists";
import { formatLogDate } from "../lib/dates";
import { TaskList } from "./TaskList";
import { TaskRow } from "./TaskRow";
import { createProject, toggleProjectComplete, updateArea, updateProject } from "../db/actions";

const SMART_META: Record<
  SmartListId,
  { title: string; icon: React.ElementType; tint: string }
> = {
  inbox: { title: "Inbox", icon: InboxIcon, tint: "text-blue-500" },
  today: { title: "Today", icon: Sun, tint: "text-amber-500" },
  upcoming: { title: "Upcoming", icon: CalendarDays, tint: "text-red-500" },
  anytime: { title: "Anytime", icon: Layers, tint: "text-sky-600" },
  someday: { title: "Someday", icon: Archive, tint: "text-amber-700" },
  logbook: { title: "Logbook", icon: CheckCircle2, tint: "text-emerald-600" },
  trash: { title: "Trash", icon: Trash2, tint: "text-neutral-400" },
};

function Header({
  icon: Icon,
  tint,
  title,
  count,
  onRename,
}: {
  icon: React.ElementType;
  tint: string;
  title: string;
  count?: number;
  onRename?: (title: string) => void;
}) {
  const [value, setValue] = useState(title);
  return (
    <div className="flex items-center gap-2 px-6 pb-3 pt-8">
      <Icon size={22} className={tint} />
      {onRename ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => value.trim() && onRename(value)}
          className="min-w-0 flex-1 bg-transparent text-2xl font-bold outline-none"
        />
      ) : (
        <h1 className="text-2xl font-bold">{title}</h1>
      )}
      {typeof count === "number" && count > 0 && (
        <span className="text-lg font-medium text-neutral-400">{count}</span>
      )}
    </div>
  );
}

interface MainPaneProps {
  tasks: Task[];
  projects: Project[];
  areas: Area[];
  tags: Tag[];
}

export function MainPane({ tasks, projects, areas, tags }: MainPaneProps) {
  const view = useAppStore((s) => s.view);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setView = useAppStore((s) => s.setView);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tasks, searchQuery]);

  if (view.kind === "smart") {
    const meta = SMART_META[view.id];
    const list = filteredBySearch.filter((t) => taskBelongsToSmartList(t, view.id));

    if (view.id === "logbook") {
      const groups = new Map<string, Task[]>();
      for (const t of sortByOrder(list).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))) {
        const key = formatLogDate(t.completedAt ?? t.updatedAt);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(t);
      }
      return (
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Header icon={meta.icon} tint={meta.tint} title={meta.title} count={list.length} />
          {list.length === 0 ? (
            <p className="px-6 text-[13px] text-neutral-400">Completed and canceled to-dos will show up here.</p>
          ) : (
            [...groups.entries()].map(([date, items]) => (
              <div key={date}>
                <p className="px-6 pb-1 pt-3 text-[12px] font-semibold uppercase text-neutral-400">
                  {date}
                </p>
                {items.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    tags={tags}
                    projects={projects}
                    areas={areas}
                    draggable={false}
                    variant="active"
                  />
                ))}
              </div>
            ))
          )}
        </div>
      );
    }

    if (view.id === "trash") {
      return (
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Header icon={meta.icon} tint={meta.tint} title={meta.title} count={list.length} />
          {list.length === 0 ? (
            <p className="px-6 text-[13px] text-neutral-400">Trash is empty.</p>
          ) : (
            list.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                tags={tags}
                projects={projects}
                areas={areas}
                draggable={false}
                variant="trash"
              />
            ))
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header icon={meta.icon} tint={meta.tint} title={meta.title} count={list.length} />
        <TaskList
          tasks={list}
          tags={tags}
          projects={projects}
          areas={areas}
          quickAddDefaults={{
            when:
              view.id === "inbox"
                ? "inbox"
                : view.id === "today"
                  ? "today"
                  : view.id === "someday"
                    ? "someday"
                    : "anytime",
            startDate: view.id === "today" ? new Date().toISOString().slice(0, 10) : null,
          }}
          emptyMessage="Nothing here."
        />
      </div>
    );
  }

  if (view.kind === "area") {
    const area = areas.find((a) => a.id === view.id);
    if (!area) return null;
    const areaProjects = sortByOrder(
      projects.filter((p) => p.areaId === area.id && !p.trashed),
    );
    const directTasks = filteredBySearch.filter(
      (t) => !t.trashed && t.status === "open" && t.areaId === area.id && !t.projectId,
    );
    return (
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header
          key={area.id}
          icon={Layers}
          tint="text-sky-600"
          title={area.title}
          onRename={(title) => updateArea(area.id, { title })}
        />
        <div className="px-4">
          <button
            className="mb-2 rounded-md px-2 py-1 text-[13px] text-sky-600 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={async () => {
              const id = await createProject({ title: "New Project", areaId: area.id });
              setView({ kind: "project", id });
            }}
          >
            + New Project
          </button>
        </div>
        {areaProjects.map((project) => {
          const projectTasks = tasks.filter(
            (t) => t.projectId === project.id && !t.trashed && t.status === "open",
          );
          return (
            <button
              key={project.id}
              onClick={() => setView({ kind: "project", id: project.id })}
              className="flex items-center gap-2 border-b border-black/[0.06] px-6 py-2.5 text-left hover:bg-black/[0.02] dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
            >
              <Layers size={15} className="text-emerald-600" />
              <span className="flex-1 truncate text-[14px] font-medium">{project.title}</span>
              <span className="text-[12px] text-neutral-400">{projectTasks.length}</span>
            </button>
          );
        })}
        <TaskList
          tasks={directTasks}
          tags={tags}
          projects={projects}
          areas={areas}
          quickAddDefaults={{ when: "anytime", areaId: area.id }}
          emptyMessage="No standalone to-dos in this area."
        />
      </div>
    );
  }

  if (view.kind === "project") {
    const project = projects.find((p) => p.id === view.id);
    if (!project) return null;
    const projectTasks = filteredBySearch.filter(
      (t) => t.projectId === project.id && !t.trashed && t.status === "open",
    );
    return (
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header
          key={project.id}
          icon={Layers}
          tint="text-emerald-600"
          title={project.title}
          onRename={(title) => updateProject(project.id, { title })}
        />
        <div className="px-6 pb-2">
          <button
            onClick={() => toggleProjectComplete(project.id)}
            className={`rounded-md px-2 py-1 text-[12px] ${
              project.status === "completed"
                ? "bg-emerald-500/10 text-emerald-600"
                : "text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {project.status === "completed" ? "Completed ✓" : "Mark Project Complete"}
          </button>
        </div>
        <TaskList
          tasks={projectTasks}
          tags={tags}
          projects={projects}
          areas={areas}
          showProjectPicker={false}
          quickAddDefaults={{ when: "anytime", projectId: project.id, areaId: null }}
          emptyMessage="No to-dos in this project yet."
        />
      </div>
    );
  }

  if (view.kind === "tag") {
    const tag = tags.find((t) => t.id === view.id);
    if (!tag) return null;
    const tagTasks = filteredBySearch.filter(
      (t) => !t.trashed && t.status === "open" && t.tagIds.includes(tag.id),
    );
    return (
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header icon={TagIcon} tint="text-purple-600" title={tag.name} count={tagTasks.length} />
        <TaskList
          tasks={tagTasks}
          tags={tags}
          projects={projects}
          areas={areas}
          emptyMessage="No to-dos with this tag."
        />
      </div>
    );
  }

  return null;
}

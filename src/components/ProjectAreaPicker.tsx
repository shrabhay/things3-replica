import { Folder } from "lucide-react";
import { Popover } from "./Popover";
import type { Area, Project, Task } from "../db/types";
import { updateTask } from "../db/actions";
import { sortByOrder } from "../lib/lists";

export function ProjectAreaPicker({
  task,
  projects,
  areas,
}: {
  task: Task;
  projects: Project[];
  areas: Area[];
}) {
  const current =
    projects.find((p) => p.id === task.projectId)?.title ??
    areas.find((a) => a.id === task.areaId)?.title ??
    null;

  const openProjects = sortByOrder(projects.filter((p) => !p.trashed && p.status === "open"));

  return (
    <Popover
      align="right"
      trigger={(open) => (
        <button
          onClick={open}
          className={`no-drag flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] ${
            current
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          <Folder size={12} />
          {current ?? "Project / Area"}
        </button>
      )}
    >
      {(close) => (
        <div className="max-h-64 w-56 overflow-y-auto">
          <button
            className="w-full rounded-md px-2 py-1.5 text-left text-[13px] text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => {
              updateTask(task.id, { projectId: null, areaId: null });
              close();
            }}
          >
            None
          </button>
          {sortByOrder(areas).map((area) => (
            <div key={area.id}>
              <button
                className="w-full truncate rounded-md px-2 py-1.5 text-left text-[13px] font-medium hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => {
                  updateTask(task.id, { areaId: area.id, projectId: null });
                  close();
                }}
              >
                {area.title}
              </button>
              {openProjects
                .filter((p) => p.areaId === area.id)
                .map((p) => (
                  <button
                    key={p.id}
                    className="w-full truncate rounded-md py-1.5 pl-6 pr-2 text-left text-[13px] hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => {
                      updateTask(task.id, { projectId: p.id, areaId: null });
                      close();
                    }}
                  >
                    {p.title}
                  </button>
                ))}
            </div>
          ))}
          {openProjects.filter((p) => !p.areaId).length > 0 && (
            <div>
              <p className="px-2 pt-1 text-[11px] uppercase text-neutral-400">Projects</p>
              {openProjects
                .filter((p) => !p.areaId)
                .map((p) => (
                  <button
                    key={p.id}
                    className="w-full truncate rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => {
                      updateTask(task.id, { projectId: p.id, areaId: null });
                      close();
                    }}
                  >
                    {p.title}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
    </Popover>
  );
}

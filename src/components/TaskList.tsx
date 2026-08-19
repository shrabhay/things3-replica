import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Area, Project, Tag, Task } from "../db/types";
import { reorderTasks } from "../db/actions";
import { sortByOrder } from "../lib/lists";
import { TaskRow } from "./TaskRow";
import { QuickAddRow } from "./QuickAddRow";
import type { NewTaskInput } from "../db/actions";

export function TaskList({
  tasks,
  tags,
  projects,
  areas,
  quickAddDefaults,
  showProjectPicker = true,
  emptyMessage = "Nothing here.",
}: {
  tasks: Task[];
  tags: Tag[];
  projects: Project[];
  areas: Area[];
  quickAddDefaults?: Partial<NewTaskInput>;
  showProjectPicker?: boolean;
  emptyMessage?: string;
}) {
  const sorted = sortByOrder(tasks);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sorted.map((t) => t.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...ids];
    next.splice(oldIndex, 1);
    next.splice(newIndex, 0, String(active.id));
    reorderTasks(next);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {quickAddDefaults && <QuickAddRow defaults={quickAddDefaults} />}
      {sorted.length === 0 ? (
        <p className="px-4 py-6 text-[13px] text-neutral-400">{emptyMessage}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {sorted.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                tags={tags}
                projects={projects}
                areas={areas}
                showProjectPicker={showProjectPicker}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

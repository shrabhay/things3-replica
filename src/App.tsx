import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db/db";
import { seedDemoDataIfEmpty } from "./db/seed";
import { createArea, createProject } from "./db/actions";
import { sortByOrder } from "./lib/lists";
import { Sidebar } from "./components/Sidebar";
import { MainPane } from "./components/MainPane";
import { QuickEntryModal } from "./components/QuickEntryModal";
import { useAppStore } from "./store/useAppStore";

export default function App() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const projects = useLiveQuery(() => db.projects.toArray(), [], []);
  const areas = useLiveQuery(() => db.areas.toArray(), [], []);
  const tags = useLiveQuery(() => db.tags.toArray(), [], []);
  const openQuickEntry = useAppStore((s) => s.openQuickEntry);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  useEffect(() => {
    seedDemoDataIfEmpty();
  }, []);

  useEffect(() => {
    async function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA"].includes(target.tagName);
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === "n" && !e.shiftKey) {
        e.preventDefault();
        openQuickEntry();
      } else if (e.key === "n" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openQuickEntry();
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "a") {
        // New Area
        e.preventDefault();
        const id = await createArea("New Area");
        setView({ kind: "area", id });
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        // New Project — inside the area currently being viewed (or its parent area,
        // if a project is open), falling back to the first area if none is in view.
        e.preventDefault();
        let areaId: string | null = null;
        if (view.kind === "area") {
          areaId = view.id;
        } else if (view.kind === "project") {
          areaId = projects?.find((p) => p.id === view.id)?.areaId ?? null;
        }
        if (!areaId && areas && areas.length > 0) {
          areaId = sortByOrder(areas)[0].id;
        }
        if (areaId) {
          const id = await createProject({ title: "New Project", areaId });
          setView({ kind: "project", id });
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openQuickEntry, view, areas, projects, setView]);

  const loading = !tasks || !projects || !areas || !tags;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-neutral-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <Sidebar tasks={tasks} projects={projects} areas={areas} tags={tags} />
      <MainPane tasks={tasks} projects={projects} areas={areas} tags={tags} />
      <QuickEntryModal />
    </div>
  );
}

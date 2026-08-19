import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db/db";
import { seedDemoDataIfEmpty } from "./db/seed";
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

  useEffect(() => {
    seedDemoDataIfEmpty();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA"].includes(target.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openQuickEntry();
      } else if (e.key === "n" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openQuickEntry();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openQuickEntry]);

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

import { useRef, useState, type ReactNode } from "react";
import { useClickOutside } from "../lib/useClickOutside";

interface PopoverProps {
  trigger: (open: () => void, isOpen: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
}

export function Popover({ trigger, children, align = "left" }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="relative inline-block" ref={ref}>
      {trigger(() => setOpen((o) => !o), open)}
      {open && (
        <div
          className={`absolute z-30 mt-1 min-w-[180px] rounded-lg border border-black/10 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-neutral-800 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

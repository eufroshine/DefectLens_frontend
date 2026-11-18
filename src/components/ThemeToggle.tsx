"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";

  const btn = (active: boolean) =>
    `flex h-7 w-7 items-center justify-center rounded-full transition-all ${
      active ? "bg-brand text-white shadow-xs" : "text-muted hover:text-ink"
    }`;

  return (
    <div role="group" aria-label="Tema tampilan" className="inline-flex items-center gap-1 rounded-full border border-line bg-card2 p-1">
      <button type="button" aria-label="Mode terang" title="Mode terang" onClick={() => setTheme("light")} className={btn(mounted && !dark)}>
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button type="button" aria-label="Mode gelap" title="Mode gelap" onClick={() => setTheme("dark")} className={btn(dark)}>
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

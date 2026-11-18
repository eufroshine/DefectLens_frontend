"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ApiStatus from "./ApiStatus";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Analisis", match: (p: string) => p === "/" || p.startsWith("/analyses") },
  { href: "/benchmark", label: "Benchmark PROMISE", match: (p: string) => p.startsWith("/benchmark") },
  { href: "/evaluasi", label: "Evaluasi Model", match: (p: string) => p.startsWith("/evaluasi") },
  { href: "/metodologi", label: "Metodologi", match: (p: string) => p.startsWith("/metodologi") },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-4 xl:flex-row xl:items-center xl:justify-between">
      <Link href="/" className="group flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-soft shadow-md shadow-brand/25 transition-transform group-hover:scale-105">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" strokeLinecap="round" />
            <path d="M9.5 9.5L8 11l1.5 1.5M12.5 9.5L14 11l-1.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="text-base font-extrabold leading-none tracking-tight">DEFECTLENS</div>
          <div className="mt-1 text-[11px] font-medium text-muted">Java Defect Risk Analyzer</div>
        </div>
      </Link>

      <nav
        aria-label="Navigasi utama"
        className="flex shrink-0 items-center gap-1 self-start overflow-x-auto rounded-full bg-[#181822] p-1.5 dark:border dark:border-[#222230] dark:bg-[#0d0d14] xl:self-auto"
      >
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all sm:px-4 ${
                active ? "bg-brand text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-2.5">
        <ApiStatus />
        <ThemeToggle />
        <Link
          href="/"
          className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand/25 transition-colors hover:bg-brand-2"
        >
          + Analisis Repo Baru
        </Link>
      </div>
    </header>
  );
}

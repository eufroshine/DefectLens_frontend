import type { ReactNode } from "react";
import type { Tier } from "@/lib/ranking";

// Warna pill tingkat risiko pada panel gelap.
export const TIER_STYLE: Record<Tier, string> = {
  tinggi: "bg-rose-500/20 text-rose-300",
  sedang: "bg-amber-500/20 text-amber-300",
  rendah: "bg-emerald-500/20 text-emerald-300",
};

export function Card({ className = "rounded-3xl p-5", children }: { className?: string; children: ReactNode }) {
  return <div className={`border border-line bg-card2 ${className}`}>{children}</div>;
}

export function StatCard({
  title,
  icon,
  value,
  sub,
  children,
}: {
  title: string;
  icon?: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card className="flex flex-col justify-between rounded-3xl p-5">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">{title}</span>
          {icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-brand">{icon}</span>
          )}
        </div>
        <div className="mt-2 font-mono text-2xl font-bold tracking-tight">{value}</div>
        {sub && <div className="mt-1 text-[11px] font-medium text-muted">{sub}</div>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </Card>
  );
}

export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-[26px]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-muted sm:text-[13px]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

const NOTICE_TONE = {
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  error: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
} as const;

export function Notice({ tone, children }: { tone: keyof typeof NOTICE_TONE; children: ReactNode }) {
  return <div className={`rounded-2xl border px-4 py-3 text-xs leading-relaxed ${NOTICE_TONE[tone]}`}>{children}</div>;
}

export function Loading({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line p-10 text-center text-xs text-muted">{text}</div>
  );
}

import { fmtValue } from "@/lib/ranking";
import type { ShapItem } from "@/lib/types";

// Batang divergen: kanan (merah) menaikkan skor, kiri (biru) menurunkan. Urut berdasarkan besar pengaruh.
export default function ShapBars({ items }: { items: ShapItem[] }) {
  const sorted = [...items].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const max = Math.max(...sorted.map((i) => Math.abs(i.contribution)), 1e-6);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-[10px] text-zinc-400">
        <span>Pengaruh fitur terhadap skor model</span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Menaikkan
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> Menurunkan
          </span>
        </span>
      </div>
      {sorted.map((it) => {
        const pos = it.contribution >= 0;
        const w = Math.min(100, (Math.abs(it.contribution) / max) * 100);
        return (
          <div key={it.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-zinc-200">
                {it.label} <span className="font-mono text-[11px] text-zinc-400">({fmtValue(it.value)})</span>
              </span>
              <span className={`shrink-0 font-mono text-[11px] font-semibold ${pos ? "text-rose-400" : "text-sky-400"}`}>
                {pos ? "+" : ""}
                {it.contribution.toFixed(4)}
              </span>
            </div>
            <div className="flex h-1.5 w-full items-center rounded-full bg-white/10">
              <div className="flex h-full w-1/2 justify-end border-r border-white/20 pr-0.5">
                {!pos && <div className="h-full rounded-l-full bg-sky-400" style={{ width: `${w}%` }} />}
              </div>
              <div className="flex h-full w-1/2 justify-start pl-0.5">
                {pos && <div className="h-full rounded-r-full bg-rose-400" style={{ width: `${w}%` }} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

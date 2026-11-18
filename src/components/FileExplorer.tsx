"use client";

import { ChevronDown, Download, Info, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { downloadCsv } from "@/lib/export";
import { rankRows, splitPath, TIER_HINT, TIER_LABEL, type Tier } from "@/lib/ranking";
import type { FileDetail, FileRow } from "@/lib/types";
import FileDetailPanel from "./FileDetailPanel";
import { TIER_STYLE } from "./ui";

type Props = {
  scope: string; // kunci cache SWR
  rows: FileRow[];
  loadDetail: (fileId: string) => Promise<FileDetail>;
  showTruth?: boolean;
  repoUrl?: string;
  exportName: string;
};

function Select({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: ReactNode }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-full border border-line bg-card2 py-2 pl-4 pr-8 text-xs font-medium transition-colors hover:border-brand focus:border-brand focus:outline-none"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
    </label>
  );
}

export default function FileExplorer({ scope, rows, loadDetail, showTruth = false, repoUrl, exportName }: Props) {
  const [tier, setTier] = useState<"all" | Tier>("all");
  const [pmd, setPmd] = useState<"all" | "any" | "high">("all");
  const [sort, setSort] = useState<"score" | "combined" | "pmd">("score");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(50);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ranked = useMemo(() => rankRows(rows), [rows]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = ranked.filter(
      (r) =>
        (tier === "all" || r.tier === tier) &&
        (pmd === "all" || (pmd === "any" ? r.pmdTotal > 0 : r.pmdHigh > 0)) &&
        (q === "" || r.path.toLowerCase().includes(q)),
    );
    if (sort === "combined") return [...list].sort((a, b) => b.combined - a.combined);
    if (sort === "pmd") return [...list].sort((a, b) => b.pmdTotal - a.pmdTotal || b.score - a.score);
    return list;
  }, [ranked, tier, pmd, sort, query]);

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0];
  const dirty = tier !== "all" || pmd !== "all" || sort !== "score" || query !== "";

  function reset() {
    setTier("all");
    setPmd("all");
    setSort("score");
    setQuery("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <Select label="Filter tingkat risiko" value={tier} onChange={(v) => setTier(v as "all" | Tier)}>
            <option value="all">Semua tingkat risiko</option>
            <option value="tinggi">Tinggi (10% teratas)</option>
            <option value="sedang">Sedang (10% sampai 30%)</option>
            <option value="rendah">Rendah (sisanya)</option>
          </Select>
          <Select label="Filter PMD" value={pmd} onChange={(v) => setPmd(v as "all" | "any" | "high")}>
            <option value="all">Semua file</option>
            <option value="any">Ada temuan PMD</option>
            <option value="high">Ada PMD prioritas tinggi</option>
          </Select>
          <Select label="Urutkan" value={sort} onChange={(v) => setSort(v as "score" | "combined" | "pmd")}>
            <option value="score">Urut: skor model</option>
            <option value="combined">Urut: gabungan model + PMD</option>
            <option value="pmd">Urut: temuan PMD</option>
          </Select>
          {dirty && (
            <button type="button" onClick={reset} className="rounded-full px-3 py-2 text-xs font-medium text-brand hover:underline">
              Reset filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full lg:w-64">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama file atau package..."
              aria-label="Cari file"
              className="w-full rounded-full border border-line bg-card2 py-2 pl-4 pr-10 text-xs transition-colors focus:border-brand focus:outline-none"
            />
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
          <button
            type="button"
            onClick={() => downloadCsv(exportName, filtered)}
            disabled={filtered.length === 0}
            title="Ekspor daftar yang sedang ditampilkan ke CSV"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-card2 px-3.5 py-2 text-xs font-medium transition-colors hover:border-brand disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      </div>

      <section className="rounded-[28px] bg-[#181822] p-4 text-white dark:border dark:border-[#222230] dark:bg-[#0d0d14] sm:p-6">
        <div className="flex flex-col items-stretch gap-5 lg:flex-row">
          <div className="flex w-full flex-col lg:w-[38%]">
            <div className="flex items-center justify-between px-1 pb-3.5">
              <h2 className="text-sm font-semibold tracking-tight">
                Peringkat file berisiko <span className="font-mono text-xs text-zinc-400">({filtered.length})</span>
              </h2>
              <span title={TIER_HINT} className="flex h-7 w-7 cursor-help items-center justify-center rounded-lg bg-[#232331] text-zinc-400 hover:text-white">
                <Info className="h-4 w-4" />
              </span>
            </div>

            <div className="max-h-[640px] flex-1 space-y-2.5 overflow-y-auto pr-1">
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-white/5 bg-[#222230] p-8 text-center text-xs text-zinc-400">
                  Tidak ada file yang cocok dengan filter saat ini.
                </div>
              )}
              {filtered.slice(0, limit).map((r) => {
                const isSel = selected?.id === r.id;
                const { name, dir } = splitPath(r.path);
                const truth = showTruth && typeof r.actualBug === "boolean";
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`flex w-full items-center justify-between gap-2.5 rounded-2xl px-3.5 py-3 text-left transition-all ${
                      isSel
                        ? "bg-brand shadow-lg shadow-brand/30"
                        : "border border-white/[0.04] bg-[#222230] hover:bg-[#282838] dark:border-[#262636] dark:bg-[#181824] dark:hover:bg-[#1f1f2e]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${isSel ? "bg-white/20" : "bg-[#2d2d3f] text-indigo-300 dark:bg-[#242436]"}`}>
                        #{r.rank}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-mono text-xs font-semibold sm:text-[13px]">{name}</div>
                        <div className={`mt-0.5 truncate font-mono text-[10px] ${isSel ? "text-indigo-100" : "text-zinc-400"}`}>{dir}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {r.pmdTotal > 0 && (
                        <span className={`hidden rounded-full px-2 py-0.5 font-mono text-[10px] font-medium sm:inline-flex ${isSel ? "bg-white/20" : "bg-white/5 text-zinc-300"}`}>
                          {r.pmdTotal} PMD
                        </span>
                      )}
                      {truth ? (
                        <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${isSel ? "bg-white text-[#181822]" : r.actualBug ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                          {r.actualBug ? "Bug" : "Bersih"}
                        </span>
                      ) : (
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${isSel ? "bg-white text-[#181822]" : TIER_STYLE[r.tier]}`}>
                          {TIER_LABEL[r.tier]}
                        </span>
                      )}
                      <span className="w-9 text-right font-mono text-xs font-bold sm:text-sm">{r.score.toFixed(2)}</span>
                    </div>
                  </button>
                );
              })}
              {filtered.length > limit && (
                <button
                  type="button"
                  onClick={() => setLimit((l) => l + 50)}
                  className="w-full rounded-2xl border border-white/10 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5"
                >
                  Tampilkan lebih banyak ({filtered.length - limit} tersisa)
                </button>
              )}
            </div>
          </div>

          {selected ? (
            <FileDetailPanel key={selected.id} row={selected} scope={scope} loadDetail={loadDetail} showTruth={showTruth} repoUrl={repoUrl} />
          ) : (
            <div className="flex w-full items-center justify-center rounded-3xl border border-white/10 bg-[#222230] p-8 text-xs text-zinc-400 dark:bg-[#181824] lg:w-[62%]">
              Pilih file Java di panel kiri untuk melihat penjelasan SHAP dan temuan PMD.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

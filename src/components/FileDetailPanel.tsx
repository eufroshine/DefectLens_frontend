"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { githubBlobUrl, splitPath, summarize, TIER_LABEL, type RankedRow } from "@/lib/ranking";
import type { FileDetail } from "@/lib/types";
import ShapBars from "./ShapBars";

type Props = {
  row: RankedRow;
  scope: string;
  loadDetail: (fileId: string) => Promise<FileDetail>;
  showTruth: boolean;
  repoUrl?: string;
};

const PRIORITY_STYLE: Record<number, string> = {
  1: "bg-rose-500/25 text-rose-300",
  2: "bg-amber-500/25 text-amber-300",
};

export default function FileDetailPanel({ row, scope, loadDetail, showTruth, repoUrl }: Props) {
  const { data, error, isLoading } = useSWR(["detail", scope, row.id], () => loadDetail(row.id), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const [tab, setTab] = useState<"shap" | "pmd">("shap");
  const [copied, setCopied] = useState(false);

  const { name } = splitPath(row.path);
  const link = repoUrl ? githubBlobUrl(repoUrl, row.path) : null;

  function copyPath() {
    navigator.clipboard?.writeText(row.path).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const tabBtn = (id: "shap" | "pmd") =>
    `rounded-full px-3 py-1 text-xs font-medium transition-colors ${
      tab === id ? "bg-brand text-white" : "text-zinc-300 hover:text-white"
    }`;

  return (
    <div className="flex w-full flex-col gap-5 rounded-3xl bg-gradient-to-br from-brand to-brand-2 p-5 text-white shadow-inner dark:from-[#4e42d4] dark:to-[#372da8] sm:p-7 lg:w-[62%]">
      <div className="space-y-2">
        <div className="text-[11px] font-medium text-indigo-100/90">Detail file terpilih</div>
        <div className="break-all font-mono text-lg font-bold tracking-tight sm:text-xl">{name}</div>
        <div className="break-all font-mono text-[11px] text-indigo-100/80">{row.path}</div>
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#181822]">
            Peringkat #{row.rank} · {Math.max(1, Math.round(row.share * 100))}% teratas · {TIER_LABEL[row.tier]}
          </span>
          {showTruth && typeof row.actualBug === "boolean" && (
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white ${
                row.actualBug ? "bg-rose-500" : "bg-emerald-500"
              }`}
            >
              PROMISE: {row.actualBug ? "Bermasalah" : "Bersih"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 border-y border-white/15 py-3">
        <div>
          <div className="text-[10px] text-indigo-100/80">Skor model</div>
          <div className="font-mono text-lg font-bold">{row.score.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[10px] text-indigo-100/80">Temuan PMD</div>
          <div className="font-mono text-lg font-bold">{row.pmdTotal}</div>
        </div>
        <div>
          <div className="text-[10px] text-indigo-100/80">PMD prioritas tinggi</div>
          <div className="font-mono text-lg font-bold">{row.pmdHigh}</div>
        </div>
      </div>

      {data && <p className="text-xs leading-relaxed text-indigo-50">{summarize(data)}</p>}

      <div className="space-y-3 rounded-2xl border border-white/15 bg-[#0d0d14]/90 p-4">
        <div className="inline-flex rounded-full bg-white/10 p-0.5">
          <button type="button" onClick={() => setTab("shap")} className={tabBtn("shap")}>
            Kenapa berisiko {data ? `(${data.shap.length})` : ""}
          </button>
          <button type="button" onClick={() => setTab("pmd")} className={tabBtn("pmd")}>
            Temuan PMD {data ? `(${data.pmd.length})` : ""}
          </button>
        </div>

        {isLoading && <div className="py-6 text-center text-xs text-zinc-400">Memuat detail...</div>}
        {error && (
          <div className="py-6 text-center text-xs text-zinc-400">
            {error instanceof Error ? error.message : "Detail tidak dapat dimuat."}
          </div>
        )}

        {data && tab === "shap" && (data.shap.length ? <ShapBars items={data.shap} /> : <Empty text="Tidak ada penjelasan SHAP." />)}

        {data && tab === "pmd" &&
          (data.pmd.length === 0 ? (
            <Empty text="Tidak ada temuan PMD pada file ini. Bisa juga berarti PMD gagal membaca kodenya." />
          ) : (
            <div className="max-h-72 divide-y divide-white/10 overflow-y-auto pr-1">
              {data.pmd.map((f, i) => (
                <div key={`${f.line}-${f.rule}-${i}`} className="space-y-1 py-2 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-200">Baris {f.line}</span>
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${PRIORITY_STYLE[f.priority] ?? "bg-white/10 text-zinc-300"}`}>
                      P{f.priority}
                    </span>
                    <span className="font-mono font-semibold text-indigo-200">{f.rule}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-300">{f.description}</p>
                </div>
              ))}
            </div>
          ))}
      </div>

      <div className="flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={copyPath}
          title="Salin path file"
          aria-label="Salin path file"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#181822] transition-colors hover:bg-indigo-50"
          >
            Buka di GitHub <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-6 text-center text-xs text-zinc-400">{text}</div>;
}

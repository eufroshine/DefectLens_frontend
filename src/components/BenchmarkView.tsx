"use client";

import { useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { recallAtTop } from "@/lib/ranking";
import FileExplorer from "./FileExplorer";
import { Card, Loading, Notice, PageTitle, StatCard } from "./ui";

export default function BenchmarkView() {
  const { data: sets, error } = useSWR("benchmarks", () => api.listBenchmarks(), { revalidateOnFocus: false });
  const [picked, setPicked] = useState<string | null>(null);
  const [truth, setTruth] = useState(true);

  const current = sets?.find((s) => s.id === picked) ?? sets?.[0];
  const currentId = current?.id;
  const { data: files, error: filesError } = useSWR(
    currentId ? ["bfiles", currentId] : null,
    () => api.getBenchmarkFiles(currentId as string),
    { revalidateOnFocus: false },
  );

  if (error) return <Notice tone="error">{error instanceof Error ? error.message : "Benchmark tidak dapat dimuat."}</Notice>;
  if (!sets || !current) return <Loading text="Memuat dataset benchmark..." />;

  const computed = files ? recallAtTop(files, 0.2) : null;
  const recall = computed ?? current.recallTop20 ?? null;
  
  return (
    <div className="space-y-6">
      <PageTitle
        title="Benchmark dataset PROMISE"
        subtitle="Empat proyek Apache dengan label defect asli. Model dilatih hanya dari rilis sebelumnya, lalu menilai rilis yang dipilih."
        right={
          <div className="flex flex-wrap items-center gap-2">
            {sets.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setPicked(s.id)}
                className={`rounded-full px-4 py-2 font-mono text-xs font-semibold transition-all ${
                  s.id === current.id
                    ? "bg-brand text-white shadow-md shadow-brand/25"
                    : "border border-line bg-card2 hover:border-brand"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="File dinilai" value={current.nEval} sub={`${current.project} rilis ${current.release}`} />
        <StatCard title="Data latih kronologis" value={current.nTrain} sub={`Rilis sebelum ${current.release}`} />
        <StatCard
          title="Bug ditemukan di 20% teratas"
          value={recall === null ? "-" : `${Math.round(recall * 100)}%`}
          sub={computed !== null ? "Dihitung dari label PROMISE pada daftar di bawah" : "Dari hasil prototipe. Pembanding acak: 20%"}
        />
        <StatCard title="Pembanding" value="20%" sub="Recall pengurutan acak pada 20% file teratas" />
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3">
        <span className="text-xs text-muted">Bandingkan skor model dengan label bug asli dari PROMISE:</span>
        <button type="button" onClick={() => setTruth((t) => !t)} className="inline-flex items-center gap-2.5" aria-pressed={truth}>
          <span className={`flex h-5 w-10 items-center rounded-full p-0.5 transition-colors ${truth ? "justify-end bg-brand" : "justify-start bg-zinc-400/50"}`}>
            <span className="h-4 w-4 rounded-full bg-white shadow-xs" />
          </span>
          <span className="text-xs font-semibold">Tampilkan label bug sebenarnya</span>
        </button>
      </Card>

      {files && files.length > 0 && files.length < current.nEval && (
        <Notice tone="info">
          Contoh menampilkan {files.length} dari {current.nEval} file untuk dataset ini.
        </Notice>
      )}
      {filesError && <Notice tone="error">{filesError instanceof Error ? filesError.message : "Daftar file tidak dapat dimuat."}</Notice>}
      {!files && !filesError && <Loading text="Memuat daftar file..." />}
      {files && files.length === 0 && <Notice tone="info">Daftar file untuk dataset ini belum tersedia.</Notice>}
      {files && files.length > 0 && (
        <FileExplorer
          key={current.id}
          scope={`b:${current.id}`}
          rows={files}
          loadDetail={(fid) => api.getBenchmarkFileDetail(current.id, fid)}
          showTruth={truth}
          exportName={`defectlens-benchmark-${current.id}`}
        />
      )}
    </div>
  );
}

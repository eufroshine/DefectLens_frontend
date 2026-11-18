
"use client";

import Link from "next/link";
import useSWR from "swr";
import { api } from "@/lib/api";
import FileExplorer from "./FileExplorer";
import JobProgress from "./JobProgress";
import KpiCards from "./KpiCards";
import { Loading, Notice, PageTitle } from "./ui";

export default function AnalysisView({ id }: { id: string }) {
  const { data: job, error } = useSWR(
    ["job", id],
    () => api.getAnalysis(id),
    {
      refreshInterval: (latest) => {
        if (!latest) return 1500;

        const finished = ["completed", "done", "error", "failed"].includes(
          latest.status
        );

        return finished ? 0 : 1500;
      },
      shouldRetryOnError: false,
      revalidateOnFocus: true,
    }
  );

  const done =
    job?.status === "completed" ||
    job?.status === "done";

  const failed =
    job?.status === "error" ||
    job?.status === "failed";

  const repositoryName =
    job?.summary?.repository ?? job?.name ?? "Repository";

  const warnings =
    job?.summary?.warnings ?? job?.warnings ?? [];

  const { data: files, error: filesError } = useSWR(
    done ? ["files", id] : null,
    () => api.getFiles(id),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
    }
  );

  if (error) {
    return (
      <Failure
        message={
          error instanceof Error
            ? error.message
            : "Analisis tidak ditemukan."
        }
      />
    );
  }

  if (!job) {
    return <Loading text="Memuat analisis..." />;
  }

  if (failed) {
    return (
      <Failure
        message={job.error ?? "Analisis gagal diproses."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Analisis risiko repository"
        subtitle="Prioritas pemeriksaan file Java berdasarkan metrik Lizard, riwayat Git 365 hari, dan penjelasan SHAP."
        right={
          <span className="self-start rounded-full bg-brand/10 px-3 py-1 font-mono text-xs font-semibold text-brand">
            {repositoryName}
          </span>
        }
      />

      {(job.status === "queued" || job.status === "running") && (
        <JobProgress step={job.step ?? 0} />
      )}

      {job.note && (
        <Notice tone="info">
          {job.note}
        </Notice>
      )}

      {warnings.map((warning: string, index: number) => (
        <Notice key={`${index}-${warning}`} tone="warn">
          {warning}
        </Notice>
      ))}

      {done && !files && !filesError && (
        <Loading text="Analisis selesai. Memuat daftar file..." />
      )}

      {filesError && (
        <Failure
          message={
            filesError instanceof Error
              ? filesError.message
              : "Daftar file tidak dapat dimuat."
          }
        />
      )}

      {done && files && (
        <>
          <KpiCards files={files} job={job} />

          <p className="text-[11px] leading-relaxed text-muted">
            Gunakan urutannya, bukan angkanya. Skor adalah keluaran
            model dan bukan probabilitas terkalibrasi. Repository ini
            tidak punya label bug sehingga benar atau salahnya tidak
            dapat diukur, dan temuan PMD adalah indikasi, bukan bukti bug.
          </p>

          <FileExplorer
            scope={`a:${id}`}
            rows={files}
            loadDetail={(fid) => api.getFileDetail(id, fid)}
            repoUrl={job.source}
            exportName={`defectlens-${repositoryName.replace(
              /[^A-Za-z0-9_.-]/g,
              "-"
            )}`}
          />
        </>
      )}
    </div>
  );
}

function Failure({ message }: { message: string }) {
  return (
    <div className="space-y-3">
      <Notice tone="error">{message}</Notice>

      <Link
        href="/"
        className="inline-block text-xs font-medium text-brand hover:underline"
      >
        Kembali ke halaman analisis
      </Link>
    </div>
  );
}

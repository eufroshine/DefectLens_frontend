
"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { api } from "@/lib/api";
import type { JobStatus } from "@/lib/types";
import { Card, Loading } from "./ui";

const STATUS: Record<JobStatus, { text: string; cls: string }> = {
  queued: {
    text: "Menunggu",
    cls: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  },
  running: {
    text: "Berjalan",
    cls: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  },
  completed: {
    text: "Selesai",
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  },
  done: {
    text: "Selesai",
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  },
  error: {
    text: "Gagal",
    cls: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  },
  failed: {
    text: "Gagal",
    cls: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  },
};

export default function RecentAnalyses() {
  const { data, error, mutate } = useSWR(
    "analyses",
    () => api.listAnalyses(),
    { shouldRetryOnError: false }
  );

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus riwayat analisis "${name}"?\n\nData hasil analisis ini tidak dapat dikembalikan.`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setDeleteError("");

    try {
      await api.deleteAnalysis(id);

      await mutate(
        (current) => current?.filter((job) => job.id !== id),
        { revalidate: false }
      );
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus riwayat analisis."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold">Analisis terbaru</h2>

      {deleteError && (
        <Card className="rounded-2xl border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-300">
          {deleteError}
        </Card>
      )}

      {!data && !error && <Loading />}

      {error && (
        <Card className="rounded-3xl p-5 text-xs text-muted">
          Riwayat analisis tidak dapat dimuat.
        </Card>
      )}

      {data && data.length === 0 && (
        <Card className="rounded-3xl p-5 text-xs text-muted">
          Belum ada analisis.
        </Card>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((job) => {
            const status = STATUS[job.status] ?? {
              text: job.status,
              cls: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
            };

            const jobName =
              job.name ||
              job.summary?.repository ||
              job.source;

            const fileCount =
              job.summary?.n_files ?? job.summary?.nFiles;

            const commits =
              job.summary?.commits ?? job.summary?.commits365;

            const isRunning = job.status === "running";
            const isDeleting = deletingId === job.id;

            return (
              <div
                key={job.id}
                className="rounded-3xl border border-line bg-card2 p-4 transition-colors hover:border-brand"
              >
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/analyses/${encodeURIComponent(job.id)}`}
                    className="min-w-0 flex-1 truncate font-mono text-xs font-semibold hover:text-brand"
                    title={jobName}
                  >
                    {jobName}
                  </Link>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.cls}`}
                    >
                      {status.text}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(job.id, jobName)}
                      disabled={isRunning || isDeleting}
                      title={
                        isRunning
                          ? "Analisis sedang berjalan"
                          : "Hapus riwayat"
                      }
                      aria-label={`Hapus riwayat ${jobName}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isDeleting ? (
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="3"
                            opacity="0.25"
                          />
                          <path
                            d="M21 12a9 9 0 0 0-9-9"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="m19 6-1 14H6L5 6" />
                          <path d="M10 11v5M14 11v5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <Link
                  href={`/analyses/${encodeURIComponent(job.id)}`}
                  className="mt-1 block"
                >
                  <div className="truncate text-[11px] text-muted">
                    {job.source}
                  </div>

                  {job.summary && (
                    <div className="mt-2 text-[11px] text-muted">
                      {fileCount ?? 0} file Java · {commits ?? 0} commit
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

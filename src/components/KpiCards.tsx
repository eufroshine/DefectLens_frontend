
"use client";

import {
  AlertCircle,
  BarChart3,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { median, rankRows } from "@/lib/ranking";
import type { FileRow, Job } from "@/lib/types";
import { StatCard } from "./ui";

function fmtDate(iso?: string) {
  if (!iso) return "Belum tersedia";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "Belum tersedia";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function KpiCards({
  files,
  job,
}: {
  files: FileRow[];
  job: Job;
}) {
  const s = useMemo(() => {
    const safeFiles = Array.isArray(files) ? files : [];

    const bins = Array.from(
      { length: 10 },
      (_, i) => ({
        range: (i / 10).toFixed(1),
        count: 0,
      })
    );

    for (const r of safeFiles) {
      const score = Number(r.score);

      if (!Number.isFinite(score)) continue;

      const index = Math.max(
        0,
        Math.min(
          bins.length - 1,
          Math.floor(score * 10)
        )
      );

      const bin = bins[index];

      if (bin) {
        bin.count += 1;
      }
    }

    const validScores = safeFiles
      .map((r) => Number(r.score))
      .filter((score) => Number.isFinite(score));

    const safeNumber = (value: unknown) => {
      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
    };

    return {
      high: rankRows(safeFiles).filter(
        (r) => r.tier === "tinggi"
      ).length,

      median: validScores.length
        ? median(validScores)
        : 0,

      bins,

      pmdTotal: safeFiles.reduce(
        (total, r) => total + safeNumber(r.pmdTotal),
        0
      ),

      withPmd: safeFiles.filter(
        (r) => safeNumber(r.pmdTotal) > 0
      ).length,

      withHigh: safeFiles.filter(
        (r) => safeNumber(r.pmdHigh) > 0
      ).length,
    };
  }, [files]);

  const commits =
    job.summary?.commits365 ??
    job.summary?.commits ??
    0;

  const lastCommit = job.summary?.lastCommit;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

      {/* Prioritas Tinggi */}
      <StatCard
        title="Prioritas tinggi"
        icon={<AlertCircle className="h-4 w-4" />}
        value={`${s.high} file`}
        sub={`10% teratas dari ${files.length} file Java. Periksa dulu file ini; urutan lebih penting daripada angka skor.`}
      />

      {/* Distribusi Skor */}
      <StatCard
        title="Distribusi skor model"
        icon={<BarChart3 className="h-4 w-4" />}
        value={s.median.toFixed(2)}
        sub="median skor"
      >
        <div className="h-[70px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={s.bins}
              margin={{
                top: 4,
                right: 0,
                bottom: 0,
                left: 0,
              }}
            >
              <XAxis
                dataKey="range"
                tickLine={false}
                axisLine={false}
                interval={1}
                tick={{
                  fill: "var(--muted)",
                  fontSize: 9,
                }}
              />

              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="count"
                name="Jumlah file"
                fill="#6e64f8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </StatCard>

      {/* Aktivitas Git */}
      <StatCard
        title="Aktivitas Git (365 hari)"
        icon={<Clock className="h-4 w-4" />}
        value={`${commits} commit`}
        sub={
          lastCommit
            ? `Commit terakhir ${fmtDate(lastCommit)}`
            : "Informasi commit terakhir belum tersedia"
        }
      />

      {/* Temuan PMD */}
      <StatCard
        title="Temuan PMD"
        icon={<ShieldCheck className="h-4 w-4" />}
        value={`${s.pmdTotal} temuan`}
        sub={`${s.withPmd} file bertemuan, ${s.withHigh} berprioritas tinggi (P1 sampai P2). Indikasi, bukan bukti bug.`}
      />

    </div>
  );
}

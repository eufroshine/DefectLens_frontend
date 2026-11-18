import type { RankedRow } from "./ranking";

export function downloadCsv(name: string, rows: RankedRow[]) {
  const head = ["peringkat", "file", "skor_model", "tingkat", "temuan_pmd", "pmd_prioritas_tinggi", "alasan"];
  const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = rows.map((r) =>
    [r.rank, r.path, r.score.toFixed(4), r.tier, r.pmdTotal, r.pmdHigh, r.reasons ?? ""].map(esc).join(","),
  );
  const csv = "\ufeff" + [head.map(esc).join(","), ...lines].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

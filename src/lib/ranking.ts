import type { FileDetail, FileRow } from "./types";

export type Tier = "tinggi" | "sedang" | "rendah";

export type RankedRow = FileRow & {
  rank: number;
  share: number;
  tier: Tier;
  combined: number;
};

export const TIER_LABEL: Record<Tier, string> = {
  tinggi: "Tinggi",
  sedang: "Sedang",
  rendah: "Rendah",
};

export const TIER_HINT =
  "Tingkat risiko ditentukan oleh peringkat: 10% teratas = Tinggi, 10% sampai 30% = Sedang, sisanya Rendah. Skor model bukan probabilitas.";

const CUT_HIGH = 0.1;
const CUT_MID = 0.3;

// Persentil peringkat rata-rata (sama dengan pandas rank(pct=True)).
function pctRank(values: number[]): number[] {
  const order = values
    .map((v, i) => [v, i] as const)
    .sort((a, b) => a[0] - b[0]);

  const out = new Array<number>(values.length).fill(0);

  let i = 0;

  while (i < order.length) {
    let j = i;

    while (
      j + 1 < order.length &&
      order[j + 1][0] === order[i][0]
    ) {
      j++;
    }

    const avg = (i + j) / 2 + 1;

    for (let k = i; k <= j; k++) {
      out[order[k][1]] = avg / values.length;
    }

    i = j + 1;
  }

  return out;
}

export function rankRows(rows: FileRow[]): RankedRow[] {
  const n = rows.length;

  if (n === 0) {
    return [];
  }

  const ps = pctRank(rows.map((r) => r.score));
  const pm = pctRank(rows.map((r) => r.pmdTotal));

  return rows
    .map((r, i) => ({
      ...r,
      combined: 0.5 * ps[i] + 0.5 * pm[i],
    }))
    .sort((a, b) => b.score - a.score)
    .map((r, i) => {
      const share = (i + 1) / n;

      const tier: Tier =
        share <= CUT_HIGH
          ? "tinggi"
          : share <= CUT_MID
            ? "sedang"
            : "rendah";

      return {
        ...r,
        rank: i + 1,
        share,
        tier,
      };
    });
}

// Recall pada k% file teratas.
// Null bila label bug sebenarnya tidak lengkap.
export function recallAtTop(
  rows: FileRow[],
  k: number
): number | null {
  if (
    rows.length === 0 ||
    rows.some((r) => typeof r.actualBug !== "boolean")
  ) {
    return null;
  }

  const total = rows.filter((r) => r.actualBug).length;

  if (total === 0) {
    return null;
  }

  const n = Math.max(1, Math.round(rows.length * k));

  const top = [...rows]
    .sort((a, b) => b.score - a.score)
    .slice(0, n);

  return top.filter((r) => r.actualBug).length / total;
}

export function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);

  return s.length % 2
    ? s[m]
    : (s[m - 1] + s[m]) / 2;
}

// Memisahkan nama file dan direktori.
export function splitPath(path: string) {
  const safePath = typeof path === "string" ? path : "";

  const i = safePath.lastIndexOf("/");

  return {
    name: i >= 0 ? safePath.slice(i + 1) : safePath,
    dir: i >= 0 ? safePath.slice(0, i) : "",
  };
}

export function fmtValue(v: number | string): string {
  return typeof v === "number"
    ? v.toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      })
    : v;
}

export function githubBlobUrl(
  repoUrl: string,
  path: string
): string | null {
  const match = repoUrl.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/
  );

  if (!match) {
    return null;
  }

  return `https://github.com/${match[1]}/${match[2]}/blob/HEAD/${path}`;
}

// Ringkasan otomatis dari kontribusi SHAP dan temuan PMD.
export function summarize(d: FileDetail): string {
  const label = (s: {
    label: string;
    value: number | string;
  }) => `${s.label} (${fmtValue(s.value)})`;

  const up = d.shap
    .filter((s) => s.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 2);

  const down = d.shap
    .filter((s) => s.contribution < 0)
    .sort((a, b) => a.contribution - b.contribution)
    .slice(0, 1);

  const parts: string[] = [];

  if (up.length) {
    parts.push(
      `Skor dinaikkan terutama oleh ${up.map(label).join(" dan ")}.`
    );
  }

  if (down.length) {
    parts.push(
      `Diturunkan oleh ${down.map(label).join(", ")}.`
    );
  }

  if (d.pmdTotal > 0) {
    const high =
      d.pmdHigh > 0
        ? `, ${d.pmdHigh} berprioritas tinggi`
        : "";

    parts.push(
      `PMD mencatat ${d.pmdTotal} temuan${high} (indikasi, bukan bukti bug).`
    );
  } else {
    parts.push("PMD tidak mencatat temuan pada file ini.");
  }

  return parts.join(" ");
}
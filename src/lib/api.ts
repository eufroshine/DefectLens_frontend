import * as mock from "./mock";

import type {
  BenchmarkMeta,
  FileDetail,
  FileRow,
  Health,
  Job,
  PmdFinding,
  ShapItem,
} from "./types";

// Status analisis yang didukung backend.
export type AnalysisStatus = Job["status"];

export interface AnalysisSummary {
  repository: string;
  n_files: number;
  commits: number;
  warnings: string[];
}

// API Base URL
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// Tanpa NEXT_PUBLIC_API_URL aplikasi berjalan dalam mode demo.
export const isDemo = BASE === "";

// Encode URL parameter
const enc = encodeURIComponent;

// Membantu memastikan data merupakan object.
function asObject(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
}

// Mengubah nilai menjadi number yang valid.
function asNumber(value: unknown, fallback = 0): number {
  const result = Number(value);

  return Number.isFinite(result) ? result : fallback;
}

// HTTP Request
async function http<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let msg = `Permintaan gagal (${res.status})`;

    try {
      const j = await res.json();

      if (j?.detail) {
        msg =
          typeof j.detail === "string"
            ? j.detail
            : JSON.stringify(j.detail);
      }
    } catch {
      // Abaikan jika respons bukan JSON.
    }

    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

// HTTP Request untuk endpoint yang mengembalikan array.
// Mendukung:
// 1. [{...}, {...}]
// 2. { items: [{...}, {...}] }
async function httpList<T>(path: string): Promise<T[]> {
  const data = await http<unknown>(path);

  if (Array.isArray(data)) {
    return data as T[];
  }

  const object = asObject(data);

  if (Array.isArray(object.items)) {
    return object.items as T[];
  }

  throw new Error(`Format respons API tidak valid: ${path}`);
}

// Normalisasi data file dari format FastAPI ke format frontend.
function normalizeFile(data: unknown): FileRow {
  const row = asObject(data);

  const actualBug =
    typeof row.actual_bug === "boolean"
      ? row.actual_bug
      : typeof row.actualBug === "boolean"
        ? row.actualBug
        : undefined;

  return {
    id: String(row.id ?? ""),
    path: String(row.file ?? row.path ?? ""),
    score: asNumber(row.risk_score ?? row.score),
    percentile: asNumber(
      row.percentile,
      Number.NaN
    ),
    pmdTotal: asNumber(row.pmd_total ?? row.pmdTotal),
    pmdHigh: asNumber(row.pmd_high ?? row.pmdHigh),
    reasons: String(row.reason ?? row.reasons ?? ""),
    ...(actualBug !== undefined ? { actualBug } : {}),
  };
}

// Normalisasi data SHAP.
function normalizeShap(data: unknown): ShapItem {
  const item = asObject(data);

  const value = item.value;

  return {
    label: String(item.feature ?? item.label ?? ""),
    value:
      typeof value === "number" || typeof value === "string"
        ? value
        : String(value ?? ""),
    contribution: asNumber(item.contribution),
  };
}

// Normalisasi temuan PMD.
function normalizePmd(data: unknown): PmdFinding {
  const item = asObject(data);

  return {
    line: asNumber(item.Line ?? item.line),
    priority: asNumber(item.Priority ?? item.priority),
    rule: String(item.Rule ?? item.rule ?? ""),
    description: String(
      item.Description ?? item.description ?? ""
    ),
  };
}

// Normalisasi detail file.
function normalizeFileDetail(data: unknown): FileDetail {
  const detail = asObject(data);

  const shapData = Array.isArray(detail.shap)
    ? detail.shap
    : [];

  const pmdData = Array.isArray(detail.pmd_findings)
    ? detail.pmd_findings
    : Array.isArray(detail.pmd)
      ? detail.pmd
      : [];

  return {
    ...normalizeFile(detail),
    shap: shapData.map(normalizeShap),
    pmd: pmdData.map(normalizePmd),
  };
}

// API Services
export const api = {
  // Health Check
  health: (): Promise<Health> =>
    isDemo
      ? mock.health()
      : http<Health>("/health"),

  // Analysis
  listAnalyses: (): Promise<Job[]> =>
    isDemo
      ? mock.listAnalyses()
      : httpList<Job>("/api/analyses"),

  createAnalysis: (source: string): Promise<Job> =>
    isDemo
      ? mock.createAnalysis(source)
      : http<Job>("/api/analyses", {
          method: "POST",
          body: JSON.stringify({ source }),
        }),

  getAnalysis: (id: string): Promise<Job> =>
    isDemo
      ? mock.getAnalysis(id)
      : http<Job>(`/api/analyses/${enc(id)}`),

  deleteAnalysis: (
    id: string
  ): Promise<{ id: string; message: string }> =>
    isDemo
      ? Promise.reject(
          new Error("Fitur hapus tidak tersedia dalam mode demo.")
        )
      : http<{ id: string; message: string }>(
          `/api/analyses/${enc(id)}`,
          {
            method: "DELETE",
          }
        ),

  // Analysis Files
  getFiles: async (id: string): Promise<FileRow[]> => {
    if (isDemo) {
      return mock.getFiles(id);
    }

    const data = await httpList<unknown>(
      `/api/analyses/${enc(id)}/files`
    );

    return data.map(normalizeFile);
  },

  getFileDetail: async (
    id: string,
    fileId: string
  ): Promise<FileDetail> => {
    if (isDemo) {
      return mock.getFileDetail(id, fileId);
    }

    const data = await http<unknown>(
      `/api/analyses/${enc(id)}/files/${enc(fileId)}`
    );

    return normalizeFileDetail(data);
  },

  // Benchmark
  listBenchmarks: (): Promise<BenchmarkMeta[]> =>
    isDemo
      ? mock.listBenchmarks()
      : httpList<BenchmarkMeta>("/api/benchmark"),

  getBenchmarkFiles: async (
    id: string
  ): Promise<FileRow[]> => {
    if (isDemo) {
      return mock.getBenchmarkFiles(id);
    }

    const data = await httpList<unknown>(
      `/api/benchmark/${enc(id)}/files`
    );

    return data.map(normalizeFile);
  },

  getBenchmarkFileDetail: async (
    id: string,
    fileId: string
  ): Promise<FileDetail> => {
    if (isDemo) {
      return mock.getBenchmarkFileDetail(id, fileId);
    }

    const data = await http<unknown>(
      `/api/benchmark/${enc(id)}/files/${enc(fileId)}`
    );

    return normalizeFileDetail(data);
  },
};
export type JobStatus =
  | "queued"
  | "running"
  | "completed"
  | "done"
  | "error"
  | "failed";

export type Job = {
  id: string;
  source: string;
  status: JobStatus;

  // Format backend FastAPI
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
  error?: string | null;

  summary?: {
    repository?: string;
    n_files?: number;
    commits?: number;
    warnings?: string[];

    // Kompatibilitas frontend sebelumnya
    nFiles?: number;
    commits365?: number;
    lastCommit?: string;
    durationS?: number;
  } | null;

  // Kompatibilitas frontend sebelumnya
  step?: number;
  name?: string;
  createdAt?: string;
  warnings?: string[];
  note?: string;
};

export type FileRow = {
  id: string;
  path: string;
  score: number;
  percentile?: number;
  pmdTotal: number;
  pmdHigh: number;
  reasons?: string;
  actualBug?: boolean;
};

export type ShapItem = {
  label: string;
  value: number | string;
  contribution: number;
};

export type PmdFinding = {
  line: number;
  priority: number;
  rule: string;
  description: string;
};

export type FileDetail = FileRow & {
  shap: ShapItem[];
  pmd: PmdFinding[];
};

export type BenchmarkMeta = {
  id: string;
  label: string;
  project: string;
  release: string;
  nEval: number;
  nTrain: number;
  recallTop20?: number;
};

export type Health = {
  status: string;
  modelVersion?: string;
  message?: string;
  model_loaded?: boolean;
  model_training_rows?: number;
};
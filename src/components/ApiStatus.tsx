"use client";

import useSWR from "swr";
import { api, isDemo } from "@/lib/api";

export default function ApiStatus() {
  const { data, error } = useSWR(isDemo ? null : "health", () => api.health(), {
    refreshInterval: 15000,
    shouldRetryOnError: false,
  });

  let dot = "bg-zinc-400";
  let text = "Memeriksa API...";
  if (isDemo) {
    dot = "bg-amber-500";
    text = "Mode demo";
  } else if (error) {
    dot = "bg-rose-500";
    text = "API tidak terhubung";
  } else if (data) {
    dot = "bg-emerald-500 animate-pulse";
    text = "API terhubung";
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card2 px-3.5 py-2 text-xs font-medium">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span>{text}</span>
    </div>
  );
}

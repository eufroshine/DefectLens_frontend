import { isDemo } from "@/lib/api";
import { Notice } from "./ui";

export default function DemoBanner() {
  if (!isDemo) return null;
  return (
    <Notice tone="warn">
      Mode demo: data contoh dari hasil prototipe (commons-cli dan ant 1.7), dan sebagian detail file tidak tersedia. Atur
      NEXT_PUBLIC_API_URL ke alamat FastAPI untuk analisis nyata.
    </Notice>
  );
}

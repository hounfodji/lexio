import type { CefrLevel } from "@/lib/types";

// Pastille du niveau CECRL (style maquette).
export function CefrBadge({ level }: { level: CefrLevel | null }) {
  if (!level) return null;
  return (
    <span className="rounded-full bg-info-muted px-2 py-0.5 text-[11px] font-medium text-info">
      {level}
    </span>
  );
}

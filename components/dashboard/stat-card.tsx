import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "info" | "success" | "warning";
}) {
  return (
    <div className="rounded-lg bg-secondary p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          accent === "info" && "text-info",
          accent === "success" && "text-success",
          accent === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
    </div>
  );
}

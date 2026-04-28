import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  small,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "teal";
  small?: boolean;
}) {
  const tones = {
    neutral: "border-border bg-muted text-foreground",
    green:   "bg-green-50 text-green-800 border-green-200",
    amber:   "bg-amber-50 text-amber-900 border-amber-200",
    red:     "bg-red-50 text-red-800 border-red-200",
    teal:    "border-[#a5f3fc] bg-[#cffafe] text-[#0f6175]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium whitespace-nowrap",
        small ? "px-1.5 py-px text-[11px]" : "px-2 py-0.5 text-[12px]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

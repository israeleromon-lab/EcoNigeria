import * as React from "react"
import { cn } from "@/lib/utils"

export interface SourceBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  source: string
  frequency?: string
}

export function getSourceAbbreviation(source?: string): string {
  if (!source) return "DATA"
  const s = source.toUpperCase()
  if (s.includes("CBN")) return "CBN"
  if (s.includes("NBS")) return "NBS"
  if (s.includes("FMDQ") || s.includes("EXCHANGE RATE")) return "FMDQ · FX"
  if (s.includes("FRED")) return "FRED"
  if (s.includes("WORLD BANK") || s === "WB") return "WB"
  if (s.includes("ACLED")) return "ACLED"
  return source.substring(0, 6).toUpperCase()
}

export function SourceBadge({ source, frequency, className, ...props }: SourceBadgeProps) {
  const abbreviation = getSourceAbbreviation(source)
  let colorClass = "border-white/15 bg-white/[0.03] text-muted-foreground"

  if (abbreviation === "CBN" || abbreviation === "NBS") {
    colorClass = "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  } else if (abbreviation === "FRED") {
    colorClass = "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  } else if (abbreviation === "FMDQ · FX") {
    colorClass = "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300"
  } else if (abbreviation === "WB") {
    colorClass = "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300"
  }

  const baseBadgeClass = "inline-flex items-center text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 border"

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <span className={cn(baseBadgeClass, colorClass)}>
        {abbreviation}
      </span>
      {frequency && (
        <span className={cn(baseBadgeClass, "border-border bg-muted/40 text-muted-foreground")}>
          {frequency}
        </span>
      )}
    </div>
  )
}


import * as React from "react"
import { cn } from "@/lib/utils"

export interface SourceBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  source: string
  frequency?: string
}

export function SourceBadge({ source, frequency, className, ...props }: SourceBadgeProps) {
  let abbreviation = source.substring(0, 4).toUpperCase()
  let colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"

  switch (source) {
    case 'World Bank':
      abbreviation = 'WB'
      colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      break
    case 'FRED':
      abbreviation = 'FRED'
      colorClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      break
    case 'Exchange Rate API':
      abbreviation = 'FX API'
      colorClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      break
    case 'ACLED/Proxy':
      abbreviation = 'ACLED'
      colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      break
    case 'CBN':
      abbreviation = 'CBN'
      colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      break
    case 'NBS':
      abbreviation = 'NBS'
      colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      break
  }

  const baseBadgeClass = "inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5"

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <span className={cn(baseBadgeClass, colorClass)}>
        {abbreviation}
      </span>
      {frequency && (
        <span className={cn(baseBadgeClass, "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300")}>
          {frequency}
        </span>
      )}
    </div>
  )
}

import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StaleWarningProps extends React.HTMLAttributes<HTMLDivElement> {
  period: string
  frequency?: string
}

export function StaleWarning({ period, frequency, className, ...props }: StaleWarningProps) {
  return (
    <div className={cn("text-xs font-serif text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-2", className)} {...props}>
      <AlertTriangle className="w-3 h-3" />
      <span>Data from {period} — may not reflect current conditions</span>
    </div>
  )
}

'use client'

import * as React from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface MethodologyDialogProps {
  indicatorName: string
  methodology: string
  source: string
  frequency: string
}

export function MethodologyDialog({
  indicatorName,
  methodology,
  source,
  frequency
}: MethodologyDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Info className="h-4 w-4" />
          <span className="sr-only">About {indicatorName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wider">About {indicatorName}</DialogTitle>
          <DialogDescription className="font-serif">
            {methodology}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 mt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2 text-sm font-serif">
            <div>
              <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-muted-foreground block">Source</span>
              {source}
            </div>
            <div>
              <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-muted-foreground block">Frequency</span>
              {frequency}
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-serif italic">
            For discrepancies with other sources, differences in reporting lag, methodology, or observation period may apply.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import React from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({ title = "Something went wrong", description, actionLabel, onAction }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-error/5 border border-error/20 rounded-xl">
      <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-error" />
      </div>
      <h3 className="text-xl font-semibold text-ink mb-2">{title}</h3>
      <p className="text-text-secondary mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className="border-error text-error hover:bg-error/10">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

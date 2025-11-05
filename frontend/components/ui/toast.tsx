// frontend/components/ui/toast.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export interface ToastProps {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success" | "warning"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToastType = "success" | "error" | "warning" | "info"

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ToastProps
>(({ className, variant = "default", title, description, action, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(true)

  if (!isOpen) return null

  const variantIcons = {
    default: Info,
    success: CheckCircle,
    destructive: AlertCircle,
    warning: AlertTriangle,
  }

  const variantStyles = {
    default: "border bg-background",
    success: "border border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50",
    destructive: "border border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50",
    warning: "border border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-50",
  }

  const IconComponent = variantIcons[variant]

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full max-w-sm p-4 shadow-lg rounded-lg border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm">{description}</div>}
          {action && <div className="pt-2">{action}</div>}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="inline-flex rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})
Toast.displayName = "Toast"

// Toast Hook
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7)
    
    const variantMap = {
      success: "success",
      error: "destructive",
      warning: "warning",
      info: "default"
    } as const

    const newToast: ToastProps = {
      id,
      title: type === "error" ? "Error" : 
             type === "success" ? "Success" :
             type === "warning" ? "Warning" : "Info",
      description: message,
      variant: variantMap[type],
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 5000)
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          description={toast.description}
        />
      ))}
    </div>
  )

  return {
    toast,
    ToastContainer
  }
}

export { Toast }
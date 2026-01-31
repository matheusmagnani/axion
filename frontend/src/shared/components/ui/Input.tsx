import * as React from "react"
import { cn } from "@/shared/utils/cn"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-secondary/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full py-3 bg-background/50 border border-secondary/30 rounded-[10px]",
              "text-secondary placeholder:text-secondary/40",
              "outline-none transition-all duration-300",
              "focus:border-secondary focus:bg-background/80",
              "hover:border-secondary/50",
              icon ? "pl-12 pr-4" : "px-4",
              error && "border-red-500/50 focus:border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-400">{error}</span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

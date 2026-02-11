import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@shared/utils/cn"

function ButtonGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="button-group"
      className={cn(
        "inline-flex items-center justify-center -space-x-px rounded-lg shadow-xs",
        "[&_[data-slot=button]:not(:only-child)]:rounded-none",
        "[&_[data-slot=button]:not(:only-child):first-child]:rounded-l-lg",
        "[&_[data-slot=button]:not(:only-child):last-child]:rounded-r-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ButtonGroupSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="button-group-separator"
      orientation="vertical"
      className={cn("bg-app-secondary/30 w-px h-6 self-center", className)}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator }

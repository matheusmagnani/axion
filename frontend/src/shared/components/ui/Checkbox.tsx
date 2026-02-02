import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "@/shared/utils/cn"

type CheckboxSize = "sm" | "md" | "lg"

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  size?: CheckboxSize
  animated?: boolean
}

const sizeConfig = {
  sm: { box: "h-[18px] w-[18px]", icon: 10, stroke: 1.2 },
  md: { box: "h-[22px] w-[22px]", icon: 12, stroke: 1.5 },
  lg: { box: "h-[28px] w-[28px]", icon: 16, stroke: 2 },
}

// Componente de check com animação de desenho
const AnimatedCheck = ({ size = 12, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    className="animated-check"
  >
    <path
      d="M2 6.5L4.5 9L10 3"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="check-path"
    />
    <style>{`
      .check-path {
        stroke-dasharray: 14;
        stroke-dashoffset: 14;
        animation: drawCheck 0.4s ease-out forwards;
      }
      
      @keyframes drawCheck {
        to {
          stroke-dashoffset: 0;
        }
      }
    `}</style>
  </svg>
)

// Componente de check estático
const StaticCheck = ({ size = 12, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
  >
    <path
      d="M2 6.5L4.5 9L10 3"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = "md", animated = true, ...props }, ref) => {
  const config = sizeConfig[size]
  
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "grid place-content-center peer shrink-0 rounded-[4px] border border-app-secondary/40 bg-transparent",
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-app-secondary/30 data-[state=checked]:border-app-secondary",
        "hover:border-app-secondary/60 transition-all cursor-pointer",
        config.box,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("grid place-content-center text-app-secondary")}
      >
        {animated ? (
          <AnimatedCheck size={config.icon} strokeWidth={config.stroke} />
        ) : (
          <StaticCheck size={config.icon} strokeWidth={config.stroke} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
export type { CheckboxProps, CheckboxSize }

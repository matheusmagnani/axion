import * as React from "react"
import { X, Eye, EyeSlash } from "@phosphor-icons/react"
import { cn } from "@/shared/utils/cn"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, value, onChange, onClear, type, disabled, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef
    const hasValue = value !== undefined ? String(value).length > 0 : false
    const isPassword = type === 'password'
    const [showPassword, setShowPassword] = React.useState(false)

    const handleClear = () => {
      if (onClear) {
        onClear()
      } else if (onChange) {
        const nativeEvent = new Event('input', { bubbles: true })
        Object.defineProperty(nativeEvent, 'target', { value: { value: '' } })
        onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
      }
      inputRef.current?.focus()
    }

    return (
      <div className={cn("flex flex-col gap-2", disabled && "opacity-50 cursor-not-allowed")}>
        {label && (
          <label className="text-sm font-medium text-app-secondary/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-app-secondary/50">
              {icon}
            </div>
          )}
          <input
            ref={inputRef}
            value={value}
            onChange={onChange}
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              "w-full py-3 bg-app-bg/50 border border-app-secondary/30 rounded-[10px]",
              "text-app-secondary placeholder:text-app-secondary/40",
              "outline-none transition-all duration-300",
              "focus:border-app-secondary focus:bg-app-bg/80",
              "hover:border-app-secondary/50",
              icon ? "pl-12" : "px-4",
              (hasValue || isPassword) ? "pr-10" : "pr-4",
              error && "border-red-500/50 focus:border-red-500",
              className
            )}
            disabled={disabled}
            {...props}
          />
          {disabled ? null : isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-app-secondary/40 hover:text-app-secondary transition-colors"
            >
              {showPassword ? (
                <EyeSlash className="w-5 h-5" weight="regular" />
              ) : (
                <Eye className="w-5 h-5" weight="regular" />
              )}
            </button>
          ) : hasValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-app-secondary/40 hover:text-app-secondary transition-colors"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
          ) : null}
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

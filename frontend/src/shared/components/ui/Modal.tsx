import * as React from "react"
import { X } from "@phosphor-icons/react"
import { cn } from "@/shared/utils/cn"
import { MagicBentoCard } from "./MagicBentoCard"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
  enableMagicBento?: boolean
}

export function Modal({ isOpen, onClose, children, title, className, enableMagicBento = true }: ModalProps) {
  // Block body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const modalContent = (
    <>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-secondary">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary/10 rounded-lg transition-colors relative z-10"
          >
            <X className="w-5 h-5 text-secondary" weight="bold" />
          </button>
        </div>
      )}
      
      {/* Close button if no title */}
      {!title && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-secondary/10 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-secondary" weight="bold" />
        </button>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay with blur - doesn't close on click */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
      />
      
      {/* Modal */}
      {enableMagicBento ? (
        <MagicBentoCard
          className={cn(
            "relative z-10 bg-primary border border-secondary/30 rounded-[15px] p-6",
            "min-w-[320px] max-w-[90vw] max-h-[90vh] overflow-auto",
            "animate-modalIn shadow-2xl",
            className
          )}
        >
          {modalContent}
        </MagicBentoCard>
      ) : (
        <div 
          className={cn(
            "relative z-10 bg-primary border border-secondary/50 rounded-[15px] p-6",
            "min-w-[320px] max-w-[90vw] max-h-[90vh] overflow-auto",
            "animate-modalIn shadow-2xl",
            className
          )}
        >
          {modalContent}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(10px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .animate-modalIn {
          animation: modalIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

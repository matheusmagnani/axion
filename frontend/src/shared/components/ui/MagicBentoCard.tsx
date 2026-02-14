import { useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/shared/utils/cn';

interface MagicBentoCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  spotlightRadius?: number;
  enableBorderGlow?: boolean;
}

const DEFAULT_GLOW_COLOR = '230, 194, 132';
const DEFAULT_SPOTLIGHT_RADIUS = 300;

export function MagicBentoCard({
  children,
  className,
  glowColor = DEFAULT_GLOW_COLOR,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  enableBorderGlow = true,
}: MagicBentoCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'magic-bento-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.03) 0%,
        rgba(${glowColor}, 0.015) 30%,
        transparent 60%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      
      const isInside = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom;

      if (!isInside) {
        gsap.to(spotlight, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        container.style.setProperty('--glow-intensity', '0');
        return;
      }

      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;

      container.style.setProperty('--glow-x', `${relativeX}%`);
      container.style.setProperty('--glow-y', `${relativeY}%`);
      container.style.setProperty('--glow-intensity', '1');
      container.style.setProperty('--glow-radius', `${spotlightRadius}px`);
      container.style.setProperty('--glow-color', glowColor);

      gsap.to(spotlight, {
        left: e.clientX,
        top: e.clientY,
        opacity: 0.5,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      container.style.setProperty('--glow-intensity', '0');
      gsap.to(spotlight, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      spotlight.parentNode?.removeChild(spotlight);
    };
  }, [glowColor, spotlightRadius]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "magic-bento-card relative overflow-hidden",
        enableBorderGlow && "magic-bento-card--border-glow",
        className
      )}
      style={{
        '--glow-x': '50%',
        '--glow-y': '50%',
        '--glow-intensity': '0',
        '--glow-radius': `${spotlightRadius}px`,
        '--glow-color': glowColor,
      } as CSSProperties}
    >
      {children}

      <style>{`
        .magic-bento-card {
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 200px;
          --glow-color: 230, 194, 132;
        }

        .magic-bento-card--border-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: radial-gradient(
            var(--glow-radius) circle at var(--glow-x) var(--glow-y),
            rgba(var(--glow-color), calc(var(--glow-intensity) * 0.6)) 0%,
            rgba(var(--glow-color), calc(var(--glow-intensity) * 0.3)) 25%,
            transparent 50%
          );
          border-radius: inherit;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
          opacity: 1;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

      `}</style>
    </div>
  );
}

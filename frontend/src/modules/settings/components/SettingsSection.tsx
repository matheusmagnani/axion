import { ReactNode, useRef, useEffect, useState } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  actions?: ReactNode;
}

export function SettingsSection({
  title,
  description,
  icon,
  children,
  isExpanded = true,
  onToggle,
  actions,
}: SettingsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const prevExpanded = useRef(isExpanded);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useEffect(() => {
    if (isExpanded && sectionRef.current) {
      const scrollContainer = sectionRef.current.closest('.overflow-auto') as HTMLElement;
      if (scrollContainer && headerRef.current) {
        const containerH = scrollContainer.clientHeight;
        const headerH = headerRef.current.offsetHeight;
        setContentHeight(containerH - headerH);
      }
    } else {
      setContentHeight(null);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const scrollContainer = sectionRef.current?.closest('.overflow-auto') as HTMLElement;
    if (!scrollContainer || !headerRef.current) return;

    const handleResize = () => {
      const containerH = scrollContainer.clientHeight;
      const headerH = headerRef.current!.offsetHeight;
      setContentHeight(containerH - headerH);
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(scrollContainer);
    return () => observer.disconnect();
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded && !prevExpanded.current && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (!isExpanded && prevExpanded.current && sectionRef.current) {
      const scrollContainer = sectionRef.current.closest('.overflow-auto');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    prevExpanded.current = isExpanded;
  }, [isExpanded]);

  return (
    <div ref={sectionRef}>
      <div className="bg-app-primary rounded-2xl border border-app-secondary/20">
        {/* Header - sempre visível, nunca scrolla */}
        <div
          ref={headerRef}
          className={`flex items-center justify-between p-6 ${onToggle ? 'cursor-pointer hover:bg-app-secondary/5 transition-colors rounded-2xl' : ''}`}
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-app-secondary/10 flex items-center justify-center text-app-secondary">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-app-secondary">{title}</h3>
              {description && (
                <p className="text-sm text-app-secondary/60 font-extralight mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {actions}
          </div>
        </div>

        {/* Content */}
        {isExpanded ? (
          <div
            className="overflow-auto border-t border-app-secondary/10"
            style={{ height: contentHeight ? `${contentHeight}px` : undefined }}
          >
            <div className="px-6 pb-6 pt-2">
              {children}
            </div>
          </div>
        ) : (
          <div className="transition-all duration-300 ease-in-out overflow-hidden max-h-0 opacity-0">
            <div className="px-6 pb-6 pt-2 border-t border-app-secondary/10">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

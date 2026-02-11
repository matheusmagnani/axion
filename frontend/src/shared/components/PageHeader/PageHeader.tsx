import { useRef, useEffect, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { PlusSquare, MagnifyingGlass, Funnel, FunnelX, X } from '@phosphor-icons/react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import './PageHeader.css';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface PageHeaderProps {
  title: string;
  icon: PhosphorIcon;
  // Search
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  // Filters
  filters?: FilterConfig[];
  onFilterChange?: (key: string, value: string) => void;
  // Add Button
  onAdd?: () => void;
  addLabel?: string;
  // Customization
  glowColor?: string;
  spotlightRadius?: number;
  enableBorderGlow?: boolean;
  // Extra content
  children?: ReactNode;
}

const DEFAULT_GLOW_COLOR = '230, 194, 132';
const DEFAULT_SPOTLIGHT_RADIUS = 300;

export function PageHeader({ 
  title, 
  icon: Icon, 
  onSearch,
  searchPlaceholder,
  filters,
  onFilterChange,
  onAdd,
  addLabel = 'Novo',
  glowColor = DEFAULT_GLOW_COLOR,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  enableBorderGlow = true,
  children
}: PageHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'page-header-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 450px;
      height: 450px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.05) 0%,
        rgba(${glowColor}, 0.025) 20%,
        rgba(${glowColor}, 0.012) 35%,
        rgba(${glowColor}, 0.005) 50%,
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
        opacity: 0.45,
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    onFilterChange?.(key, value);
  };

  const hasActions = onSearch || filters || onAdd || children;

  return (
    <div className="page-header-wrapper w-full">
      <div
        ref={containerRef}
        className={`page-header ${enableBorderGlow ? 'page-header--border-glow' : ''}`}
        style={{
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': '0',
          '--glow-radius': `${spotlightRadius}px`,
          '--glow-color': glowColor,
        } as React.CSSProperties}
      >
        {/* Title */}
        <div className="page-header__title">
          <Icon className="w-5 md:w-7 h-5 md:h-7 text-app-secondary" weight="regular" />
          <h1 className="text-lg md:text-xl lg:text-2xl leading-[1.23] font-semibold text-app-secondary">
            {title}
          </h1>
        </div>

        {/* Actions */}
        {hasActions && (
          <div className="page-header__actions">
            {/* Search */}
            {onSearch && (
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => inputRef.current?.focus()}
                  className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
                >
                  <MagnifyingGlass 
                    className="w-6 md:w-[26px] h-6 md:h-[26px] text-app-secondary" 
                    weight="regular" 
                  />
                </button>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={searchPlaceholder}
                    className={`
                      bg-transparent text-app-secondary outline-none
                      text-sm md:text-base
                      border border-app-secondary/50 rounded-[10px] px-3 py-1
                      transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                      focus:border-app-secondary
                      ${searchValue ? 'pr-8' : ''}
                      ${isFocused || searchValue ? 'w-[150px] sm:w-[200px] md:w-[280px]' : 'w-[80px] md:w-[100px]'}
                    `}
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue('');
                        onSearch?.('');
                        inputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-app-secondary/40 hover:text-app-secondary transition-colors"
                    >
                      <X className="w-4 h-4" weight="bold" />
                    </button>
                  )}
                </div>

                {/* Filter Button */}
                {filters && filters.length > 0 && (
                  <button
                    onClick={() => {
                      if (showFilters) {
                        // Clear all filters when closing
                        setFilterValues({});
                        filters.forEach(filter => onFilterChange?.(filter.key, ''));
                        setShowFilters(false);
                      } else {
                        setShowFilters(true);
                      }
                    }}
                    className={`flex-shrink-0 transition-transform duration-300 hover:scale-110 ${showFilters ? 'text-app-secondary' : 'text-app-secondary/70'}`}
                  >
                    {showFilters ? (
                      <FunnelX className="w-6 md:w-[26px] h-6 md:h-[26px]" weight="regular" />
                    ) : (
                      <Funnel className="w-6 md:w-[26px] h-6 md:h-[26px]" weight="regular" />
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Extra content */}
            {children}

            {/* Add Button */}
            {onAdd && (
              <button 
                onClick={onAdd}
                className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
                title={addLabel}
              >
                <PlusSquare className="w-8 md:w-10 h-8 md:h-10 text-app-secondary" weight="fill" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expanded filters */}
      {filters && filters.length > 0 && (
        <div 
          className={`
            flex flex-wrap items-center gap-4 px-4 overflow-hidden
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${showFilters ? 'max-h-[100px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}
          `}
        >
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              <label className="text-sm text-app-secondary/70">{filter.label}:</label>
              <select
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="px-3 py-1.5 bg-app-primary border border-app-secondary/30 rounded-[10px] text-app-secondary text-sm focus:outline-none focus:border-app-secondary"
              >
                <option value="">Todos</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

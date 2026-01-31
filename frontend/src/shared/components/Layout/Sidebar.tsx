import { useState, useEffect } from 'react';
import { House, UsersThree, CashRegister, Plugs, Users, Gear, AlignLeft, AlignTopSimple } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import logoSvg from '@/assets/logo.svg';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string; weight?: string }>;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: House, path: '/dashboard' },
  { label: 'Associates', icon: UsersThree, path: '/associates' },
  { label: 'Billings', icon: CashRegister, path: '/billings' },
  { label: 'Connections', icon: Plugs, path: '/connections' },
  { label: 'Collaborators', icon: Users, path: '/collaborators' },
  { label: 'Settings', icon: Gear, path: '/settings' },
];

const COLLAPSE_BREAKPOINT = 1280; // Collapses when width < 1280px

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < COLLAPSE_BREAKPOINT);

  // Detect screen size and collapse automatically
  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < COLLAPSE_BREAKPOINT;
      setIsCollapsed(shouldCollapse);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={`
        h-screen bg-primary overflow-hidden flex flex-col
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative
        ${isCollapsed ? 'w-[68px]' : 'w-[260px] md:w-[276px]'}
      `}
    >
      {/* Toggle button - always visible */}
      <button
        onClick={toggleSidebar}
        className={`
          absolute top-4 p-2 hover:bg-primary/50 rounded z-10
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isCollapsed ? 'right-1/2 translate-x-1/2' : 'right-2'}
        `}
        aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
      >
        <div className="relative w-6 h-6">
          <AlignLeft 
            className={`
              absolute inset-0 w-6 h-6 text-secondary
              transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${isCollapsed ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}
            `} 
            weight="regular" 
          />
          <AlignTopSimple 
            className={`
              absolute inset-0 w-6 h-6 text-secondary
              transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${isCollapsed ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}
            `} 
            weight="regular" 
          />
        </div>
      </button>

      {/* Logo - fixed space of 250px */}
      <div className="h-[250px] flex-shrink-0 flex items-center justify-start pl-[55px]">
        <div 
          className={`
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
          `}
        >
          <img src={logoSvg} alt="Axion" className="w-[167px] h-auto" />
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-shrink-0 flex flex-col gap-[10px] ml-[9px]">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center rounded-[10px] h-[48px] overflow-hidden
                transition-[width,background-color,border-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                pl-[12px] pr-[14px] gap-[14px]
                ${isActive 
                  ? 'bg-primary border border-secondary' 
                  : 'hover:bg-primary/50 border border-transparent'
                }
                ${isCollapsed ? 'w-[50px]' : 'w-[258px]'}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <Icon 
                className="text-secondary flex-shrink-0 w-[26px] h-[26px]"
                weight={isActive ? 'regular' : 'light'}
              />
              <span 
                className={`
                  text-base leading-[1.11] text-secondary whitespace-nowrap
                  ${isActive ? 'font-normal' : 'font-light'}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

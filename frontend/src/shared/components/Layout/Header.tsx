import { Flask } from '@phosphor-icons/react';

export function Header() {
  return (
    <div className="flex flex-col gap-0 w-full">
      {/* Test Banner */}
      <div className="flex items-center justify-center gap-1 py-[4px] md:py-[5px] px-2 bg-secondary">
        <Flask className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" weight="fill" />
        <p className="text-[10px] md:text-sm lg:text-base leading-[1.23] font-semibold text-primary text-center">
          <span className="hidden sm:inline">Test Environment - You can freely experiment with the application without risk of changing real data.</span>
          <span className="sm:hidden">Test Environment</span>
        </p>
      </div>

      {/* User Profile */}
      <div className="flex items-center justify-between px-4 md:px-[33px] py-2 md:py-[10px] bg-primary">
        {/* Name and Company - Left */}
        <div className="flex flex-col justify-center items-start font-sans">
          <p className="text-base md:text-xl lg:text-2xl leading-[1.19] font-medium text-secondary text-left">
            Matheus Magnani
          </p>
          <p className="text-xs md:text-sm lg:text-base leading-[1.16] font-normal text-secondary/70 text-left">
            Artemis Digital Solution
          </p>
        </div>
        {/* Avatar - Right */}
        <div className="w-10 h-10 md:w-14 md:h-14 lg:w-[60px] lg:h-[60px] rounded-full bg-secondary/20 border-2 border-secondary flex-shrink-0 flex items-center justify-center">
          <span className="text-secondary font-semibold text-sm md:text-lg lg:text-xl">
            MM
          </span>
        </div>
      </div>
    </div>
  );
}

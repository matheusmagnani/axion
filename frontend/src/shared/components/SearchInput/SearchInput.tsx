import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlass, Funnel } from '@phosphor-icons/react';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
}

export function SearchInput({ 
  placeholder = 'Buscar...', 
  onSearch,
  onFilter 
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue) {
      onSearch?.(searchValue);
    }
    if (e.key === 'Escape') {
      setSearchValue('');
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="flex items-center gap-3 md:gap-4">
      {/* Ícone de busca */}
      <button
        onClick={() => inputRef.current?.focus()}
        className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
      >
        <MagnifyingGlass 
          className="w-6 md:w-[26px] h-6 md:h-[26px] text-secondary" 
          weight="regular" 
        />
      </button>

      {/* Input sempre visível - expande ao focar */}
      <input
        ref={inputRef}
        type="text"
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          bg-transparent text-secondary outline-none
          text-base md:text-[18px]
          border border-secondary/50 rounded-[10px] px-3 py-1
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          focus:border-secondary
          ${isFocused || searchValue ? 'w-[150px] sm:w-[200px] md:w-[280px]' : 'w-[80px] md:w-[100px]'}
        `}
      />

      {/* Botão de filtro */}
      <button
        onClick={onFilter}
        className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
      >
        <Funnel 
          className="w-6 md:w-[26px] h-6 md:h-[26px] text-secondary" 
          weight="regular" 
        />
      </button>
    </div>
  );
}

import React, { useState, useRef, useEffect, useId } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
  badge?: string;
}

export interface SearchableSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  /**
   * For controls where free-form text search is also supported alongside dropdown selection
   */
  allowFreeTextSearch?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  emptyMessage?: string;
  autoFocusSearch?: boolean;
  align?: 'left' | 'right';
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  id,
  name,
  className = '',
  variant = 'light',
  size = 'md',
  fullWidth = false,
  allowFreeTextSearch = false,
  searchQuery,
  onSearchQueryChange,
  emptyMessage = 'No matching options found',
  autoFocusSearch = true,
  align = 'left',
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const currentSearch = searchQuery !== undefined ? searchQuery : internalSearch;

  const handleSearchChange = (val: string) => {
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    } else {
      setInternalSearch(val);
    }
    setHighlightedIndex(0);
  };

  // Find currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!currentSearch.trim()) return true;
    const q = currentSearch.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
      (opt.badge && opt.badge.toLowerCase().includes(q)) ||
      String(opt.value).toLowerCase().includes(q)
    );
  });

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && autoFocusSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, autoFocusSearch]);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
    if (!allowFreeTextSearch) {
      handleSearchChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (allowFreeTextSearch && currentSearch.trim()) {
        setIsOpen(false);
      }
    }
  };

  // Base styling depending on variant and size
  const sizeClasses = {
    sm: 'min-h-[34px] px-2.5 py-1 text-xs',
    md: 'min-h-[42px] px-3 py-2 text-sm',
    lg: 'min-h-[50px] px-4 py-2.5 text-base',
  }[size];

  const variantClasses = {
    light: 'bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 focus-within:border-kmc-navy focus-within:ring-2 focus-within:ring-kmc-navy/20 shadow-sm',
    dark: 'bg-slate-900 border border-amber-400/80 hover:border-amber-300 text-amber-300 focus-within:ring-2 focus-within:ring-amber-300/40 shadow-sm',
    glass: 'bg-white/10 hover:bg-white/15 border border-white/20 text-white backdrop-blur-md focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/30',
  }[variant];

  const popoverVariantClasses = {
    light: 'bg-white border border-slate-200 text-slate-800 shadow-2xl',
    dark: 'bg-slate-900 border border-slate-700 text-white shadow-2xl',
    glass: 'bg-slate-950/95 border border-white/20 text-white backdrop-blur-2xl shadow-2xl',
  }[variant];

  const searchInputClasses = {
    light: 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-kmc-navy focus:ring-1 focus:ring-kmc-navy/30',
    dark: 'bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:bg-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30',
    glass: 'bg-white/10 border border-white/15 text-white placeholder-slate-400 focus:bg-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30',
  }[variant];

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${fullWidth ? 'w-full' : ''} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden native input for form compatibility */}
      {name && <input type="hidden" name={name} value={String(value)} />}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full rounded-xl flex items-center justify-between gap-2 transition-all outline-none font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses}`}
      >
        <span className="truncate flex-1 text-left">
          {allowFreeTextSearch && currentSearch ? (
            <span className="flex items-center gap-1.5">
              <span className="opacity-70 text-xs font-normal">Search:</span>
              <strong className="font-semibold truncate">"{currentSearch}"</strong>
              {selectedOption && (
                <span className="opacity-80 text-xs font-normal">({selectedOption.label})</span>
              )}
            </span>
          ) : selectedOption ? (
            <span className="flex items-center gap-2 truncate">
              <span className="truncate font-semibold">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-500 shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </span>
          ) : (
            <span className="opacity-50">{placeholder}</span>
          )}
        </span>

        <span className="flex items-center gap-1 shrink-0">
          {allowFreeTextSearch && currentSearch && (
            <span
              role="button"
              tabIndex={0}
              title="Clear search"
              onClick={(e) => {
                e.stopPropagation();
                handleSearchChange('');
              }}
              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 opacity-70 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Dropdown Menu with Integrated Search Box */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute z-50 mt-1.5 w-full min-w-[280px] max-w-[420px] rounded-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 ${align === 'right' ? 'right-0' : 'left-0'} ${popoverVariantClasses}`}
        >
          {/* Default Search Box at Top of Dropdown */}
          <div className="p-2.5 border-b border-inherit">
            <div className="relative">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={currentSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl outline-none transition-all ${searchInputClasses}`}
                onClick={(e) => e.stopPropagation()}
              />
              {currentSearch && (
                <button
                  type="button"
                  title="Clear input"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSearchChange('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 p-0.5 rounded transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {allowFreeTextSearch && currentSearch && (
              <div className="mt-1.5 px-1 flex items-center justify-between text-[11px] opacity-75">
                <span>Filtering by query: <strong>{currentSearch}</strong></span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-amber-500 font-bold hover:underline"
                >
                  Apply query
                </button>
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs opacity-60">
                <p>{emptyMessage}</p>
                {allowFreeTextSearch && currentSearch && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="mt-2 text-xs font-bold text-amber-500 hover:underline inline-block"
                  >
                    Search all records for "{currentSearch}"
                  </button>
                )}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = idx === highlightedIndex;

                let itemClasses = 'text-inherit';
                if (isSelected) {
                  itemClasses = variant === 'dark' || variant === 'glass'
                    ? 'bg-amber-400/20 text-amber-300 font-bold'
                    : 'bg-kmc-navy/10 text-kmc-navy font-bold';
                } else if (isHighlighted) {
                  itemClasses = variant === 'dark' || variant === 'glass'
                    ? 'bg-white/10 text-white'
                    : 'bg-slate-100 text-slate-900';
                } else {
                  itemClasses = variant === 'dark' || variant === 'glass'
                    ? 'hover:bg-white/10 text-slate-200'
                    : 'hover:bg-slate-100 text-slate-700';
                }

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${itemClasses}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-500 shrink-0">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <div className="text-[10px] opacity-70 truncate mt-0.5">
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface SearchableOption {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  id: string;
  /** Currently selected option id ('' = nothing selected) */
  value: string;
  onChange: (id: string) => void;
  options: SearchableOption[];
  /** Text for the "nothing selected" row, e.g. "-- No Father linked --" */
  emptyLabel: string;
  /** Shown on the closed button when nothing is selected */
  placeholder?: string;
  disabled?: boolean;
}

/** Shorten a long UUID-style id for display: #A1B2C3D4 */
export function shortId(id: string | number): string {
  const s = String(id);
  return s.length > 8 ? `#${s.slice(0, 8)}` : `#${s}`;
}

/**
 * Touch-friendly replacement for long native <select> lists.
 * Tapping opens a bottom sheet (mobile) / centered panel with a
 * search box and large (52px+) rows, so picking a person out of a
 * long family list does not mean scrolling an endless dropdown.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  value,
  onChange,
  options,
  emptyLabel,
  placeholder,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(
    () => options.find((o) => String(o.id) === String(value)),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        String(o.id).toLowerCase().includes(q)
    );
  }, [options, query]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="w-full min-h-[48px] px-3.5 py-2.5 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl flex items-center justify-between gap-2 text-left disabled:opacity-60"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={`text-base truncate ${
            selected
              ? 'text-gray-900 dark:text-white font-medium'
              : 'text-gray-400 dark:text-zinc-500'
          }`}
        >
          {selected ? selected.name : placeholder || emptyLabel}
        </span>
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center"
          onClick={() => {
            setOpen(false);
            setQuery('');
          }}
        >
          <div
            role="listbox"
            aria-label={placeholder || emptyLabel}
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-md max-h-[82dvh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search header */}
            <div className="p-4 pb-3 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a name to search..."
                  autoFocus
                  className="w-full min-h-[48px] bg-transparent border-none text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full"
                aria-label="Close picker"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="flex-1 overflow-y-auto p-2">
              <button
                type="button"
                onClick={() => pick('')}
                className="w-full min-h-[52px] px-3 flex items-center justify-between gap-2 rounded-xl text-left text-base text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <span>{emptyLabel}</span>
                {!selected && <Check className="w-5 h-5 text-amber-600" />}
              </button>

              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-gray-400">
                  No one matches "{query}".
                </p>
              ) : (
                filtered.map((o) => {
                  const isSel = String(o.id) === String(value);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => pick(String(o.id))}
                      className={`w-full min-h-[52px] px-3 flex items-center justify-between gap-2 rounded-xl text-left ${
                        isSel
                          ? 'bg-amber-50 dark:bg-amber-950/20'
                          : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-base font-medium text-gray-900 dark:text-white truncate">
                          {o.name}
                        </span>
                        <span className="block text-xs text-gray-400 font-mono">
                          {shortId(o.id)}
                        </span>
                      </span>
                      {isSel && (
                        <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchableSelect;

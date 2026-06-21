import React from 'react';
import { Search, SlidersHorizontal, Users } from 'lucide-react';

interface SearchBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedGender: string;
  onGenderChange: (gender: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  onSearchChange,
  selectedGender,
  onGenderChange,
  placeholder = 'Search by name, occupation, address...'
}) => {
  return (
    <div id="search-filter-wrapper" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
          <input
            id="members-search-input"
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/80 dark:border-zinc-700/60 rounded-xl text-sm placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-zinc-500 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter Gender:</span>
          </div>

          {['All', 'M', 'F'].map((g) => {
            const isActive = selectedGender === g;
            const label = g === 'All' ? 'All' : g === 'M' ? 'Male' : 'Female';
            return (
              <button
                key={g}
                id={`gender-filter-btn-${g}`}
                type="button"
                onClick={() => onGenderChange(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

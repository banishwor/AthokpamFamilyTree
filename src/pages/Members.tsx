import React, { useState, useMemo } from 'react';
import useMembers from '../hooks/useMembers';
import SearchBar from '../components/SearchBar';
import MemberCard from '../components/MemberCard';
import { Loader2, Users, ArrowUpDown } from 'lucide-react';

export const Members: React.FC = () => {
  const { members, loading, error } = useMembers();
  const [searchText, setSearchText] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'id'>('name');

  // Filter and sort members in real-time
  const filteredAndSortedMembers = useMemo(() => {
    if (!members) return [];

    let result = [...members];

    // 1. Text filter (First Name, Middle Name, Last Name, Occupation, Address, Bio)
    if (searchText.trim() !== '') {
      const q = searchText.toLowerCase();
      result = result.filter((m) => {
        const first = m.firstName?.toLowerCase() || '';
        const middle = m.middleName?.toLowerCase() || '';
        const last = m.lastName?.toLowerCase() || '';
        const occ = m.occupation?.toLowerCase() || '';
        const addr = m.address?.toLowerCase() || '';
        const bio = m.bio?.toLowerCase() || '';

        return (
          first.includes(q) ||
          middle.includes(q) ||
          last.includes(q) ||
          occ.includes(q) ||
          addr.includes(q) ||
          bio.includes(q)
        );
      });
    }

    // 2. Gender filter
    if (selectedGender !== 'All') {
      result = result.filter((m) => m.gender === selectedGender);
    }

    // 3. Sorting
    if (sortBy === 'name') {
      result.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else {
      // Sort by member ID
      result.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA; // latest first
      });
    }

    return result;
  }, [members, searchText, selectedGender, sortBy]);

  return (
    <div id="members-list-page" className="min-h-screen bg-gray-50/55 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-600" />
              Preserved Lineage Directory
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 uppercase tracking-wider font-extrabold">
              Browse, search and explore all members of the Athokpam family tree
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-extrabold text-gray-400 dark:text-zinc-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort By:
            </span>
            <button
              id="sort-btn-name"
              onClick={() => setSortBy('name')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                sortBy === 'name'
                  ? 'bg-amber-600/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800'
              }`}
            >
              Alphabetical Name
            </button>
            <button
              id="sort-btn-id"
              onClick={() => setSortBy('id')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                sortBy === 'id'
                  ? 'bg-amber-600/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800'
              }`}
            >
              Latest Added
            </button>
          </div>
        </div>

        {/* Real-time search tools */}
        <SearchBar
          searchText={searchText}
          onSearchChange={setSearchText}
          selectedGender={selectedGender}
          onGenderChange={setSelectedGender}
          placeholder="Search by first, last, middle name, address, bio..."
        />

        {/* Results layout */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-xs font-bold text-gray-500 dark:text-zinc-400">Loading catalog records from database...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 dark:bg-red-950/20 border border-red-100 rounded-2xl text-center text-red-700 font-semibold text-xs">
            {error}
          </div>
        ) : filteredAndSortedMembers.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-12 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">No family members found</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">
              We couldn't matching any records with the search parameters: "{searchText}". Try modifying filters or adding a new member in the Admin panel.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Matching Counter badge */}
            <div className="text-xs font-bold text-gray-400 dark:text-zinc-500">
              Showing {filteredAndSortedMembers.length} family profiles
            </div>

            {/* Members Grid layout */}
            <div id="members-list-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;

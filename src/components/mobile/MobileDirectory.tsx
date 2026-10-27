import React, { useMemo, useState } from 'react';
import { Loader2, Search, Users } from 'lucide-react';
import type { Member } from '../../types';
import { PersonRow } from './shared';
import { fullName, sortedByName } from '../../utils/memberSave';

/**
 * Mobile Members directory — sticky 16px search (no iOS focus zoom),
 * gender chips, and A–Z grouped portrait rows. Public/read-only; the
 * desktop Members grid is a separate tree and stays untouched.
 */
const MobileDirectory: React.FC<{ members: Member[]; loading: boolean; error: string | null }> = ({ members, loading, error }) => {
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState<'All' | 'M' | 'F'>('All');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = sortedByName(members);
    if (gender !== 'All') list = list.filter((m) => m.gender === gender);
    if (q) {
      list = list.filter((m) =>
        [fullName(m), m.occupation || '', m.address || '']
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    const map = new Map<string, Member[]>();
    for (const m of list) {
      const letter = (fullName(m).charAt(0) || '#').toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(m);
    }
    return { entries: [...map.entries()], count: list.length };
  }, [members, query, gender]);

  return (
    <div className="bg-[#FDFBF6] dark:bg-zinc-950 min-h-screen pb-10">
      {/* Sticky search header (below the sticky navbar) */}
      <div className="sticky top-16 z-30 bg-[#FDFBF6]/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 pt-3 pb-3 border-b border-amber-900/5 dark:border-white/5">
        <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Members</h1>
        <div className="relative mt-2.5">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search name, occupation, place…"
            aria-label="Search members"
            className="w-full min-h-[52px] pl-11 pr-4 text-base bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 mt-3">
          {(
            [
              { v: 'All', label: 'All' },
              { v: 'M', label: 'Male' },
              { v: 'F', label: 'Female' },
            ] as const
          ).map((c) => (
            <button
              key={c.v}
              type="button"
              onClick={() => setGender(c.v)}
              className={`min-h-[40px] px-4 rounded-full text-sm font-bold border transition ${
                gender === c.v
                  ? 'bg-amber-600 border-amber-600 text-white shadow'
                  : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300'
              }`}
            >
              {c.label}
            </button>
          ))}
          <span className="ml-auto text-[13px] font-bold text-gray-400 dark:text-zinc-500">
            {loading ? '…' : `${groups.count} ${groups.count === 1 ? 'person' : 'people'}`}
          </span>
        </div>
      </div>

      <div className="px-4 pt-2">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-sm font-bold text-gray-500 dark:text-zinc-400">Loading members…</p>
          </div>
        ) : error ? (
          <div className="mt-4 p-5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-3xl text-center text-sm font-bold text-red-600">
            Couldn't load the directory. Check your connection and reopen this page.
          </div>
        ) : groups.count === 0 ? (
          <div className="mt-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-10 text-center shadow-sm">
            <Users className="w-10 h-10 mx-auto text-gray-300 dark:text-zinc-600" />
            <p className="mt-3 font-extrabold text-gray-900 dark:text-white">No one matches “{query}”</p>
            <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Try a different spelling, or clear the gender filter.</p>
          </div>
        ) : (
          groups.entries.map(([letter, people]) => (
            <section key={letter} className="mt-3">
              <h2 className="px-2 pb-1 text-[13px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-500">{letter}</h2>
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-1.5 shadow-sm divide-y divide-gray-50 dark:divide-zinc-800/70">
                {people.map((m) => (
                  <PersonRow key={m.id} member={m} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileDirectory;

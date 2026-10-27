import React, { useMemo } from 'react';
import { ArrowUpDown, GitMerge, Loader2, Sparkles } from 'lucide-react';
import type { Member } from '../../types';
import SearchableSelect from '../SearchableSelect';
import { Avatar } from './shared';
import { fullName, sortedByName } from '../../utils/memberSave';

interface Props {
  members: Member[];
  loading: boolean;
  error: string | null;
  member1Id: string;
  member2Id: string;
  onSelect1: (id: string) => void;
  onSelect2: (id: string) => void;
  onSwap: () => void;
  onFind: () => void;
  calculating: boolean;
  relationshipStr: string;
  lineagePath: Member[];
  hasCalculated: boolean;
}

/**
 * Mobile Relationship Finder — two big searchable pickers with a
 * swap button, one full-width Find button, and the result as a
 * headline card plus a vertical step-by-step path (the desktop
 * result alternates left/right around a centre line, which squeezes
 * badly on phones). Shares all state/logic with the desktop page.
 */
const MobileRelationship: React.FC<Props> = (p) => {
  const options = useMemo(
    () => sortedByName(p.members).map((m) => ({ id: m.id, name: fullName(m) })),
    [p.members]
  );
  const m1 = p.members.find((m) => String(m.id) === p.member1Id) ?? null;
  const m2 = p.members.find((m) => String(m.id) === p.member2Id) ?? null;

  return (
    <div className="bg-[#FDFBF6] dark:bg-zinc-950 min-h-screen pb-10 px-4 pt-6">
      <div className="text-center">
        <h1 className="text-[26px] font-black text-gray-900 dark:text-white tracking-tight">How are we related?</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
          Pick any two family members and see exactly how they connect.
        </p>
      </div>

      {p.loading ? (
        <div className="mt-10 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-sm font-bold text-gray-500 dark:text-zinc-400">Loading family members…</p>
        </div>
      ) : p.error ? (
        <div className="mt-8 p-5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-3xl text-center text-sm font-bold text-red-600">
          {p.error}
        </div>
      ) : (
        <>
          <div className="mt-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
            <div>
              <span className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">First person</span>
              <SearchableSelect
                value={p.member1Id}
                onChange={p.onSelect1}
                options={options}
                emptyLabel="-- Select a family member --"
                placeholder="Find a person"
                presentation="top"
              />
              {m1 && (
                <div className="flex items-center gap-2.5 mt-2.5 px-1">
                  <Avatar member={m1} size={36} />
                  <span className="text-sm font-bold text-gray-800 dark:text-zinc-100">{fullName(m1)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={p.onSwap}
                aria-label="Swap the two people"
                className="w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center active:bg-amber-100"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Second person</span>
              <SearchableSelect
                value={p.member2Id}
                onChange={p.onSelect2}
                options={options}
                emptyLabel="-- Select a family member --"
                placeholder="Find a person"
                presentation="top"
              />
              {m2 && (
                <div className="flex items-center gap-2.5 mt-2.5 px-1">
                  <Avatar member={m2} size={36} />
                  <span className="text-sm font-bold text-gray-800 dark:text-zinc-100">{fullName(m2)}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={p.onFind}
              disabled={p.calculating || !p.member1Id || !p.member2Id}
              className="w-full min-h-[54px] rounded-2xl bg-amber-600 text-white text-base font-extrabold shadow-lg shadow-amber-600/20 active:bg-amber-700 disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {p.calculating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Finding the connection…
                </>
              ) : (
                <>
                  <GitMerge className="w-5 h-5" /> Find Relationship
                </>
              )}
            </button>
          </div>

          {p.hasCalculated && (
            <div className="mt-5 space-y-4">
              <div className="bg-amber-500/10 dark:bg-zinc-900 border-2 border-amber-500/25 dark:border-zinc-800 rounded-3xl p-5 text-center shadow-sm">
                <span className="inline-flex p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full">
                  <Sparkles className="w-6 h-6" />
                </span>
                <p className="mt-2 text-[10px] text-amber-800 dark:text-amber-500 tracking-widest uppercase font-black">Relationship</p>
                <h2 className="mt-1.5 text-[17px] font-black text-gray-950 dark:text-white leading-relaxed">“{p.relationshipStr}”</h2>
              </div>

              {p.lineagePath.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white px-1 pb-2">The path between them</h3>
                  <ol className="relative">
                    {p.lineagePath.map((node, idx) => (
                      <li key={node.id} className="relative flex gap-3 pb-4 last:pb-1">
                        {idx < p.lineagePath.length - 1 && (
                          <span aria-hidden className="absolute left-[27px] top-[58px] bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-amber-200 dark:from-amber-700 dark:to-zinc-800" />
                        )}
                        <span className="relative z-10 shrink-0">
                          <Avatar member={node} size={56} />
                        </span>
                        <span className="min-w-0 pt-1.5">
                          <span className="block font-bold text-[15px] text-gray-900 dark:text-white leading-snug">{fullName(node)}</span>
                          <span className="block text-[13px] text-gray-500 dark:text-zinc-400 mt-0.5">
                            {idx === 0 ? 'Starts here' : idx === p.lineagePath.length - 1 ? 'Ends here' : `Step ${idx + 1} of the connection`}
                            {node.occupation ? ` · ${node.occupation}` : ''}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MobileRelationship;

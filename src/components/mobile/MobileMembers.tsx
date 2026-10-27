import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight, Loader2, Search, User } from 'lucide-react';
import { Member } from '../../types';
import { getDirectPhotoUrl } from '../../utils';
import { compareByFullName, fullName, memberCompleteness } from '../../utils/memberSave';
import MemberHub from './MemberHub';
import AddMemberWizard from './AddMemberWizard';

interface MobileMembersProps {
  members: Member[];
  loading: boolean;
  onRefresh: () => void;
}

type Filter = 'all' | 'M' | 'F' | 'nophoto';

const CompletenessRing: React.FC<{ percent: number }> = ({ percent }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" className="flex-shrink-0" aria-label={`${percent}% complete`}>
    <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="stroke-gray-200 dark:stroke-zinc-700" />
    <circle
      cx="20" cy="20" r="16" fill="none" strokeWidth="4" pathLength={100}
      strokeDasharray={`${percent} ${100 - percent}`} strokeLinecap="round"
      transform="rotate(-90 20 20)"
      className={percent >= 75 ? 'stroke-emerald-500' : percent >= 40 ? 'stroke-amber-500' : 'stroke-red-400'}
    />
    <text x="20" y="24" textAnchor="middle" fontSize="10" fontWeight="800" className="fill-gray-600 dark:fill-zinc-300">
      {percent}
    </text>
  </svg>
);

const initials = (m: Member) =>
  `${(m.firstName || '?').charAt(0)}${(m.lastName || '').charAt(0)}`.toUpperCase();

/**
 * Phone-first members list: sticky search, filter chips, and
 * tappable cards that open the Member Hub. No table, no UUIDs.
 */
export const MobileMembers: React.FC<MobileMembersProps> = ({ members, loading, onRefresh }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [openMember, setOpenMember] = useState<Member | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const isPhoneWidth = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767.98px)').matches;

  // Deep links: ?edit=<id> opens the Hub, ?new=1 opens the wizard.
  // Phone widths only — on desktop the classic modal flow owns these params.
  useEffect(() => {
    if (!isPhoneWidth()) return;
    const editId = searchParams.get('edit');
    if (editId && members.length > 0) {
      const match = members.find((m) => String(m.id) === editId);
      if (match) setOpenMember(match);
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, members, setSearchParams]);

  useEffect(() => {
    if (!isPhoneWidth()) return;
    if (searchParams.get('new')) {
      setWizardOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Keep the open Hub in sync with refreshed data
  useEffect(() => {
    if (openMember) {
      const fresh = members.find((m) => String(m.id) === String(openMember.id));
      if (fresh && fresh !== openMember) setOpenMember(fresh);
    }
  }, [members, openMember]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (filter === 'M' && m.gender !== 'M') return false;
      if (filter === 'F' && m.gender !== 'F') return false;
      if (filter === 'nophoto' && m.photoUrl) return false;
      if (!q) return true;
      return (
        fullName(m).toLowerCase().includes(q) ||
        (m.occupation || '').toLowerCase().includes(q) ||
        (m.address || '').toLowerCase().includes(q)
      );
    }).sort(compareByFullName);
  }, [members, query, filter]);

  const chips: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'M', label: 'Male' },
    { key: 'F', label: 'Female' },
    { key: 'nophoto', label: 'No photo' },
  ];

  return (
    <div>
      {/* Sticky search + filters */}
      <div className="sticky top-0 z-20 -mx-4 px-4 pt-1 pb-3 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur-md">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 shadow-sm">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, occupation, place..."
            className="w-full min-h-[52px] bg-transparent border-none text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0"
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`min-h-[40px] px-4 rounded-full text-sm font-bold whitespace-nowrap border ${
                filter === c.key
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1 mb-3">
        {filtered.length} of {members.length} members
      </p>

      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <span className="text-sm font-semibold">Loading members...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <User className="w-10 h-10 mx-auto mb-3" />
          <p className="text-sm font-semibold">No members match your search.</p>
        </div>
      ) : (
        <div className="space-y-2.5 pb-4">
          {filtered.map((m) => {
            const { percent } = memberCompleteness(m);
            const birthYear = m.birthDate ? new Date(m.birthDate).getFullYear() : null;
            return (
              <button
                key={m.id}
                onClick={() => setOpenMember(m)}
                className="w-full flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-3.5 shadow-sm text-left active:scale-[0.99] transition"
              >
                <span className="w-12 h-12 rounded-2xl overflow-hidden bg-amber-50 dark:bg-amber-950/30 border border-gray-100 dark:border-zinc-800 flex items-center justify-center flex-shrink-0">
                  {m.photoUrl ? (
                    <img src={getDirectPhotoUrl(m.photoUrl)} alt={m.firstName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-black text-amber-700 dark:text-amber-400">{initials(m)}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-gray-900 dark:text-white truncate">{fullName(m)}</span>
                  <span className="block text-xs text-gray-400 font-semibold mt-0.5">
                    {m.gender === 'F' ? 'Female' : 'Male'}
                    {birthYear ? ` · b. ${birthYear}` : ''}
                    {!m.photoUrl ? ' · No portrait' : ''}
                  </span>
                </span>
                <CompletenessRing percent={percent} />
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {openMember && (
        <MemberHub
          member={openMember}
          allMembers={members}
          onClose={() => setOpenMember(null)}
          onDone={() => {
            setOpenMember(null);
            onRefresh();
          }}
        />
      )}

      {wizardOpen && (
        <AddMemberWizard
          allMembers={members}
          onClose={() => setWizardOpen(false)}
          onCreated={() => {
            setWizardOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default MobileMembers;

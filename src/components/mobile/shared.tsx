import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Member } from '../../types';
import { getDirectPhotoUrl } from '../../utils';
import { fullName } from '../../utils/memberSave';

/** Shared phone-first field styling: 16px text (no iOS focus zoom), 52px tall. */
export const mobileInputCls =
  'w-full px-4 min-h-[52px] py-3 text-base bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15';

export const mobileLabelCls =
  'block text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5';

export const MobileSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm">
    <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">{title}</h3>
    {children}
  </section>
);

export const GenderToggle: React.FC<{ value: string; onChange: (g: string) => void }> = ({ value, onChange }) => (
  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Gender">
    {[
      { v: 'M', label: 'Male' },
      { v: 'F', label: 'Female' },
    ].map((o) => (
      <button
        key={o.v}
        type="button"
        role="radio"
        aria-checked={value === o.v}
        onClick={() => onChange(o.v)}
        className={`min-h-[52px] rounded-2xl text-base font-bold border transition ${
          value === o.v
            ? 'bg-amber-600 border-amber-600 text-white shadow-md'
            : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/** Round portrait (real photo or initials tile), gender-tinted like the tree cards. */
export const Avatar: React.FC<{ member: Pick<Member, 'firstName' | 'lastName' | 'gender' | 'photoUrl'>; size?: number }> = ({ member, size = 52 }) => {
  const url = getDirectPhotoUrl(member.photoUrl);
  const initials = `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`.toUpperCase() || 'A';
  if (url) {
    return <img src={url} alt="" loading="lazy" className="rounded-full object-cover shrink-0 border border-amber-900/10" style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden
      className={`rounded-full shrink-0 flex items-center justify-center font-black border ${
        member.gender === 'F'
          ? 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border-pink-200/70 dark:border-pink-900/40'
          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/40'
      }`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  );
};

/** One tappable person row (≥56px tall) linking to the public profile. */
export const PersonRow: React.FC<{ member: Member; sub?: string }> = ({ member, sub }) => {
  const birthYear = member.birthDate ? new Date(member.birthDate).getUTCFullYear() : null;
  const autoSub = [member.occupation, birthYear ? `b. ${birthYear}` : null].filter(Boolean).join(' · ');
  return (
    <Link
      to={`/member/${member.id}`}
      className="flex items-center gap-3 min-h-[64px] px-3 py-2 rounded-2xl active:bg-amber-50 dark:active:bg-zinc-800/60 transition-colors"
    >
      <Avatar member={member} />
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-[15px] text-gray-900 dark:text-white leading-snug truncate">{fullName(member)}</span>
        {(sub ?? autoSub) && <span className="block text-[13px] text-gray-500 dark:text-zinc-400 truncate mt-0.5">{sub ?? autoSub}</span>}
      </span>
      <ChevronRight className="w-5 h-5 text-gray-300 dark:text-zinc-600 shrink-0" />
    </Link>
  );
};

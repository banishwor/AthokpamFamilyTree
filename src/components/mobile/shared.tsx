import React from 'react';

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

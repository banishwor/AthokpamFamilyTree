import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GitMerge, Users, Images, Network, PenLine, Shield, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import type { Member } from '../../types';
import { Avatar, PersonRow } from './shared';
import { fullName, sortedByName } from '../../utils/memberSave';

/**
 * Mobile Home — a phone-first front page (hero, stats strip, big tap
 * cards, elders rail, recent additions). The desktop Home is a
 * separate tree and stays untouched; this renders below md only.
 */
const MobileHome: React.FC<{ members: Member[]; loading: boolean; error: string | null }> = ({ members, loading, error }) => {
  const stats = useMemo(() => {
    const total = members.length;
    const photos = members.filter((m) => m.photoUrl && m.photoUrl.trim() !== '').length;
    const uniqueFathers = new Set(members.map((m) => m.fatherId).filter(Boolean)).size;
    return { total, photos, branches: Math.max(3, uniqueFathers) };
  }, [members]);

  const elders = useMemo(
    () =>
      [...members]
        .filter((m) => m.birthDate)
        .sort((a, b) => new Date(a.birthDate!).getTime() - new Date(b.birthDate!).getTime())
        .slice(0, 8),
    [members]
  );

  const recent = useMemo(() => {
    const withDates = members.filter((m) => m.createdAt);
    if (withDates.length >= 3) {
      return [...withDates].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).slice(0, 3);
    }
    return sortedByName(members).slice(0, 0);
  }, [members]);

  const cards = [
    { to: '/tree', icon: GitMerge, title: 'Family Tree', desc: 'Explore the interactive tree', gold: true },
    { to: '/members', icon: Users, title: 'Members', desc: `Browse all ${stats.total} profiles`, gold: false },
    { to: '/charts', icon: Images, title: 'Charts', desc: 'Descendant & ancestor charts', gold: false },
    { to: '/relationship-finder', icon: Network, title: 'Relationship', desc: 'How are two people related?', gold: false },
  ];

  return (
    <div className="bg-[#FDFBF6] dark:bg-zinc-950 min-h-screen pb-10">
      {/* Hero */}
      <section className="px-5 pt-8 pb-6 text-center bg-gradient-to-b from-amber-50 via-[#FDFBF6] to-[#FDFBF6] dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-full text-amber-800 dark:text-amber-400 text-[11px] font-extrabold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Athokpam Lineage Heritage
        </span>
        <h1 className="mt-5 text-[42px] leading-[1.02] font-light tracking-tight text-gray-900 dark:text-white" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Digital <span className="text-amber-600 dark:text-amber-500 italic">Lineage</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600 dark:text-zinc-400 max-w-sm mx-auto">
          Our ancestral roots, preserved — the Athokpam family tree, its people and their stories.
        </p>
        {elders.length > 0 && (
          <div className="mt-5 flex items-center justify-center">
            <div className="flex -space-x-3">
              {elders.slice(0, 5).map((m) => (
                <span key={m.id} className="ring-[3px] ring-[#FDFBF6] dark:ring-zinc-950 rounded-full">
                  <Avatar member={m} size={44} />
                </span>
              ))}
            </div>
            <span className="ml-3 text-[13px] font-bold text-gray-500 dark:text-zinc-400">
              {stats.total} family members
            </span>
          </div>
        )}
        <Link
          to="/tree"
          className="mt-6 flex items-center justify-center gap-2 w-full min-h-[54px] rounded-2xl bg-amber-600 text-white text-base font-extrabold shadow-lg shadow-amber-600/20 active:bg-amber-700"
        >
          <GitMerge className="w-5 h-5" /> Open the Family Tree
        </Link>
      </section>

      <div className="px-4 space-y-6 -mt-1">
        {/* Stats strip */}
        {loading ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 flex items-center justify-center gap-2 shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span className="text-sm font-bold text-gray-500 dark:text-zinc-400">Loading family records…</span>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/40 rounded-3xl p-5 text-center text-sm font-bold text-red-600 shadow-sm">
            Couldn't load family records. Pull to retry from the Members page.
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-sm grid grid-cols-3 divide-x divide-gray-100 dark:divide-zinc-800 overflow-hidden">
            {[
              { n: stats.total, label: 'Members' },
              { n: stats.photos, label: 'Portraits' },
              { n: stats.branches, label: 'Branches' },
            ].map((s) => (
              <div key={s.label} className="py-4 text-center">
                <div className="text-[26px] font-black text-gray-900 dark:text-white leading-none">{s.n}</div>
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Explore cards */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white mb-3 px-1">Explore</h2>
          <div className="grid grid-cols-2 gap-3">
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className={`rounded-3xl border p-4 min-h-[118px] flex flex-col justify-between shadow-sm active:scale-[0.98] transition ${
                  c.gold
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-white'
                }`}
              >
                <c.icon className={`w-7 h-7 ${c.gold ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                <span>
                  <span className="block text-base font-extrabold leading-tight">{c.title}</span>
                  <span className={`block text-[12.5px] mt-1 leading-snug ${c.gold ? 'text-amber-100' : 'text-gray-500 dark:text-zinc-400'}`}>{c.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Elders rail */}
        {elders.length > 0 && (
          <section>
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white mb-3 px-1">Our Elders</h2>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x">
              {elders.map((m) => (
                <Link key={m.id} to={`/member/${m.id}`} className="snap-start shrink-0 w-[104px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-3 text-center shadow-sm">
                  <span className="flex justify-center"><Avatar member={m} size={60} /></span>
                  <span className="block mt-2 text-[12.5px] font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">{fullName(m)}</span>
                  <span className="block text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">b. {new Date(m.birthDate!).getUTCFullYear()}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Update — linked from Home at last */}
        <Link
          to="/quick-update"
          className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-3xl p-4 shadow-sm active:bg-amber-100 dark:active:bg-amber-950/40"
        >
          <span className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0">
            <PenLine className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[15px] font-extrabold text-gray-900 dark:text-white">Update your own details</span>
            <span className="block text-[13px] text-gray-500 dark:text-zinc-400">Family members: fix your name, birth date or photo</span>
          </span>
          <ChevronRight className="w-5 h-5 text-amber-600 shrink-0" />
        </Link>

        {/* Recent additions */}
        {recent.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-2 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white px-3 pt-3 pb-1">Recently Added</h2>
            {recent.map((m) => (
              <PersonRow key={m.id} member={m} />
            ))}
          </section>
        )}

        <Link to="/login" className="flex items-center justify-center gap-1.5 min-h-[44px] text-sm font-bold text-gray-400 dark:text-zinc-500">
          <Shield className="w-4 h-4" /> Admin Portal
        </Link>
      </div>
    </div>
  );
};

export default MobileHome;

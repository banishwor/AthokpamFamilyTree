import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Briefcase, MapPin, GraduationCap, Heart, Images, Network, AlignLeft } from 'lucide-react';
import type { Member, Ancestor } from '../../types';
import { Avatar, MobileSection, PersonRow } from './shared';
import { compareByBirthThenName, fullName } from '../../utils/memberSave';

const fmtDate = (iso?: string): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

interface Props {
  member: Member;
  parents: Member[];
  spouse: Member | null;
  children: Member[];
  siblings: Member[];
  ancestors: (Ancestor & { firstName?: string; lastName?: string; gender?: string })[];
}

/**
 * Mobile Member Profile — big portrait header, full-width detail
 * rows, ALL siblings (the desktop profile quietly caps them at 4;
 * mobile shows everyone), and full-width chart buttons. The desktop
 * profile is a separate tree and stays untouched.
 */
const MobileProfile: React.FC<Props> = ({ member, parents, spouse, children, siblings, ancestors }) => {
  const navigate = useNavigate();
  const born = fmtDate(member.birthDate);
  const died = fmtDate(member.deathDate);
  const age = (() => {
    if (!member.birthDate) return null;
    const b = new Date(member.birthDate);
    const end = member.deathDate ? new Date(member.deathDate) : new Date();
    let a = end.getUTCFullYear() - b.getUTCFullYear();
    const md = end.getUTCMonth() - b.getUTCMonth();
    if (md < 0 || (md === 0 && end.getUTCDate() < b.getUTCDate())) a--;
    return a >= 0 ? a : null;
  })();

  const details: { icon: React.ElementType; label: string; value: string }[] = [
    born ? { icon: Calendar, label: 'Born', value: born + (age !== null && !died ? ` · age ${age}` : '') } : null,
    died ? { icon: Calendar, label: 'Died', value: died + (age !== null ? ` · aged ${age}` : '') } : null,
    member.occupation ? { icon: Briefcase, label: 'Occupation', value: member.occupation } : null,
    member.education ? { icon: GraduationCap, label: 'Education', value: member.education } : null,
    member.address ? { icon: MapPin, label: 'Address', value: member.address } : null,
    member.bio ? { icon: AlignLeft, label: 'About', value: member.bio } : null,
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  const familyRow = (m: Member, sub?: string) => <PersonRow key={m.id} member={m} sub={sub} />;

  return (
    <div className="bg-[#FDFBF6] dark:bg-zinc-950 min-h-screen pb-10">
      {/* Top bar */}
      <div className="sticky top-16 z-30 bg-[#FDFBF6]/95 dark:bg-zinc-950/95 backdrop-blur-md px-3 py-2 flex items-center gap-1 border-b border-amber-900/5 dark:border-white/5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-11 h-11 flex items-center justify-center rounded-full text-gray-700 dark:text-zinc-200 active:bg-amber-100/70 dark:active:bg-zinc-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Profile</span>
      </div>

      {/* Header */}
      <header className="px-5 pt-6 pb-2 text-center">
        <span className="inline-flex"><Avatar member={member} size={116} /></span>
        <h1 className="mt-4 text-[26px] leading-tight font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          {fullName(member)}
        </h1>
        {member.occupation && <p className="mt-1 text-[15px] font-semibold text-amber-700 dark:text-amber-400">{member.occupation}</p>}
        {(born || died) && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-zinc-400">
            {born ?? ''}{died ? ` — ${died}` : born ? ' — present' : ''}
          </p>
        )}
      </header>

      <div className="px-4 space-y-4 mt-3">
        {/* Chart actions */}
        <div className="space-y-2.5">
          <Link
            to={`/chart/${member.id}`}
            className="flex items-center justify-center gap-2 w-full min-h-[54px] rounded-2xl bg-amber-600 text-white text-base font-extrabold shadow-lg shadow-amber-600/20 active:bg-amber-700"
          >
            <Images className="w-5 h-5" /> Descendant Chart
          </Link>
          <Link
            to={`/ancestors/${member.id}`}
            className="flex items-center justify-center gap-2 w-full min-h-[54px] rounded-2xl bg-white dark:bg-zinc-900 border border-amber-600/50 text-amber-700 dark:text-amber-400 text-base font-extrabold active:bg-amber-50 dark:active:bg-zinc-800"
          >
            <Network className="w-5 h-5" /> Ancestors Chart
          </Link>
        </div>

        {/* Details */}
        {details.length > 0 && (
          <MobileSection title="Details">
            <dl className="divide-y divide-gray-50 dark:divide-zinc-800/70 -my-1">
              {details.map((d) => (
                <div key={d.label} className="flex gap-3 py-3">
                  <d.icon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <dt className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-zinc-500">{d.label}</dt>
                    <dd className="text-[15px] font-semibold text-gray-900 dark:text-zinc-100 leading-snug mt-0.5 whitespace-pre-line">{d.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </MobileSection>
        )}

        {/* Family */}
        {parents.length > 0 && (
          <MobileSection title="Parents">
            <div className="-m-1.5">{parents.map((p) => familyRow(p, p.gender === 'F' ? 'Mother' : 'Father'))}</div>
          </MobileSection>
        )}

        {spouse && (
          <MobileSection title="Spouse">
            <div className="-m-1.5">{familyRow(spouse)}</div>
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-pink-600 dark:text-pink-400 px-1">
              <Heart className="w-4 h-4" /> Married
            </p>
          </MobileSection>
        )}

        {children.length > 0 && (
          <MobileSection title={`Children · ${children.length}`}>
            <div className="-m-1.5">{[...children].sort(compareByBirthThenName).map((c) => familyRow(c))}</div>
          </MobileSection>
        )}

        {siblings.length > 0 && (
          <MobileSection title={`Siblings · ${siblings.length}`}>
            <div className="-m-1.5">{[...siblings].sort(compareByBirthThenName).map((s) => familyRow(s))}</div>
          </MobileSection>
        )}

        {ancestors.length > 0 && (
          <MobileSection title="Lineage">
            <div className="-m-1.5">
              {ancestors.map((a) => (
                <Link
                  key={a.id}
                  to={`/member/${a.id}`}
                  className="flex items-center gap-3 min-h-[56px] px-3 py-2 rounded-2xl active:bg-amber-50 dark:active:bg-zinc-800/60"
                >
                  <Avatar member={{ firstName: a.firstName || a.name, lastName: a.lastName || '', gender: a.gender || 'M', photoUrl: a.photoUrl }} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[15px] text-gray-900 dark:text-white truncate">{a.name}</span>
                    <span className="block text-[13px] text-gray-500 dark:text-zinc-400">{a.relationship}</span>
                  </span>
                </Link>
              ))}
            </div>
          </MobileSection>
        )}
      </div>
    </div>
  );
};

export default MobileProfile;

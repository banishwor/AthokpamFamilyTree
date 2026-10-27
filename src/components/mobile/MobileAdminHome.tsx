import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, GitMerge, Images, Loader2, UserPlus, Users } from 'lucide-react';
import { Member } from '../../types';
import { getDirectPhotoUrl } from '../../utils';
import { fullName } from '../../utils/memberSave';

interface MobileAdminHomeProps {
  members: Member[];
  loading: boolean;
}

const initials = (m: Member) =>
  `${(m.firstName || '?').charAt(0)}${(m.lastName || '').charAt(0)}`.toUpperCase();

const Avatar: React.FC<{ m: Member }> = ({ m }) => (
  <span className="w-11 h-11 rounded-2xl overflow-hidden bg-amber-50 dark:bg-amber-950/30 border border-gray-100 dark:border-zinc-800 flex items-center justify-center flex-shrink-0">
    {m.photoUrl ? (
      <img src={getDirectPhotoUrl(m.photoUrl)} alt={m.firstName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
    ) : (
      <span className="text-sm font-black text-amber-700 dark:text-amber-400">{initials(m)}</span>
    )}
  </span>
);

/**
 * Phone-first admin home: coverage, quick actions, the
 * needs-attention queue and recent updates. Not a shrunk
 * dashboard — its own layout for one-thumb use.
 */
export const MobileAdminHome: React.FC<MobileAdminHomeProps> = ({ members, loading }) => {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = members.length;
    const withPhoto = members.filter((m) => m.photoUrl).length;
    return {
      total,
      withPhoto,
      male: members.filter((m) => m.gender === 'M').length,
      female: members.filter((m) => m.gender === 'F').length,
      coverage: total ? Math.round((withPhoto / total) * 100) : 0,
    };
  }, [members]);

  const noPhoto = useMemo(() => members.filter((m) => !m.photoUrl), [members]);
  const noParents = useMemo(() => members.filter((m) => !m.fatherId && !m.motherId), [members]);
  const noBirth = useMemo(() => members.filter((m) => !m.birthDate), [members]);
  const recent = useMemo(
    () =>
      [...members]
        .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
        .slice(0, 5),
    [members]
  );

  const openHub = (id: string | number) => navigate(`/admin/members?edit=${id}`);

  const AttentionGroup: React.FC<{ title: string; list: Member[]; reason: string }> = ({ title, list, reason }) => {
    if (list.length === 0) return null;
    return (
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h4 className="text-sm font-extrabold text-gray-800 dark:text-zinc-100">{title}</h4>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{list.length} members</span>
        </div>
        <div className="space-y-2">
          {list.slice(0, 3).map((m) => (
            <button key={m.id} onClick={() => openHub(m.id)} className="w-full flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl px-3 py-2.5 text-left">
              <Avatar m={m} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-gray-900 dark:text-white truncate">{fullName(m)}</span>
                <span className="block text-xs text-gray-400 font-semibold">{reason}</span>
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          ))}
          {list.length > 3 && (
            <p className="text-xs font-semibold text-gray-400 pl-1">and {list.length - 3} more — open Members to work through them.</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="text-sm font-semibold">Loading your registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Athokpam Admin</h2>
        <p className="text-sm text-gray-400 font-semibold mt-0.5">Shamu Athokpam's Family Tree</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Members', value: stats.total },
          { label: 'Portraits', value: stats.withPhoto },
          { label: 'Male', value: stats.male },
          { label: 'Female', value: stats.female },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
            <p className="text-3xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Portrait coverage */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Portrait Coverage</h3>
          <span className="text-sm font-black text-amber-700 dark:text-amber-400">{stats.coverage}%</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${stats.coverage}%` }} />
        </div>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2.5">
          {stats.withPhoto} of {stats.total} members have a portrait.
        </p>
        <Link to="/admin/photos" className="mt-3 min-h-[48px] px-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2">
          <Camera className="w-5 h-5" /> Add Missing Portraits
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/admin/members?new=1" className="min-h-[76px] bg-amber-600 text-white rounded-3xl p-4 flex flex-col justify-between shadow-md">
          <UserPlus className="w-6 h-6" />
          <span className="text-sm font-extrabold">Add Member</span>
        </Link>
        <Link to="/admin/members" className="min-h-[76px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 flex flex-col justify-between shadow-sm text-gray-900 dark:text-white">
          <Users className="w-6 h-6 text-amber-600" />
          <span className="text-sm font-extrabold">All Members</span>
        </Link>
        <Link to="/admin/photos" className="min-h-[76px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 flex flex-col justify-between shadow-sm text-gray-900 dark:text-white">
          <Images className="w-6 h-6 text-amber-600" />
          <span className="text-sm font-extrabold">Portraits</span>
        </Link>
        <Link to="/tree" className="min-h-[76px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 flex flex-col justify-between shadow-sm text-gray-900 dark:text-white">
          <GitMerge className="w-6 h-6 text-amber-600" />
          <span className="text-sm font-extrabold">View Tree</span>
        </Link>
      </div>

      {/* Needs attention */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">Needs Attention</h3>
        <AttentionGroup title="Missing portrait" list={noPhoto} reason="No portrait — tap to add one" />
        <AttentionGroup title="No parents linked" list={noParents} reason="Father & mother not linked" />
        <AttentionGroup title="No birth date" list={noBirth} reason="Birth date not recorded" />
        {noPhoto.length === 0 && noParents.length === 0 && noBirth.length === 0 && (
          <p className="text-sm text-gray-500">Everything is complete. Nice work.</p>
        )}
      </div>

      {/* Recently updated */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white mb-3">Recently Updated</h3>
        <div className="space-y-2">
          {recent.map((m) => (
            <button key={m.id} onClick={() => openHub(m.id)} className="w-full flex items-center gap-3 rounded-2xl px-2 py-2 text-left">
              <Avatar m={m} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-gray-900 dark:text-white truncate">{fullName(m)}</span>
                <span className="block text-xs text-gray-400 font-semibold">
                  {m.gender === 'F' ? 'Female' : 'Male'}
                  {m.birthDate ? ` · b. ${new Date(m.birthDate).getFullYear()}` : ''}
                </span>
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileAdminHome;

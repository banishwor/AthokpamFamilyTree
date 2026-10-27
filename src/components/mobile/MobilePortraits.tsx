import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Camera, Loader2, Search, X } from 'lucide-react';
import { Member } from '../../types';
import { apiService } from '../../services/api';
import { getDirectPhotoUrl } from '../../utils';
import { fullName, sortedByName } from '../../utils/memberSave';
import PhotoPickerField from '../PhotoPickerField';
import { ProcessedPhoto } from '../../utils/image';

/**
 * Phase B — the mobile Portraits tab.
 *
 * A coverage header (how many of the family have portraits), a
 * searchable 3-up grid of every member's portrait (initials tile
 * when missing), and All / With photo / Missing filter chips — the
 * Missing view is the worklist. Tapping anyone opens a photo sheet
 * with the shared PhotoPickerField (camera/gallery + on-device
 * compression); saving uploads and binds the portrait via
 * updateMemberPhoto, the same endpoint the desktop Photo Studio
 * uses. Desktop /admin/photos keeps the classic studio untouched.
 */

type Filter = 'all' | 'with' | 'missing';

const initials = (m: Member) =>
  `${(m.firstName || '?').charAt(0)}${(m.lastName || '').charAt(0)}`.toUpperCase();

const hasPhoto = (m: Member) => !!m.photoUrl && m.photoUrl.trim() !== '';

interface MobilePortraitsProps {
  members: Member[];
  loading: boolean;
  onRefresh: () => void;
}

export const MobilePortraits: React.FC<MobilePortraitsProps> = ({ members, loading, onRefresh }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<Member | null>(null);
  const [picked, setPicked] = useState<ProcessedPhoto | null>(null);
  const [saving, setSaving] = useState(false);
  const deepLinkHandled = useRef(false);

  const sorted = useMemo(() => sortedByName(members), [members]);
  const withPhotoCount = useMemo(() => members.filter(hasPhoto).length, [members]);
  const missingCount = members.length - withPhotoCount;
  const coverage = members.length > 0 ? Math.round((withPhotoCount / members.length) * 100) : 0;

  // Deep link: /admin/photos?memberId=<id> (dashboard Photo buttons)
  // opens that member's photo sheet directly.
  useEffect(() => {
    if (deepLinkHandled.current || members.length === 0) return;
    const mid = searchParams.get('memberId');
    if (mid) {
      const m = members.find((x) => String(x.id) === mid);
      if (m) {
        setEditing(m);
        setPicked(null);
      }
      deepLinkHandled.current = true;
      setSearchParams({}, { replace: true });
    }
  }, [members, searchParams, setSearchParams]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((m) => {
      if (filter === 'with' && !hasPhoto(m)) return false;
      if (filter === 'missing' && hasPhoto(m)) return false;
      if (q && !fullName(m).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sorted, filter, query]);

  const openEditor = (m: Member) => {
    setEditing(m);
    setPicked(null);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditing(null);
    setPicked(null);
  };

  const handleSave = async () => {
    if (!editing || !picked) return;
    setSaving(true);
    const toastId = toast.loading('Uploading portrait — this can take up to a minute…');
    try {
      const up = await apiService.uploadPhoto(picked.base64, `member-${editing.id}.jpg`);
      const url = up.fileUrl || up.photoUrl;
      if (!up.success || !url) {
        throw new Error(up.message || 'Photo upload failed.');
      }
      const res = await apiService.updateMemberPhoto(String(editing.id), url);
      if (!res.success) {
        throw new Error(res.message || 'Could not link the photo to this member.');
      }
      toast.success(`Portrait saved for ${fullName(editing)}.`, { id: toastId });
      setEditing(null);
      setPicked(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save the portrait. Please try again.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: members.length },
    { key: 'with', label: 'With photo', count: withPhotoCount },
    { key: 'missing', label: 'Missing', count: missingCount },
  ];

  return (
    <div className="animate-view-in">
      {/* Coverage header */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Portraits</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {withPhotoCount} of {members.length} members have a portrait
            </p>
          </div>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{coverage}%</span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${coverage}%` }} />
        </div>
        {missingCount > 0 && (
          <p className="text-xs text-gray-400 mt-2.5">
            {missingCount} relative{missingCount === 1 ? '' : 's'} still need{missingCount === 1 ? 's' : ''} a portrait — tap{' '}
            <button type="button" onClick={() => setFilter('missing')} className="font-bold text-amber-700 dark:text-amber-400 underline">
              Missing
            </button>{' '}
            to work through them.
          </p>
        )}
      </div>

      {/* Search + filters (sticky under the app bar area) */}
      <div className="sticky top-0 z-20 -mx-4 px-4 pt-3 pb-2 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            className="w-full pl-11 pr-4 min-h-[52px] text-base bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
          />
        </div>
        <div className="flex gap-2 mt-2.5">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              aria-pressed={filter === c.key}
              className={`min-h-[44px] px-4 rounded-full text-sm font-bold border transition ${
                filter === c.key
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300'
              }`}
            >
              {c.label} · {c.count}
            </button>
          ))}
        </div>
      </div>

      {/* Grid / worklist */}
      {loading && members.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
          <span className="text-sm font-semibold">Loading portraits…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="py-14 text-center">
          <p className="font-bold text-gray-700 dark:text-zinc-200">
            {filter === 'missing' && !query ? 'Every member has a portrait. 🎉' : 'No one matches that.'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === 'missing' && !query ? 'Portrait coverage is complete.' : 'Try a different name or filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 pt-1">
          {visible.map((m) => {
            const photo = hasPhoto(m) ? getDirectPhotoUrl(m.photoUrl) : '';
            const female = String(m.gender).toUpperCase().startsWith('F');
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => openEditor(m)}
                className="text-left active:scale-[0.97] transition"
                aria-label={`${hasPhoto(m) ? 'Change' : 'Add'} portrait for ${fullName(m)}`}
              >
                <span
                  className={`relative block aspect-square rounded-2xl overflow-hidden ${
                    photo
                      ? ''
                      : `border-2 border-dashed ${female ? 'border-pink-300 dark:border-pink-900 bg-pink-50 dark:bg-pink-950/20' : 'border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20'}`
                  }`}
                >
                  {photo ? (
                    <img src={photo} alt={fullName(m)} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span
                      className={`w-full h-full flex items-center justify-center text-xl font-black ${
                        female ? 'text-pink-400 dark:text-pink-500' : 'text-amber-500 dark:text-amber-400'
                      }`}
                    >
                      {initials(m)}
                    </span>
                  )}
                  {!photo && (
                    <span className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center shadow">
                      <Camera className="w-4 h-4" />
                    </span>
                  )}
                </span>
                <span className="block mt-1.5 text-[11px] leading-tight font-bold text-gray-700 dark:text-zinc-200 text-center line-clamp-2">
                  {fullName(m)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Per-member photo sheet */}
      {editing && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-end justify-center" onClick={closeEditor}>
          <div
            className="w-full max-w-md max-h-[92dvh] overflow-y-auto overscroll-contain-y bg-white dark:bg-zinc-900 rounded-t-3xl p-5 animate-sheet-up"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Portrait for ${fullName(editing)}`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">{fullName(editing)}</h3>
                <p className="text-sm text-gray-400">
                  {hasPhoto(editing) ? 'Replace the current portrait' : 'Add a portrait'}
                  {editing.birthDate ? ` · b. ${new Date(editing.birthDate).getFullYear()}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <PhotoPickerField
              variant="large"
              currentPhotoUrl={editing.photoUrl}
              memberName={fullName(editing)}
              value={picked}
              onChange={setPicked}
            />

            <button
              type="button"
              onClick={handleSave}
              disabled={!picked || saving}
              className="w-full min-h-[56px] mt-5 bg-amber-600 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 text-white text-base font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving…
                </>
              ) : picked ? (
                'Save Portrait'
              ) : (
                'Pick a photo first'
              )}
            </button>
            {saving && (
              <p className="text-xs text-gray-400 text-center mt-2">Uploads go through Google Drive and can take up to a minute — keep this open.</p>
            )}

            <button
              type="button"
              onClick={() => navigate(`/admin/members?edit=${editing.id}`)}
              disabled={saving}
              className="w-full min-h-[48px] mt-2 text-sm font-bold text-amber-700 dark:text-amber-400"
            >
              Edit full details instead →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePortraits;

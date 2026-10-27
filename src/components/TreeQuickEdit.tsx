import React, { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Member } from '../types';
import { apiService } from '../services/api';
import PhotoPickerField from './PhotoPickerField';
import SearchableSelect from './SearchableSelect';
import { ProcessedPhoto } from '../utils/image';
import { formatDateInput, fullName, saveMemberWithSpouseLink, sortedByName } from '../utils/memberSave';

interface TreeQuickEditProps {
  member: Member;
  allMembers: Member[];
  onClose: () => void;
  onSaved: () => void;
}

const inputCls =
  'w-full h-12 px-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500';
const labelCls = 'block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5';

/**
 * Compact editor that opens over the Family Tree page when an admin
 * taps the pencil on a person's card. Quick fixes only — the full
 * editor (education, biography, delete) stays in Admin → Members.
 * Save mirrors MemberHub exactly: photo upload first, then one
 * update with reciprocal spouse linking.
 */
export const TreeQuickEdit: React.FC<TreeQuickEditProps> = ({ member, allMembers, onClose, onSaved }) => {
  const [firstName, setFirstName] = useState(member.firstName || '');
  const [middleName, setMiddleName] = useState(member.middleName || '');
  const [lastName, setLastName] = useState(member.lastName || '');
  const [gender, setGender] = useState<'M' | 'F'>(member.gender === 'F' ? 'F' : 'M');
  const [birthDate, setBirthDate] = useState(formatDateInput(member.birthDate));
  const [deathDate, setDeathDate] = useState(formatDateInput(member.deathDate));
  const [fatherId, setFatherId] = useState(member.fatherId ? String(member.fatherId) : '');
  const [motherId, setMotherId] = useState(member.motherId ? String(member.motherId) : '');
  const [spouseId, setSpouseId] = useState(member.spouseId ? String(member.spouseId) : '');
  const [occupation, setOccupation] = useState(member.occupation || '');
  const [address, setAddress] = useState(member.address || '');
  const [photo, setPhoto] = useState<ProcessedPhoto | null>(null);
  const [saving, setSaving] = useState(false);

  const selfId = String(member.id);
  const toOptions = (list: Member[]) =>
    sortedByName(list).map((m) => ({ id: String(m.id), name: fullName(m) }));
  const fatherOptions = useMemo(
    () => toOptions(allMembers.filter((m) => m.gender === 'M' && String(m.id) !== selfId)),
    [allMembers]
  );
  const motherOptions = useMemo(
    () => toOptions(allMembers.filter((m) => m.gender === 'F' && String(m.id) !== selfId)),
    [allMembers]
  );
  const spouseOptions = useMemo(
    () => toOptions(allMembers.filter((m) => String(m.id) !== selfId && (gender === 'M' ? m.gender === 'F' : m.gender === 'M'))),
    [allMembers, gender]
  );

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and Last name are required.');
      return;
    }
    setSaving(true);
    const apiToast = toast.loading('Saving… the family server can take up to a minute. Please keep this screen open.');
    try {
      let photoUrl = member.photoUrl || undefined;
      if (photo) {
        const up = await apiService.uploadPhoto(photo.base64, `member-${member.id}.jpg`);
        const url = up.fileUrl || up.photoUrl;
        if (up.success && url) {
          photoUrl = url;
        } else {
          toast('Photo upload failed — details were saved with the previous portrait.', { icon: '⚠️' });
        }
      }
      const payload: Partial<Member> = {
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        gender,
        fatherId: fatherId || null,
        motherId: motherId || null,
        spouseId: spouseId || null,
        birthDate: birthDate || undefined,
        deathDate: deathDate || undefined,
        occupation: occupation.trim() || undefined,
        address: address.trim() || undefined,
        photoUrl,
      };
      await saveMemberWithSpouseLink(allMembers, member, payload, spouseId);
      toast.success(`${fullName(member)} updated.`, { id: apiToast });
      onSaved();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save. Please try again.', { id: apiToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/55 flex items-end sm:items-center justify-center" onClick={() => !saving && onClose()}>
      <div
        className="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto bg-gray-50 dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-sheet-up sm:animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur px-5 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between rounded-t-3xl">
          <div className="min-w-0">
            <h3 className="text-base font-black text-gray-900 dark:text-white truncate">Edit member</h3>
            <p className="text-xs text-gray-400 truncate">{fullName(member)} · quick edit from the tree</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 disabled:opacity-50"
            aria-label="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl px-4 py-3">
            <PhotoPickerField variant="compact" currentPhotoUrl={member.photoUrl} memberName={fullName(member)} value={photo} onChange={setPhoto} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name *</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Middle Name</label>
              <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Last Name *</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gender</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                {(['M', 'F'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`h-10 rounded-lg text-sm font-bold transition ${gender === g ? 'bg-amber-600 text-white shadow' : 'text-gray-500 dark:text-zinc-400'}`}
                  >
                    {g === 'M' ? 'Male' : 'Female'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Birth Date</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Death Date</label>
              <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="space-y-3">
            <SearchableSelect id="qe-father" label="Father" value={fatherId} onChange={setFatherId} options={fatherOptions} emptyLabel="-- No Father linked --" placeholder="Select Father" />
            <SearchableSelect id="qe-mother" label="Mother" value={motherId} onChange={setMotherId} options={motherOptions} emptyLabel="-- No Mother linked --" placeholder="Select Mother" />
            <SearchableSelect id="qe-spouse" label="Spouse" value={spouseId} onChange={setSpouseId} options={spouseOptions} emptyLabel="-- No Spouse linked --" placeholder="Select Spouse" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Occupation</label>
              <input value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            For education, biography or deleting a member, use the full editor in Admin → Members.
          </p>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur px-5 py-3 border-t border-gray-200 dark:border-zinc-800 flex gap-2"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-[52px] px-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-[52px] rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreeQuickEdit;

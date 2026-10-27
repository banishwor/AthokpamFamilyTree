import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Member } from '../../types';
import { apiService } from '../../services/api';
import SearchableSelect from '../SearchableSelect';
import PhotoPickerField from '../PhotoPickerField';
import { ProcessedPhoto } from '../../utils/image';
import { formatDateInput, fullName, memberCompleteness, saveMemberWithSpouseLink } from '../../utils/memberSave';
import { GenderToggle, MobileSection, mobileInputCls, mobileLabelCls } from './shared';

interface MemberHubProps {
  member: Member;
  allMembers: Member[];
  onClose: () => void;
  /** Called after a successful save or delete (parent refreshes + closes) */
  onDone: () => void;
}

interface HubFields {
  firstName: string; middleName: string; lastName: string; gender: string;
  fatherId: string; motherId: string; spouseId: string;
  birthDate: string; deathDate: string;
  occupation: string; education: string; address: string; bio: string;
}

function fieldsFromMember(m: Member): HubFields {
  return {
    firstName: m.firstName || '', middleName: m.middleName || '', lastName: m.lastName || '',
    gender: m.gender || 'M',
    fatherId: m.fatherId ? String(m.fatherId) : '', motherId: m.motherId ? String(m.motherId) : '',
    spouseId: m.spouseId ? String(m.spouseId) : '',
    birthDate: formatDateInput(m.birthDate), deathDate: formatDateInput(m.deathDate),
    occupation: m.occupation || '', education: m.education || '', address: m.address || '', bio: m.bio || '',
  };
}

/**
 * Member Hub — the phone-first editor. Portrait and every detail
 * live on one full screen and save together in one action.
 * Drafts are kept on-device; leaving with unsaved edits asks first.
 */
export const MemberHub: React.FC<MemberHubProps> = ({ member, allMembers, onClose, onDone }) => {
  const draftKey = `athokpam-hub-draft-${member.id}`;
  const initial = useMemo(() => fieldsFromMember(member), [member]);
  const [fields, setFields] = useState<HubFields>(initial);
  const [photo, setPhoto] = useState<ProcessedPhoto | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const restoredOnce = useRef(false);

  // Restore an on-device draft once, if one exists
  useEffect(() => {
    if (restoredOnce.current) return;
    restoredOnce.current = true;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw) as HubFields;
        if (JSON.stringify(draft) !== JSON.stringify(initial)) {
          setFields(draft);
          setDraftRestored(true);
        }
      }
    } catch { /* drafts are best-effort */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = JSON.stringify(fields) !== JSON.stringify(initial) || photo !== null;

  // Autosave draft while editing
  useEffect(() => {
    if (!dirty || photo) {
      // photo (base64) is too large for a draft; fields-only drafts
      if (!dirty) return;
    }
    try {
      localStorage.setItem(draftKey, JSON.stringify(fields));
    } catch { /* storage full/blocked: ignore */ }
  }, [fields, dirty, draftKey, photo]);

  const set = (k: keyof HubFields) => (v: string) => setFields((f) => ({ ...f, [k]: v }));
  const candidates = allMembers.filter((m) => String(m.id) !== String(member.id));
  const toOptions = (list: Member[]) => list.map((m) => ({ id: String(m.id), name: fullName(m) }));
  const { percent } = memberCompleteness(member);

  const handleBack = () => {
    if (dirty && !saving) setConfirmLeave(true);
    else onClose();
  };

  const handleSave = async () => {
    if (!fields.firstName.trim() || !fields.lastName.trim()) {
      toast.error('First name and Last name are strictly required.');
      return;
    }
    setSaving(true);
    const apiToast = toast.loading('Saving portrait and details...');
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
        firstName: fields.firstName.trim(),
        middleName: fields.middleName.trim(),
        lastName: fields.lastName.trim(),
        gender: fields.gender,
        fatherId: fields.fatherId || null,
        motherId: fields.motherId || null,
        spouseId: fields.spouseId || null,
        birthDate: fields.birthDate || undefined,
        deathDate: fields.deathDate || undefined,
        occupation: fields.occupation.trim() || undefined,
        education: fields.education.trim() || undefined,
        address: fields.address.trim() || undefined,
        bio: fields.bio.trim() || undefined,
        photoUrl,
      };
      await saveMemberWithSpouseLink(allMembers, member, payload, fields.spouseId);
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      toast.success('Member updated — portrait and details saved together.', { id: apiToast });
      onDone();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save. Please try again.', { id: apiToast });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await apiService.deleteMember(member.id);
      if (!res.success) throw new Error(res.message || 'Delete failed.');
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      toast.success(`${fullName(member)} removed from the registry.`);
      onDone();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete this member.');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden bg-gray-50 dark:bg-zinc-950 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 pt-3 pb-2 flex items-center gap-2">
        <button onClick={handleBack} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-gray-700 dark:text-zinc-200" aria-label="Back to members">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-gray-900 dark:text-white truncate">{fullName(member)}</h2>
          <p className="text-xs text-gray-400 font-semibold">Profile {percent}% complete{draftRestored ? ' · Draft restored' : ''}</p>
        </div>
      </div>

      <div className="px-4 pb-40 space-y-4">
        <MobileSection title="Portrait">
          <PhotoPickerField currentPhotoUrl={member.photoUrl} memberName={fullName(member)} value={photo} onChange={setPhoto} />
        </MobileSection>

        <MobileSection title="Basic Info">
          <div>
            <label className={mobileLabelCls} htmlFor="hub-first">First Name *</label>
            <input id="hub-first" className={mobileInputCls} value={fields.firstName} onChange={(e) => set('firstName')(e.target.value)} placeholder="First name" />
          </div>
          <div>
            <label className={mobileLabelCls} htmlFor="hub-middle">Middle Name</label>
            <input id="hub-middle" className={mobileInputCls} value={fields.middleName} onChange={(e) => set('middleName')(e.target.value)} placeholder="Middle name (optional)" />
          </div>
          <div>
            <label className={mobileLabelCls} htmlFor="hub-last">Last Name *</label>
            <input id="hub-last" className={mobileInputCls} value={fields.lastName} onChange={(e) => set('lastName')(e.target.value)} placeholder="Last name" />
          </div>
          <div>
            <span className={mobileLabelCls}>Gender *</span>
            <GenderToggle value={fields.gender} onChange={set('gender')} />
          </div>
        </MobileSection>

        <MobileSection title="Family Links">
          <div>
            <span className={mobileLabelCls}>Father</span>
            <SearchableSelect id="hub-father" value={fields.fatherId} onChange={set('fatherId')} emptyLabel="-- No Father linked --" placeholder="Select father" options={toOptions(candidates.filter((m) => m.gender === 'M'))} />
          </div>
          <div>
            <span className={mobileLabelCls}>Mother</span>
            <SearchableSelect id="hub-mother" value={fields.motherId} onChange={set('motherId')} emptyLabel="-- No Mother linked --" placeholder="Select mother" options={toOptions(candidates.filter((m) => m.gender === 'F'))} />
          </div>
          <div>
            <span className={mobileLabelCls}>Spouse</span>
            <SearchableSelect id="hub-spouse" value={fields.spouseId} onChange={set('spouseId')} emptyLabel="-- No Spouse linked --" placeholder="Select spouse" options={toOptions(candidates.filter((m) => (fields.gender === 'M' ? m.gender === 'F' : fields.gender === 'F' ? m.gender === 'M' : true)))} />
          </div>
        </MobileSection>

        <MobileSection title="Dates">
          <div>
            <label className={mobileLabelCls} htmlFor="hub-birth">Birth Date</label>
            <input id="hub-birth" type="date" className={mobileInputCls} value={fields.birthDate} onChange={(e) => set('birthDate')(e.target.value)} />
          </div>
          <div>
            <label className={mobileLabelCls} htmlFor="hub-death">Death Date</label>
            <input id="hub-death" type="date" className={mobileInputCls} value={fields.deathDate} onChange={(e) => set('deathDate')(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1.5">Leave empty if alive.</p>
          </div>
        </MobileSection>

        <MobileSection title="Details">
          <div>
            <label className={mobileLabelCls} htmlFor="hub-occ">Occupation</label>
            <input id="hub-occ" className={mobileInputCls} value={fields.occupation} onChange={(e) => set('occupation')(e.target.value)} placeholder="e.g. Teacher, Farmer" />
          </div>
          <div>
            <label className={mobileLabelCls} htmlFor="hub-edu">Education</label>
            <input id="hub-edu" className={mobileInputCls} value={fields.education} onChange={(e) => set('education')(e.target.value)} placeholder="e.g. B.Sc, Class XII" />
          </div>
          <div>
            <label className={mobileLabelCls} htmlFor="hub-addr">Home Address / Location</label>
            <input id="hub-addr" className={mobileInputCls} value={fields.address} onChange={(e) => set('address')(e.target.value)} placeholder="Village, District" />
          </div>
          <div>
            <label className={mobileLabelCls} htmlFor="hub-bio">Biography &amp; Notes</label>
            <textarea id="hub-bio" rows={4} className={`${mobileInputCls} h-auto`} value={fields.bio} onChange={(e) => set('bio')(e.target.value)} placeholder="Short life history, achievements..." />
          </div>
        </MobileSection>

        <section className="bg-red-50/60 dark:bg-red-950/10 border border-red-100 dark:border-red-950/40 rounded-3xl p-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-red-700 dark:text-red-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-600/80 dark:text-red-300/70 mb-3">Deleting removes this member from the registry permanently.</p>
          <button onClick={() => setConfirmDelete(true)} className="w-full min-h-[52px] bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-extrabold rounded-2xl flex items-center justify-center gap-2">
            <Trash2 className="w-5 h-5" /> Delete Member
          </button>
        </section>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 inset-x-0 z-10 md:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 px-4 pt-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <div className="flex gap-3">
          <button onClick={handleBack} className="px-5 min-h-[52px] bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 font-bold rounded-2xl">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 min-h-[52px] bg-amber-600 disabled:opacity-50 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Leave confirmation */}
      {confirmLeave && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-end justify-center" onClick={() => setConfirmLeave(false)}>
          <div className="bg-white dark:bg-zinc-900 w-full rounded-t-3xl p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Discard changes?</h3>
            <p className="text-sm text-gray-500">You have unsaved edits. Your draft is kept on this phone, but the photo (if changed) is not.</p>
            <button onClick={() => { setConfirmLeave(false); onClose(); }} className="w-full min-h-[52px] bg-red-600 text-white font-extrabold rounded-2xl">Discard &amp; Go Back</button>
            <button onClick={() => setConfirmLeave(false)} className="w-full min-h-[52px] bg-gray-100 dark:bg-zinc-800 font-bold rounded-2xl text-gray-800 dark:text-zinc-100">Keep Editing</button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-end justify-center" onClick={() => setConfirmDelete(false)}>
          <div className="bg-white dark:bg-zinc-900 w-full rounded-t-3xl p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Delete {fullName(member)}?</h3>
            <p className="text-sm text-gray-500">This permanently removes the member from the family registry. This cannot be undone.</p>
            <button onClick={handleDelete} disabled={deleting} className="w-full min-h-[52px] bg-red-600 disabled:opacity-50 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2">
              {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />} Yes, Delete
            </button>
            <button onClick={() => setConfirmDelete(false)} className="w-full min-h-[52px] bg-gray-100 dark:bg-zinc-800 font-bold rounded-2xl text-gray-800 dark:text-zinc-100">Keep Member</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberHub;

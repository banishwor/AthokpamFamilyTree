import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Member } from '../../types';
import { apiService } from '../../services/api';
import SearchableSelect from '../SearchableSelect';
import PhotoPickerField from '../PhotoPickerField';
import { ProcessedPhoto } from '../../utils/image';
import { fullName, saveMemberWithSpouseLink, sortedByName } from '../../utils/memberSave';
import { GenderToggle, MobileSection, mobileInputCls, mobileLabelCls } from './shared';

interface AddMemberWizardProps {
  allMembers: Member[];
  onClose: () => void;
  onCreated: () => void;
}

const STEPS = ['Who', 'Family', 'Details'];

/**
 * Add Member — phone-first step flow covering ALL fields of the
 * classic form: 1) photo + name + gender, 2) family links,
 * 3) dates, work, education, address, bio + review.
 */
export const AddMemberWizard: React.FC<AddMemberWizardProps> = ({ allMembers, onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<ProcessedPhoto | null>(null);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('M');
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');
  const [spouseId, setSpouseId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [creating, setCreating] = useState(false);

  const typedName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim().toLowerCase();
  const duplicate = useMemo(() => {
    if (!firstName.trim() || !lastName.trim()) return null;
    return (
      allMembers.find((m) => fullName(m).toLowerCase() === typedName) ||
      allMembers.find(
        (m) =>
          `${m.firstName} ${m.lastName}`.trim().toLowerCase() ===
          `${firstName} ${lastName}`.trim().toLowerCase()
      ) ||
      null
    );
  }, [allMembers, typedName, firstName, lastName]);

  const nameOf = (id: string) => {
    const m = allMembers.find((x) => String(x.id) === id);
    return m ? fullName(m) : '—';
  };
  const toOptions = (list: Member[]) => sortedByName(list).map((m) => ({ id: String(m.id), name: fullName(m) }));

  const goNext = () => {
    if (step === 1 && (!firstName.trim() || !lastName.trim())) {
      toast.error('First name and Last name are required before continuing.');
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleCreate = async () => {
    setCreating(true);
    const apiToast = toast.loading('Creating member… the family server can take up to a minute. Please keep this screen open.');
    try {
      let photoUrl: string | undefined;
      if (photo) {
        const up = await apiService.uploadPhoto(photo.base64, `member-new.jpg`);
        const url = up.fileUrl || up.photoUrl;
        if (up.success && url) photoUrl = url;
        else toast('Photo upload failed — member created without a portrait; add it from their profile.', { icon: '⚠️' });
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
        education: education.trim() || undefined,
        address: address.trim() || undefined,
        bio: bio.trim() || undefined,
        photoUrl,
      };
      await saveMemberWithSpouseLink(allMembers, null, payload, spouseId);
      toast.success(`${firstName} ${lastName} added to the family registry.`, { id: apiToast });
      onCreated();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create member. Please try again.', { id: apiToast });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden bg-gray-50 dark:bg-zinc-950 overflow-y-auto animate-view-in overscroll-contain-y">
      <div className="sticky top-0 z-10 bg-gray-50/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={() => (step > 1 ? setStep(step - 1) : onClose())} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-gray-700 dark:text-zinc-200" aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-black text-gray-900 dark:text-white flex-1">Add Family Member</h2>
          <span className="text-xs font-bold text-gray-400">Step {step} of 3</span>
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'}`}>
                  {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span className={`text-xs font-bold ${step === i + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${step > i + 1 ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-zinc-800'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="px-4 pb-40 space-y-4 pt-2">
        {step === 1 && (
          <>
            <MobileSection title="Portrait">
              <PhotoPickerField memberName={`${firstName} ${lastName}`.trim()} value={photo} onChange={setPhoto} />
            </MobileSection>
            <MobileSection title="Name & Gender">
              <div>
                <label className={mobileLabelCls} htmlFor="wiz-first">First Name *</label>
                <input id="wiz-first" className={mobileInputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
              </div>
              <div>
                <label className={mobileLabelCls} htmlFor="wiz-middle">Middle Name</label>
                <input id="wiz-middle" className={mobileInputCls} value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle name (optional)" />
              </div>
              <div>
                <label className={mobileLabelCls} htmlFor="wiz-last">Last Name *</label>
                <input id="wiz-last" className={mobileInputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
              </div>
              {duplicate && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl text-amber-800 dark:text-amber-300 text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span><strong>{fullName(duplicate)}</strong> is already in the registry. Continue only if this is a different person.</span>
                </div>
              )}
              <div>
                <span className={mobileLabelCls}>Gender *</span>
                <GenderToggle value={gender} onChange={setGender} />
              </div>
            </MobileSection>
          </>
        )}

        {step === 2 && (
          <MobileSection title="Family Links">
            <div>
              <span className={mobileLabelCls}>Father</span>
              <SearchableSelect id="wiz-father" value={fatherId} onChange={setFatherId} emptyLabel="-- No Father linked --" placeholder="Select father" options={toOptions(allMembers.filter((m) => m.gender === 'M'))} />
            </div>
            <div>
              <span className={mobileLabelCls}>Mother</span>
              <SearchableSelect id="wiz-mother" value={motherId} onChange={setMotherId} emptyLabel="-- No Mother linked --" placeholder="Select mother" options={toOptions(allMembers.filter((m) => m.gender === 'F'))} />
            </div>
            <div>
              <span className={mobileLabelCls}>Spouse</span>
              <SearchableSelect id="wiz-spouse" value={spouseId} onChange={setSpouseId} emptyLabel="-- No Spouse linked --" placeholder="Select spouse" options={toOptions(allMembers.filter((m) => (gender === 'M' ? m.gender === 'F' : gender === 'F' ? m.gender === 'M' : true)))} />
            </div>
            <p className="text-xs text-gray-400">Links can also be added later from the member's profile.</p>
          </MobileSection>
        )}

        {step === 3 && (
          <>
            <MobileSection title="Dates">
              <div>
                <label className={mobileLabelCls} htmlFor="wiz-birth">Birth Date</label>
                <input id="wiz-birth" type="date" className={mobileInputCls} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
              <div>
                <label className={mobileLabelCls} htmlFor="wiz-death">Death Date</label>
                <input id="wiz-death" type="date" className={mobileInputCls} value={deathDate} onChange={(e) => setDeathDate(e.target.value)} />
                <p className="text-xs text-gray-400 mt-1.5">Leave empty if alive.</p>
              </div>
            </MobileSection>
            <MobileSection title="Details">
              <div>
                <label className={mobileLabelCls} htmlFor="wiz-occ">Occupation</label>
                <input id="wiz-occ" className={mobileInputCls} value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Teacher, Farmer" />
              </div>
              <div>
                <label className={mobileLabelCls} htmlFor="wiz-edu">Education</label>
                <input id="wiz-edu" className={mobileInputCls} value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. B.Sc, Class XII" />
              </div>
              <div>
                <label className={mobileLabelCls} htmlFor="wiz-addr">Home Address / Location</label>
                <input id="wiz-addr" className={mobileInputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village, District" />
              </div>
              <div>
                <label className={mobileLabelCls} htmlFor="wiz-bio">Biography &amp; Notes</label>
                <textarea id="wiz-bio" rows={4} className={`${mobileInputCls} h-auto`} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short life history, achievements..." />
              </div>
            </MobileSection>
            <MobileSection title="Review">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-gray-400 font-semibold">Name</dt><dd className="font-bold text-gray-900 dark:text-white text-right">{typedName || '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-gray-400 font-semibold">Gender</dt><dd className="font-bold text-gray-900 dark:text-white">{gender === 'F' ? 'Female' : 'Male'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-gray-400 font-semibold">Father</dt><dd className="font-bold text-gray-900 dark:text-white text-right">{fatherId ? nameOf(fatherId) : '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-gray-400 font-semibold">Mother</dt><dd className="font-bold text-gray-900 dark:text-white text-right">{motherId ? nameOf(motherId) : '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-gray-400 font-semibold">Spouse</dt><dd className="font-bold text-gray-900 dark:text-white text-right">{spouseId ? nameOf(spouseId) : '—'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-gray-400 font-semibold">Portrait</dt><dd className="font-bold text-gray-900 dark:text-white">{photo ? 'Added' : 'None'}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-gray-400 font-semibold">Born</dt><dd className="font-bold text-gray-900 dark:text-white">{birthDate || '—'}</dd></div>
              </dl>
            </MobileSection>
          </>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-10 md:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 px-4 pt-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-5 min-h-[52px] bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 font-bold rounded-2xl">Back</button>
          )}
          {step < 3 ? (
            <button onClick={goNext} className="flex-1 min-h-[52px] bg-amber-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md">
              Next <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleCreate} disabled={creating} className="flex-1 min-h-[52px] bg-amber-600 disabled:opacity-50 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md">
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {creating ? 'Creating...' : 'Create Member'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMemberWizard;

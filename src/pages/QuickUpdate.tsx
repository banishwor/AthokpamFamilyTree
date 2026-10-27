import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Member } from '../types';
import { getDirectPhotoUrl } from '../utils';
import {
  Lock,
  KeyRound,
  Search,
  User,
  Camera,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  GitMerge
} from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoPickerField from '../components/PhotoPickerField';
import { ProcessedPhoto, processPhotoFile } from '../utils/image';
import { formatDateInput } from '../utils/memberSave';

/**
 * Quick Update Portal — family members update their OWN details
 * with a shared password. Restricted by design: first name,
 * last name, date of birth and portrait only.
 *
 * Mobile-first step flow: password → find yourself → your
 * details → done. Desktop shows find + details side by side.
 * Photos go through the shared compression pipeline, so large
 * camera photos upload fine instead of hitting a size rejection.
 */
export const QuickUpdate: React.FC = () => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('family_tree_quick_update_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Form states (restricted field set — do not widen without the owner)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // Photo state (compressed on-device by the shared pipeline)
  const [photo, setPhoto] = useState<ProcessedPhoto | null>(null);

  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Done screen state
  const [savedName, setSavedName] = useState('');
  const [savedPhotoUrl, setSavedPhotoUrl] = useState<string | undefined>(undefined);

  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      passwordRef.current?.focus();
    } else {
      loadMembers();
    }
  }, [isAuthenticated]);

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const list = await apiService.getMembers();
      if (Array.isArray(list)) {
        setMembers(list.filter((m) => m.id && !String(m.id).startsWith('virtual')));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load family members list.');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Athokpam') {
      sessionStorage.setItem('family_tree_quick_update_auth', 'true');
      setIsAuthenticated(true);
      toast.success('Access Granted! Welcome to the portal.');
    } else {
      toast.error('Incorrect Password. Please try again.');
      setPasswordInput('');
      passwordRef.current?.focus();
    }
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setFirstName(member.firstName || '');
    setLastName(member.lastName || '');
    setBirthDate(formatDateInput(member.birthDate));
    setPhoto(null);
    setSavedName('');
  };

  const resetToFind = () => {
    setSelectedMember(null);
    setPhoto(null);
    setSavedName('');
    setSavedPhotoUrl(undefined);
    setSearchQuery('');
  };

  // Desktop nicety kept: dropping a file on the photo area still works
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please drop an image file (PNG, JPG, JPEG)');
      return;
    }
    try {
      setPhoto(await processPhotoFile(file));
    } catch {
      toast.error('Could not read that photo. Please try another.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Name fields cannot be blank.');
      return;
    }

    setSaving(true);
    const saveToast = toast.loading('Saving updates to lineage cloud...');

    try {
      let finalPhotoUrl = selectedMember.photoUrl;

      // 1. Upload photo if a new one was picked (already compressed)
      if (photo) {
        const uploadRes = await apiService.uploadPhoto(photo.base64, `member-${selectedMember.id}.jpg`);
        const uploadedUrl = uploadRes.fileUrl || uploadRes.photoUrl;

        if (uploadRes.success && uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
          await apiService.updateMemberPhoto(selectedMember.id, uploadedUrl);
        } else {
          throw new Error(uploadRes.message || 'Photo upload failed.');
        }
      }

      // 2. Update the restricted details
      const payload: Partial<Member> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birthDate.trim(),
        photoUrl: finalPhotoUrl
      };

      const updateRes = await apiService.updateMember(selectedMember.id, payload);
      if (!updateRes.success) {
        throw new Error(updateRes.message || 'Profile details update failed.');
      }

      toast.success('Your profile has been updated successfully!', { id: saveToast });

      await loadMembers();
      setSavedName(`${firstName.trim()} ${lastName.trim()}`);
      setSavedPhotoUrl(finalPhotoUrl);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while saving your profile changes.', { id: saveToast });
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const name = `${m.firstName} ${m.middleName || ''} ${m.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || String(m.id).includes(searchQuery);
  });

  const view: 'find' | 'edit' | 'done' = savedName ? 'done' : selectedMember ? 'edit' : 'find';

  const inputCls =
    'w-full px-4 min-h-[52px] py-3 text-base bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 dark:text-white';
  const labelCls =
    'block text-xs font-extrabold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5';

  /* ---------------- Password screen ---------------- */
  if (!isAuthenticated) {
    return (
      <div id="quick-update-auth-screen" className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 px-4 py-10 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">
              Quick Update Portal
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Enter the family access password to unlock and edit your personal details, birthdate, or photo.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-12 pr-12 min-h-[52px] py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full min-h-[52px] py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-extrabold text-sm tracking-wider uppercase rounded-2xl transition-all duration-300 shadow-md"
            >
              Verify &amp; Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ---------------- Find panel ---------------- */
  const findPanel = (
    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-black text-gray-950 dark:text-white uppercase tracking-wider">
          1. Find Your Profile
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Type your name below and tap your listing.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your name..."
          className="w-full pl-12 pr-4 min-h-[52px] py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 dark:text-white"
        />
      </div>

      {loadingMembers ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-sm text-gray-400 font-bold">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span>Loading family registry...</span>
        </div>
      ) : (
        <div className="space-y-2 md:max-h-[560px] md:overflow-y-auto md:pr-1">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((m) => {
              const isSelected = selectedMember?.id === m.id;
              const mFullName = `${m.firstName} ${m.middleName || ''} ${m.lastName}`.trim();
              return (
                <button
                  key={m.id}
                  onClick={() => handleMemberSelect(m)}
                  className={`w-full min-h-[64px] p-3 rounded-2xl border flex items-center gap-3 transition-all text-left ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 active:bg-gray-50 dark:active:bg-zinc-800/40'
                  }`}
                >
                  <span className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center border dark:border-zinc-700">
                    {m.photoUrl ? (
                      <img src={getDirectPhotoUrl(m.photoUrl)} alt={mFullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold truncate">{mFullName}</span>
                    {m.birthDate && (
                      <span className="block text-xs text-gray-400 mt-0.5">Born {formatDateInput(m.birthDate)}</span>
                    )}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="text-center py-8 text-sm text-gray-400 font-semibold space-y-1">
              <AlertCircle className="w-6 h-6 mx-auto text-gray-300 dark:text-zinc-700" />
              <p>No family member matches your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ---------------- Done panel ---------------- */
  const donePanel = (
    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 rounded-3xl p-8 shadow-sm text-center space-y-5">
      <span className="mx-auto w-20 h-20 rounded-full overflow-hidden bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
        {savedPhotoUrl ? (
          <img src={getDirectPhotoUrl(savedPhotoUrl)} alt={savedName} className="w-full h-full object-cover" />
        ) : (
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        )}
      </span>
      <div className="space-y-1.5">
        <h3 className="text-xl font-black text-gray-950 dark:text-white">You're updated, {savedName.split(' ')[0]}!</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Your profile changes are saved to the family tree. Everyone can see the new details right away.
        </p>
      </div>
      <div className="space-y-2.5 max-w-xs mx-auto">
        <Link to="/tree" className="w-full min-h-[52px] bg-amber-600 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md">
          <GitMerge className="w-5 h-5" /> See the Family Tree
        </Link>
        <button onClick={resetToFind} className="w-full min-h-[52px] bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 font-bold text-sm rounded-2xl">
          Update Another Profile
        </button>
      </div>
    </div>
  );

  /* ---------------- Edit panel ---------------- */
  const editPanel = selectedMember && (
    <div id="edit-form-panel" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 rounded-3xl p-5 sm:p-6 shadow-sm">
      <form onSubmit={handleUploadSubmit} className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Your Profile
            </span>
            <h3 className="text-lg font-black text-gray-950 dark:text-white leading-snug mt-1.5">
              {selectedMember.firstName} {selectedMember.lastName}
            </h3>
          </div>
          <button
            type="button"
            onClick={resetToFind}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-400 rounded-xl"
            aria-label="Choose another profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portrait — camera / gallery, compressed automatically */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`rounded-3xl ${dragOver ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}
        >
          <span className={labelCls}>Profile Picture</span>
          <PhotoPickerField
            currentPhotoUrl={selectedMember.photoUrl}
            memberName={`${selectedMember.firstName} ${selectedMember.lastName}`}
            value={photo}
            onChange={setPhoto}
          />
        </div>

        {/* Restricted details */}
        <div className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="qu-first">First Name</label>
            <input id="qu-first" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Tonu" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="qu-last">Last Name</label>
            <input id="qu-last" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Athokpam" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="qu-dob">Date of Birth</label>
            <input id="qu-dob" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <p className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
          <Camera className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Only your name, birth date and photo can be changed here. For anything else, please contact the family admin.
        </p>

        {/* Desktop / in-flow submit */}
        <button
          type="submit"
          disabled={saving}
          className="hidden md:flex w-full min-h-[52px] py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-extrabold text-sm tracking-wider uppercase rounded-2xl transition-all shadow-md items-center justify-center gap-2"
        >
          {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-5 h-5" /> Save My Updates</>}
        </button>

        {/* Mobile sticky submit */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 px-4 pt-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[52px] bg-amber-600 disabled:opacity-60 text-white font-extrabold text-sm tracking-wider uppercase rounded-2xl shadow-md flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-5 h-5" /> Save My Updates</>}
          </button>
        </div>
      </form>
    </div>
  );

  const lockedPanel = (
    <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-3">
      <User className="w-12 h-12 stroke-[1.5] text-amber-600/30" />
      <div className="space-y-1">
        <h4 className="text-sm font-black text-gray-800 dark:text-zinc-300 uppercase tracking-wider">2. Your Details</h4>
        <p className="text-xs text-gray-400 max-w-[260px] mx-auto leading-relaxed">
          Pick your profile from the list to update your name, date of birth, or photo.
        </p>
      </div>
    </div>
  );

  return (
    <div id="quick-update-portal" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          {view !== 'find' && (
            <button onClick={resetToFind} className="md:hidden inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-amber-700 dark:text-amber-400 self-start">
              <ArrowLeft className="w-4 h-4" /> All profiles
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Family Quick Update Portal
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
            EDIT YOUR PROFILE DETAILS DIRECTLY IN THE GENEALOGY DB
          </p>
        </div>

        {/* Mobile: one step at a time. Desktop: both panels side by side. */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className={`md:col-span-5 ${view !== 'find' ? 'hidden md:block' : ''}`}>{findPanel}</div>
          <div className={`md:col-span-7 ${view === 'find' ? 'hidden md:block' : ''}`}>
            {view === 'done' ? donePanel : view === 'edit' ? editPanel : lockedPanel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickUpdate;

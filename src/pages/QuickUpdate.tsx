import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { Member } from '../types';
import { getDirectPhotoUrl } from '../utils';
import { 
  Lock, 
  KeyRound, 
  Search, 
  User, 
  Calendar, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft, 
  X,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const QuickUpdate: React.FC = () => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('family_tree_quick_update_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  
  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64String, setBase64String] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Focus ref for security password input
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
        // Filter out virtual root nodes or temporary nodes if any
        setMembers(list.filter(m => m.id && !String(m.id).startsWith('virtual')));
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

  const formatDateInput = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (err) {
      return '';
    }
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setFirstName(member.firstName || '');
    setLastName(member.lastName || '');
    setBirthDate(formatDateInput(member.birthDate));
    
    // Clear photo upload cache
    setSelectedFile(null);
    setPreviewUrl(null);
    setBase64String(null);
    
    // Smooth scroll down to edit card on small viewport devices
    setTimeout(() => {
      document.getElementById('edit-form-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image is larger than 3MB. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      const fullBase64 = reader.result as string;
      const base64Content = fullBase64.split(',')[1];
      setBase64String(base64Content);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
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

      // 1. Upload photo if a new one is selected
      if (base64String && selectedFile) {
        const uploadRes = await apiService.uploadPhoto(base64String, selectedFile.name);
        const uploadedUrl = uploadRes.fileUrl || uploadRes.photoUrl;

        if (uploadRes.success && uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
          // Associate the photo immediately with sheet API
          await apiService.updateMemberPhoto(selectedMember.id, uploadedUrl);
        } else {
          throw new Error(uploadRes.message || 'Photo upload failed.');
        }
      }

      // 2. Update Member details (names, birthDate, and new photoUrl if updated)
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

      // Refresh list to update cache
      await loadMembers();
      
      // Reset selected states
      setSelectedMember(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setBase64String(null);
      setSearchQuery('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while saving your profile changes.', { id: saveToast });
    } finally {
      setSaving(false);
    }
  };

  // Filter members list based on query
  const filteredMembers = members.filter((m) => {
    const fullName = `${m.firstName} ${m.middleName || ''} ${m.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || String(m.id).includes(searchQuery);
  });

  // Render password portal
  if (!isAuthenticated) {
    return (
      <div id="quick-update-auth-screen" className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 px-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto w-14 h-14 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight">
              Quick Update Portal
            </h2>
            <p className="text-xs text-gray-400 dark:text-zinc-550 max-w-xs mx-auto leading-relaxed">
              Enter the family access password to unlock and edit your personal details, birthdate, or photo.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 dark:text-zinc-550" />
              <input
                ref={passwordRef}
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl transition-all duration-300 shadow-md"
            >
              Verify Credentials
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render quick update form
  return (
    <div id="quick-update-portal" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Family Quick Update Portal
          </h1>
          <p className="text-xs text-gray-400 dark:text-zinc-550 uppercase tracking-widest font-bold">
            EDIT YOUR PROFILE DETAILS DIRECTLY IN THE GENEALOGY DB
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Member Selector search */}
          <div className="md:col-span-5 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider">
                1. Find Your Profile
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-zinc-550 leading-relaxed">
                Type your name below to select your listing from the database records.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or ID..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 dark:text-white"
              />
            </div>

            {loadingMembers ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-xs text-gray-400 dark:text-zinc-500 font-bold">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                <span>Loading family registry...</span>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m) => {
                    const isSelected = selectedMember?.id === m.id;
                    const mFullName = `${m.firstName} ${m.lastName || ''}`.trim();
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleMemberSelect(m)}
                        className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-all text-left ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-extrabold shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 text-gray-800 dark:text-zinc-350 hover:bg-gray-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-850 flex-shrink-0 flex items-center justify-center border dark:border-zinc-700">
                          {m.photoUrl ? (
                            <img
                              src={getDirectPhotoUrl(m.photoUrl)}
                              alt={mFullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate leading-tight">
                            {mFullName}
                          </p>
                          {m.birthDate && (
                            <p className="text-[9px] text-gray-400 dark:text-zinc-500 truncate leading-none mt-1">
                              b. {m.birthDate}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400 dark:text-zinc-550 font-semibold space-y-1">
                    <AlertCircle className="w-5 h-5 mx-auto text-gray-300 dark:text-zinc-700" />
                    <p>No family member matches your search query.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel: Edit Form */}
          <div 
            id="edit-form-panel"
            className="md:col-span-7 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-6"
          >
            {!selectedMember ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 dark:text-zinc-500 space-y-3">
                <User className="w-12 h-12 stroke-[1.5] text-amber-600/30" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-gray-800 dark:text-zinc-300 uppercase tracking-wider">
                    2. Edit Form Locked
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-550 max-w-[250px] mx-auto leading-relaxed">
                    Please select a member from the left panel to edit their name, date of birth, or photo details.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-amber-650 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected Member Profile
                    </span>
                    <h3 className="text-sm font-black text-gray-950 dark:text-white leading-snug">
                      Editing: {selectedMember.firstName} {selectedMember.lastName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="p-1 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-gray-200 dark:border-zinc-750 text-gray-400 dark:text-zinc-400 rounded-lg transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Edit Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-zinc-400 uppercase tracking-wider block">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Tonu"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-zinc-400 uppercase tracking-wider block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Athokpam"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-700 dark:text-zinc-400 uppercase tracking-wider block">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo Upload Box */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-700 dark:text-zinc-400 uppercase tracking-wider block">
                    Upload Profile Picture
                  </label>
                  
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]); }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      dragOver
                        ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
                        : previewUrl
                        ? 'border-gray-200 dark:border-zinc-700 bg-gray-50/20'
                        : 'border-gray-200 dark:border-zinc-750 hover:border-amber-500/40 hover:bg-gray-50/40'
                    }`}
                  >
                    {previewUrl ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-24 h-24 rounded-full border-2 border-white dark:border-zinc-850 shadow-md overflow-hidden group">
                          <img src={previewUrl} alt="Upload Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setSelectedFile(null); setPreviewUrl(null); setBase64String(null); }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity rounded-full"
                          >
                            Remove
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-gray-550 dark:text-zinc-400 block truncate max-w-[200px]">
                          {selectedFile?.name}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedMember.photoUrl ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 dark:bg-zinc-800 border mx-auto shadow-inner flex items-center justify-center">
                            <img
                              src={getDirectPhotoUrl(selectedMember.photoUrl)}
                              alt="Current profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="p-2.5 bg-amber-50 dark:bg-zinc-800 rounded-full text-amber-600 dark:text-amber-500 inline-block shadow-inner">
                            <Camera className="w-6 h-6" />
                          </div>
                        )}
                        <div className="text-xs font-semibold text-gray-650 dark:text-zinc-300">
                          Drag profile photo here, or{' '}
                          <label className="text-amber-600 dark:text-amber-500 hover:underline cursor-pointer">
                            browse
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileInput}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <span className="text-[9px] text-gray-400 dark:text-zinc-550 block">
                          Supports PNG, JPG, JPEG up to 3MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-amber-650 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Profile Details...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save My Updates
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default QuickUpdate;

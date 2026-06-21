import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import useMembers from '../hooks/useMembers';
import { Member } from '../types';
import { getDirectPhotoUrl } from '../utils';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Loader2,
  Check,
  UserPlus,
  AlertTriangle,
  User,
  GitPullRequest
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminMembers: React.FC = () => {
  const { members, loading, error, refresh } = useMembers();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter local state
  const [query, setQuery] = useState('');

  // Modal display states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null); // For edit
  const [deleteCandidate, setDeleteCandidate] = useState<Member | null>(null);

  // Form Fields
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
  const [photoUrl, setPhotoUrl] = useState('');

  // Saving processing state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check URL query parameters for direct triggers e.g., ?edit=ID
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && members.length > 0) {
      const match = members.find((m) => m.id === editId);
      if (match) {
        handleOpenForm(match);
      }
      // Clear URL parameter so it doesn't repeatedly trigger
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.delete('edit');
      setSearchParams(updatedParams);
    }
  }, [searchParams, members]);

  // Clean form states
  const resetForm = () => {
    setSelectedMember(null);
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setGender('M');
    setFatherId('');
    setMotherId('');
    setSpouseId('');
    setBirthDate('');
    setDeathDate('');
    setOccupation('');
    setEducation('');
    setAddress('');
    setBio('');
    setPhotoUrl('');
  };

  // Open Add mode
  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open Edit Mode with pre-populated values
  const handleOpenForm = (member: Member) => {
    setSelectedMember(member);
    setFirstName(member.firstName || '');
    setMiddleName(member.middleName || '');
    setLastName(member.lastName || '');
    setGender(member.gender || 'M');
    setFatherId(member.fatherId || '');
    setMotherId(member.motherId || '');
    setSpouseId(member.spouseId || '');
    
    // Format dates to YYYY-MM-DD for standard html inputs, preventing timezone offset day shifts
    const formatDateInput = (dateStr?: string) => {
      if (!dateStr) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (err) {
        return '';
      }
    };

    setBirthDate(formatDateInput(member.birthDate));
    setDeathDate(formatDateInput(member.deathDate));
    setOccupation(member.occupation || '');
    setEducation(member.education || '');
    setAddress(member.address || '');
    setBio(member.bio || '');
    setPhotoUrl(member.photoUrl || '');
    setIsModalOpen(true);
  };

  // Handle Form Submit (Add or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and Last name are strictly required.');
      return;
    }

    setSaving(true);
    const apiToast = toast.loading(selectedMember ? 'Registering details update...' : 'Publishing new family card entry...');

    try {
      const dataPayload: Partial<Member> = {
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
        photoUrl: photoUrl.trim() || undefined,
      };

      let savedMemberId = '';
      if (selectedMember) {
        // Update member
        const response = await apiService.updateMember(selectedMember.id, dataPayload);
        if (response.success) {
          savedMemberId = selectedMember.id;
        } else {
          throw new Error(response.message || 'Operation failed on remote spreadsheet server.');
        }
      } else {
        // Add member
        const response = await apiService.addMember(dataPayload);
        if (response.success && response.id) {
          savedMemberId = String(response.id);
        } else {
          throw new Error(response.message || 'Operation failed on remote spreadsheet server.');
        }
      }

      // Automatically link spouse reciprocally on both sides
      const oldSpouseId = selectedMember ? (selectedMember.spouseId || '') : '';
      const newSpouseId = spouseId || '';

      if (newSpouseId !== oldSpouseId) {
        // 1. Detach old spouse (if they are pointing back to us)
        if (oldSpouseId) {
          const oldSpouseObj = members.find(m => String(m.id) === String(oldSpouseId));
          if (oldSpouseObj && String(oldSpouseObj.spouseId) === String(savedMemberId)) {
            await apiService.updateMember(oldSpouseId, { spouseId: null });
          }
        }

        // 2. Attach new spouse to us reciprocally
        if (newSpouseId) {
          const newSpouseObj = members.find(m => String(m.id) === String(newSpouseId));
          if (newSpouseObj) {
            // Unlink their existing spouse if any
            const andTheirSpouseId = newSpouseObj.spouseId;
            if (andTheirSpouseId && String(andTheirSpouseId) !== String(savedMemberId)) {
              const andTheirSpouseObj = members.find(m => String(m.id) === String(andTheirSpouseId));
              if (andTheirSpouseObj && String(andTheirSpouseObj.spouseId) === String(newSpouseId)) {
                await apiService.updateMember(String(andTheirSpouseId), { spouseId: null });
              }
            }
            // Bind newly selected spouse to this member
            await apiService.updateMember(newSpouseId, { spouseId: savedMemberId });
          }
        }
      } else if (newSpouseId) {
        // Even if oldSpouseId === newSpouseId, verify if the spouse member has us linked.
        // This handles cases where they were linked on one side but not on the other.
        const newSpouseObj = members.find(m => String(m.id) === String(newSpouseId));
        if (newSpouseObj && String(newSpouseObj.spouseId) !== String(savedMemberId)) {
          await apiService.updateMember(newSpouseId, { spouseId: savedMemberId });
        }
      }

      toast.success(selectedMember ? 'Genealogy profile updated successfully!' : 'Successfully added to family registry tree!', { id: apiToast });
      setIsModalOpen(false);
      resetForm();
      refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred processing the registry request.', { id: apiToast });
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Member Action
  const handleDeleteMember = async () => {
    if (!deleteCandidate) return;

    setDeleting(true);
    const deleteToast = toast.loading('Deleting lineage profile from server records...');

    try {
      const response = await apiService.deleteMember(deleteCandidate.id);
      if (response && response.success) {
        toast.success(`Removed #${deleteCandidate.id} ${deleteCandidate.firstName} from records`, { id: deleteToast });
        setDeleteCandidate(null);
        refresh();
      } else {
        throw new Error(response?.message || 'Server rejected the deletion action.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred during sheet profile purging.', { id: deleteToast });
    } finally {
      setDeleting(false);
    }
  };

  // Filter lists inside table
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (query.trim() === '') return members;
    const q = query.toLowerCase();
    return members.filter((m) => {
      const full = `${m.firstName} ${m.lastName}`.toLowerCase();
      const addr = m.address?.toLowerCase() || '';
      const occupation = m.occupation?.toLowerCase() || '';
      const id = m.id?.toString() || '';
      return full.includes(q) || addr.includes(q) || occupation.includes(q) || id.includes(q);
    });
  }, [members, query]);

  // Candidates for parents/spouse (excluding the currently edited member themselves to prevent self-referencing cycles)
  const candidateRelations = useMemo(() => {
    if (!members) return [];
    if (!selectedMember) return members;
    return members.filter((m) => m.id !== selectedMember.id);
  }, [members, selectedMember]);

  return (
    <div id="admin-members-page" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 transition-colors duration-300 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Ribbon bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-amber-600" />
              Manage Genealogy Records
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider font-extrabold">
              Add new descendants, adjust marriages, link mothers, fathers, and purge orphaned data
            </p>
          </div>

          <button
            id="btn-admin-add-member"
            onClick={handleOpenAdd}
            className="px-4.5 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-transform self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            Add Family Member
          </button>
        </div>

        {/* Search controls inside Admin */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <Search className="w-4.5 h-4.5 text-gray-400 dark:text-zinc-500 flex-shrink-0" />
          <input
            id="admin-members-table-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter database list by name, occupation, address or ID..."
            className="w-full bg-transparent border-none text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 font-semibold"
          />
        </div>

        {/* Members Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2.5">
            <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
            <span className="text-xs font-bold text-gray-500">Retrieving sheet schema rows...</span>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-55 border border-red-200 text-red-700 text-center text-xs font-semibold rounded-2xl">
            {error}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 p-12 rounded-3xl text-center text-gray-400">
            No family records matching query terms.
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[750px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-950 text-gray-400 dark:text-zinc-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100 dark:border-zinc-855">
                    <th className="py-4 px-4 w-12">ID</th>
                    <th className="py-4 px-4">Portrait</th>
                    <th className="py-4 px-4">FullName</th>
                    <th className="py-4 px-4">Gender</th>
                    <th className="py-4 px-4">Occupation</th>
                    <th className="py-4 px-4">Address Area</th>
                    <th className="py-4 px-4 text-center">Settings Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-850 font-medium text-gray-700 dark:text-zinc-300">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} id={`row-admin-member-${m.id}`} className="hover:bg-gray-50/50 dark:hover:bg-zinc-850/20 transition-all">
                      <td className="py-3 px-4 text-mono font-bold text-gray-450 dark:text-zinc-550">#{m.id}</td>
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                          {m.photoUrl ? (
                            <img src={getDirectPhotoUrl(m.photoUrl)} alt={m.firstName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-950 dark:text-zinc-100">
                        {m.firstName} {m.middleName ? `${m.middleName} ` : ''}{m.lastName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black ${
                          m.gender === 'F' ? 'bg-pink-50 text-pink-600 dark:bg-pink-955/20 dark:text-pink-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400'
                        }`}>
                          {m.gender === 'F' ? 'Female' : 'Male'}
                        </span>
                      </td>
                      <td className="py-3 px-4 truncate max-w-[150px]">{m.occupation || 'Not Recorded'}</td>
                      <td className="py-3 px-4 truncate max-w-[150px]">{m.address || 'Not Recorded'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            id={`btn-edit-${m.id}`}
                            onClick={() => handleOpenForm(m)}
                            className="p-1.5 hover:bg-gray-150 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 rounded-lg"
                            title="Edit Record details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-${m.id}`}
                            onClick={() => setDeleteCandidate(m)}
                            className="p-1.5 hover:bg-gray-150 dark:hover:bg-zinc-800 text-red-600 dark:text-red-400 rounded-lg"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 1. Modal Form: Add or Edit Member */}
        {isModalOpen && (
          <div id="member-modal-overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div id="member-modal" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col scale-100 animate-zoom-in">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-805 bg-gray-50/50 dark:bg-zinc-950">
                <h2 className="text-sm font-black text-gray-990 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <GitPullRequest className="w-4.5 h-4.5 text-amber-600" />
                  {selectedMember ? `Edit Lineage: ${selectedMember.firstName} #${selectedMember.id}` : 'Create New Portrait Record'}
                </h2>
                <button
                  id="btn-close-member-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-gray-700 dark:text-zinc-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">First Name *</label>
                    <input
                      id="form-input-firstname"
                      required
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  {/* Middle Name */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Middle Name</label>
                    <input
                      id="form-input-middlename"
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="e.g. Bahadur"
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Last Name *</label>
                    <input
                      id="form-input-lastname"
                      required
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Athokpam"
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  {/* Gender dropdown */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Gender *</label>
                    <select
                      id="form-select-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>

                  <div className="h-px sm:col-span-2 bg-gray-100 dark:bg-zinc-800 my-1" />

                  {/* Parents Section mapping selection */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Father Record</label>
                    <select
                      id="form-select-father"
                      value={fatherId}
                      onChange={(e) => setFatherId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    >
                      <option value="">-- No Father linked --</option>
                      {candidateRelations
                        .filter((m) => m.gender === 'M')
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName} (#{m.id})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Mother Record</label>
                    <select
                      id="form-select-mother"
                      value={motherId}
                      onChange={(e) => setMotherId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    >
                      <option value="">-- No Mother linked --</option>
                      {candidateRelations
                        .filter((m) => m.gender === 'F')
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName} (#{m.id})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Spouse Record</label>
                    <select
                      id="form-select-spouse"
                      value={spouseId}
                      onChange={(e) => setSpouseId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    >
                      <option value="">-- No Spouse linked --</option>
                      {candidateRelations
                        .filter((m) => {
                          if (gender === 'M') return m.gender === 'F';
                          if (gender === 'F') return m.gender === 'M';
                          return true;
                        })
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName} (#{m.id})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Photo URL (Manual input fallback, otherwise they use the upload photo portal) */}
                  <div className="space-y-1 col-span-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Direct Photo URL</label>
                    <input
                      id="form-input-photourl"
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Or update via Photo Studio"
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  <div className="h-px sm:col-span-2 bg-gray-100 dark:bg-zinc-800 my-1" />

                  {/* Birth Date */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Birth Date</label>
                    <input
                      id="form-input-birthdate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  {/* Death Date */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Death passed Date (Leave empty if alive)</label>
                    <input
                      id="form-input-deathdate"
                      type="date"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Occupation</label>
                    <input
                      id="form-input-occupation"
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. Civil Engineer"
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  {/* Education */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Education Level</label>
                    <input
                      id="form-input-education"
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. B.Tech in Biotechnology"
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Home Address / Location</label>
                    <input
                      id="form-input-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Imphal, Manipur, India"
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  {/* Biography notes */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-extrabold text-[#474542] dark:text-zinc-400 uppercase tracking-wider">Biography & Historical Notes</label>
                    <textarea
                      id="form-input-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Include achievements, outstanding life history logs..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-sans"
                    />
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-805 flex justify-end gap-3.5">
                  <button
                    id="btn-cancel-modal"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-105 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-750 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-modal"
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving to Spreadsheet...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {selectedMember ? 'Update Profile' : 'Publish Member'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Confirmation Dialog: Delete Member */}
        {deleteCandidate && (
          <div id="delete-modal-overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div id="delete-modal" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-center text-xs text-gray-700 dark:text-zinc-300">
              <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-black text-gray-950 dark:text-white text-sm uppercase">Delete Lineage Member?</h3>
                <p className="text-gray-400">
                  This action is irreversible. You are deleting <strong>{deleteCandidate.firstName} {deleteCandidate.lastName} (ID: #{deleteCandidate.id})</strong>.
                </p>
                <p className="text-red-500 font-bold mt-1">
                  Note: Any members that refer to this ID as motherId or fatherId will have their parental links broken.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3.5 pt-3">
                <button
                  id="btn-cancel-delete"
                  disabled={deleting}
                  onClick={() => setDeleteCandidate(null)}
                  className="px-4 py-2 bg-gray-105 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-750 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete"
                  disabled={deleting}
                  onClick={handleDeleteMember}
                  className="px-4 py-2 bg-red-65 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete permanently'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminMembers;

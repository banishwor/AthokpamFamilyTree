import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Member, Ancestor } from '../types';
import { getDirectPhotoUrl } from '../utils';
import {
  Calendar,
  Briefcase,
  MapPin,
  GraduationCap,
  ChevronLeft,
  Loader2,
  Heart,
  Baby,
  Sparkles,
  Info,
  Users,
  GitMerge,
  ArrowRight,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';

export const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [parents, setParents] = useState<Member[]>([]);
  const [children, setChildren] = useState<Member[]>([]);
  const [spouse, setSpouse] = useState<Member | null>(null);
  const [siblings, setSiblings] = useState<Member[]>([]);
  const [ancestors, setAncestors] = useState<Ancestor[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [ancestorsLoading, setAncestorsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadProfileData = async () => {
      setLoading(true);
      setAncestorsLoading(true);
      setError(null);
      try {
        // Fetch all details in parallel for maximum performance
        const [memberData, parentsData, childrenData, allMembers, ancestorsRes] = await Promise.all([
          apiService.getMember(id),
          apiService.getParents(id).catch(() => []),
          apiService.getChildren(id).catch(() => []),
          apiService.getMembers().catch(() => []),
          apiService.getAncestors(id).catch(() => ({ success: false, data: [] }))
        ]);

        if (memberData && memberData.id) {
          setMember(memberData);
        } else {
          throw new Error('Family member records do not exist.');
        }

        // Establish core lists
        let finalParentsList = Array.isArray(parentsData) ? [...parentsData] : [];
        let finalChildrenList = Array.isArray(childrenData) ? [...childrenData] : [];

        // Dual-Mechanism: Fall back to client-side matches if discrete lists are empty
        if (finalParentsList.length === 0 && Array.isArray(allMembers) && allMembers.length > 0) {
          const fatherIdStr = memberData.fatherId ? String(memberData.fatherId).trim() : null;
          const motherIdStr = memberData.motherId ? String(memberData.motherId).trim() : null;
          
          if (fatherIdStr || motherIdStr) {
            finalParentsList = allMembers.filter((m: Member) => {
              const mIdStr = String(m.id).trim();
              return (fatherIdStr && mIdStr === fatherIdStr) || (motherIdStr && mIdStr === motherIdStr);
            });
          }
        }

        if (finalChildrenList.length === 0 && Array.isArray(allMembers) && allMembers.length > 0) {
          const memberIdStr = String(memberData.id).trim();
          finalChildrenList = allMembers.filter((m: Member) => {
            const mFatherId = m.fatherId ? String(m.fatherId).trim() : null;
            const mMotherId = m.motherId ? String(m.motherId).trim() : null;
            return (mFatherId && mFatherId === memberIdStr) || (mMotherId && mMotherId === memberIdStr);
          });
        }

        setParents(finalParentsList);
        setChildren(finalChildrenList);

        // Fetch spouse info
        let foundSpouse = null;
        if (Array.isArray(allMembers)) {
          const sId = memberData.spouseId ? String(memberData.spouseId).trim() : null;
          const mId = String(memberData.id).trim();
          foundSpouse = allMembers.find((m: Member) => {
            const curId = String(m.id).trim();
            const curSpouseId = m.spouseId ? String(m.spouseId).trim() : null;
            return (sId && curId === sId) || (curSpouseId && curSpouseId === mId);
          }) || null;
        }
        setSpouse(foundSpouse);

        // Fetch siblings info
        let foundSiblings: Member[] = [];
        if (Array.isArray(allMembers)) {
          const mId = String(memberData.id).trim();
          const fId = memberData.fatherId ? String(memberData.fatherId).trim() : null;
          const mIdStr = memberData.motherId ? String(memberData.motherId).trim() : null;
          if (fId || mIdStr) {
            foundSiblings = allMembers.filter((m: Member) => {
              if (String(m.id).trim() === mId) return false;
              const curFatherId = m.fatherId ? String(m.fatherId).trim() : null;
              const curMotherId = m.motherId ? String(m.motherId).trim() : null;
              return (fId && curFatherId === fId) || (mIdStr && curMotherId === mIdStr);
            });
          }
        }
        setSiblings(foundSiblings);

        // Parse list of direct ancestors
        let ancList = ancestorsRes && Array.isArray(ancestorsRes.data) ? ancestorsRes.data : [];
        if (ancList.length === 0 && ancestorsRes && Array.isArray(ancestorsRes)) {
          ancList = ancestorsRes;
        }

        const mergedAncestors = ancList.map((anc: any) => {
          const match = (allMembers || []).find((m: Member) => String(m.id).trim() === String(anc.id).trim());
          return {
            id: anc.id,
            name: anc.name || (match ? `${match.firstName} ${match.lastName}` : 'Direct Ancestor'),
            level: anc.level || 1,
            relationship: anc.relationship || 'Ancestor',
            photoUrl: anc.photoUrl || match?.photoUrl || '',
            gender: match?.gender || 'M',
            firstName: match?.firstName || anc.name?.split(' ')[0] || '',
            lastName: match?.lastName || anc.name?.split(' ').slice(1).join(' ') || ''
          };
        });

        // Ensure sorted by generation level ascending so Father is first, Grandfather is second
        mergedAncestors.sort((a: any, b: any) => a.level - b.level);

        setAncestors(mergedAncestors);
      } catch (err: any) {
        console.error('Error fetching member profile:', err);
        setError(err.message || 'Failed to retrieve profile record data.');
      } finally {
        setLoading(false);
        setAncestorsLoading(false);
      }
    };

    loadProfileData();
  }, [id]);

  const getInitials = (item: { firstName?: string; lastName?: string } | null) => {
    if (!item) return 'M';
    const first = item.firstName?.charAt(0) || '';
    const last = item.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'M';
  };

  const getAge = () => {
    if (!member || !member.birthDate) return null;
    const birth = new Date(member.birthDate);
    const end = member.deathDate ? new Date(member.deathDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return 'Not Recorded';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div id="profile-loader-screen" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="text-xs font-bold text-gray-500">Loading historical profile logs...</span>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div id="profile-error-screen" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-6 py-20 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-red-100 dark:border-white/5 p-8 rounded-3xl shadow-md space-y-4">
          <span className="p-3 bg-red-100 dark:bg-red-950/20 text-red-600 rounded-full font-bold text-lg inline-block animate-pulse">
            ⚠
          </span>
          <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Profile unavailable</h3>
          <p className="text-xs text-gray-400">{error || 'Requested family profile has been moved or corrupted.'}</p>
          <button
            id="btn-error-redirect-directory"
            onClick={() => navigate('/members')}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer hover:bg-amber-700"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const ageValue = getAge();

  return (
    <div id="member-profile-view" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Back Bar */}
        <div className="flex items-center justify-between">
          <button
            id="btn-profile-go-back"
            onClick={() => navigate('/members')}
            className="px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Directory
          </button>
        </div>

        {/* PROFILE LAYOUT - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Profile Info & Family Card Structure (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SECTION 1: PROFILE HEADER */}
            <div id="profile-hero-card" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row items-stretch">
              
              {/* Photo Area */}
              <div className="relative md:w-1/3 bg-amber-50/20 dark:bg-zinc-805 aspect-square md:aspect-auto flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5">
                {member.photoUrl ? (
                  <img
                    id="profile-large-image"
                    src={getDirectPhotoUrl(member.photoUrl)}
                    alt={`${member.firstName} ${member.lastName}`}
                    referrerPolicy="no-referrer"
                    className="w-48 h-48 md:w-full md:h-full max-h-72 object-cover rounded-2xl shadow-sm hover:scale-101 transition-transform duration-300"
                  />
                ) : (
                  <div
                    id="profile-large-avatar-fallback"
                    className={`w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center text-4xl font-extrabold text-white shadow-md ${
                      member.gender === 'F'
                        ? 'bg-gradient-to-tr from-rose-500 to-pink-400'
                        : 'bg-gradient-to-tr from-amber-600 to-orange-400'
                    }`}
                  >
                    {getInitials(member)}
                  </div>
                )}

                {/* Gender Indicator Badge */}
                <span
                  id="profile-gender-badge"
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    member.gender === 'F'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}
                >
                  {member.gender === 'F' ? 'Female' : 'Male'}
                </span>
              </div>

              {/* Identity & Main Stats area */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-500/10 rounded-full text-amber-800 dark:text-amber-400 text-[10px] uppercase font-mono tracking-widest mb-3 font-bold select-none">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Clan Member ID: #{member.id}</span>
                  </div>
                  <h2 id="profile-full-name" className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    {member.firstName} {member.middleName ? `${member.middleName} ` : ''}{member.lastName}
                  </h2>
                  {member.birthDate && (
                    <div className="text-gray-400 dark:text-zinc-500 text-xs font-mono mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Timeline: {new Date(member.birthDate).getFullYear()} – {member.deathDate ? new Date(member.deathDate).getFullYear() : 'Present'}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-zinc-400 italic">
                  "Keep alive the records of generations passed, that the future descendants may recognize their roots with honor."
                </p>
              </div>
            </div>

            {/* SECTION 2: BASIC INFORMATION */}
            <div id="profile-basic-info-card" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-white/5 pb-3">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Birth Date */}
                {member.birthDate && (
                  <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-zinc-805/30 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Birth Date</span>
                      <span className="font-semibold text-gray-800 dark:text-zinc-200">{formattedDate(member.birthDate)}</span>
                    </div>
                  </div>
                )}

                {/* Age & Record Status */}
                {member.birthDate && (
                  <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-zinc-805/30 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <Calendar className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider block font-sans">
                        {member.deathDate ? 'Passed Date (Age)' : 'Current Age'}
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-zinc-200">
                        {member.deathDate ? (
                          <>{formattedDate(member.deathDate)} ({ageValue} yrs)</>
                        ) : (
                          <>{ageValue !== null ? `${ageValue} years old` : 'Not Computed'}</>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Occupation */}
                {member.occupation && (
                  <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-zinc-805/30 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <Briefcase className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Occupation</span>
                      <span className="font-semibold text-gray-800 dark:text-zinc-200">{member.occupation}</span>
                    </div>
                  </div>
                )}

                {/* Education */}
                {member.education && (
                  <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-zinc-805/30 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Education</span>
                      <span className="font-semibold text-gray-800 dark:text-zinc-200">{member.education}</span>
                    </div>
                  </div>
                )}

                {/* Address */}
                {member.address && (
                  <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-zinc-805/30 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 animate-bounce" />
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Address Area</span>
                      <span className="font-semibold text-gray-800 dark:text-zinc-200">{member.address}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: SPOUSE */}
            <div id="profile-spouse-card" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Spouse
              </h3>
              {!spouse ? (
                <div className="py-6 text-center text-xs text-gray-400 dark:text-zinc-500 bg-gray-50/35 dark:bg-zinc-950/20 rounded-2xl mt-4 border border-dashed border-gray-200 dark:border-zinc-800">
                  <Info className="w-4 h-4 mx-auto mb-1 text-gray-300 dark:text-zinc-650" />
                  No direct spouse registered or linked.
                </div>
              ) : (
                <div className="mt-4">
                  <Link
                    id={`profile-spouse-link-${spouse.id}`}
                    to={`/member/${spouse.id}`}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-805/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/10 hover:border-amber-500/20 transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-zinc-805 flex items-center justify-center border border-gray-200 dark:border-zinc-800 flex-shrink-0">
                      {spouse.photoUrl ? (
                        <img src={getDirectPhotoUrl(spouse.photoUrl)} alt={spouse.firstName} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center font-bold text-sm text-white ${spouse.gender === 'F' ? 'bg-rose-400' : 'bg-amber-600'}`}>
                          {getInitials(spouse)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black text-gray-950 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 block truncate">
                        {spouse.firstName} {spouse.lastName}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block">
                        {spouse.gender === 'F' ? 'Wife' : 'Husband'}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>

            {/* SECTIONS 4 & 5: PARENTS & CHILDREN (Immediates Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Parents Lineage Card */}
              <div id="profile-parents-section" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 p-6 rounded-3xl shadow-sm">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
                  <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center"><Heart className="w-2.5 h-2.5 text-rose-600" /></span>
                  Parents
                </h3>

                {parents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500 bg-gray-50/50 dark:bg-zinc-950/20 rounded-2xl mt-4 border border-dashed border-gray-200 dark:border-zinc-800">
                    <Info className="w-4 h-4 mx-auto mb-1 text-gray-300 dark:text-zinc-650" />
                    No parent links stored in the cloud.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {parents.map((p) => (
                      <Link
                        key={p.id}
                        id={`profile-parent-link-${p.id}`}
                        to={`/member/${p.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-805/30 hover:bg-amber-50/50 dark:hover:bg-amber-950/10 hover:border-amber-500/20 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-white dark:bg-zinc-805 flex items-center justify-center border border-gray-200 dark:border-zinc-800">
                          {p.photoUrl ? (
                            <img src={getDirectPhotoUrl(p.photoUrl)} alt={p.firstName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold text-white ${p.gender === 'F' ? 'bg-pink-400' : 'bg-amber-600'}`}>
                              {getInitials(p)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-gray-900 dark:text-zinc-105 group-hover:text-amber-700 block truncate">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                            {p.gender === 'F' ? 'Mother' : 'Father'}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Children Lineage Card */}
              <div id="profile-children-section" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 p-6 rounded-3xl shadow-sm">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center"><Baby className="w-2.5 h-2.5 text-emerald-600" /></span>
                  Children / Descendants
                </h3>

                {children.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500 bg-gray-50/50 dark:bg-zinc-950/20 rounded-2xl mt-4 border border-dashed border-gray-200 dark:border-zinc-800">
                    <Info className="w-4 h-4 mx-auto mb-1 text-gray-300 dark:text-zinc-650" />
                    No direct descendant children registered.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {children.map((c) => (
                      <Link
                        key={c.id}
                        id={`profile-child-link-${c.id}`}
                        to={`/member/${c.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-805/30 hover:bg-amber-50/50 dark:hover:bg-amber-950/10 hover:border-amber-500/20 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-white dark:bg-zinc-805 flex items-center justify-center border border-gray-200 dark:border-zinc-800">
                          {c.photoUrl ? (
                            <img src={getDirectPhotoUrl(c.photoUrl)} alt={c.firstName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold text-white ${c.gender === 'F' ? 'bg-pink-400' : 'bg-amber-600'}`}>
                              {getInitials(c)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-gray-900 dark:text-zinc-105 group-hover:text-amber-700 block truncate">
                            {c.firstName} {c.lastName}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                            {c.gender === 'F' ? 'Daughter' : 'Son'}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 6: TOPO-MEMOIR / BIOGRAPHY */}
            <div id="profile-biography-block" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-white/5 pb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                Heritage Biography
              </h3>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-4 leading-relaxed font-sans whitespace-pre-line">
                {member.bio || `No customized biographical notes are currently archived for ${member.firstName} ${member.lastName}. Administrators can append historical and family notes in the administrative portal.`}
              </p>
            </div>

            {/* SECTION 7: FAMILY CONNECTIONS */}
            <div id="profile-family-connections-block" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  Family Connections
                </h3>
                <Link
                  to={`/relationship-finder?id1=${member.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  Try Relationship Finder
                </Link>
              </div>

              {/* Sibling Calculator Display */}
              <div>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider block mb-3">Siblings / Clan Elders</span>
                {siblings.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 italic bg-gray-50/55 dark:bg-zinc-950/15 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    No directory siblings identified sharing mother or father links. Refer to lineage overview.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {siblings.slice(0, 4).map((sib) => (
                      <Link
                        key={sib.id}
                        to={`/member/${sib.id}`}
                        className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/50 dark:bg-zinc-805/30 border border-gray-100 dark:border-white/5 hover:border-amber-600/20 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-zinc-805 flex items-center justify-center border border-gray-200 dark:border-zinc-800">
                          {sib.photoUrl ? (
                            <img src={getDirectPhotoUrl(sib.photoUrl)} alt={sib.firstName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600">{getInitials(sib)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-gray-900 dark:text-zinc-100 block truncate group-hover:text-amber-600">
                            {sib.firstName} {sib.lastName}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-zinc-500 block">
                            {sib.gender === 'F' ? 'Sister' : 'Brother'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: ANCESTRAL LINEAGE (Col span 1) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
            
            <div id="profile-ancestors-block" className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 p-6 rounded-3xl shadow-sm">
              <div className="border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
                <span className="text-amber-600 text-[10px] font-mono uppercase tracking-widest font-black block mb-1">Direct Lineage</span>
                <h3 className="text-base font-black text-gray-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-amber-600" />
                  Ancestral Lineage
                </h3>
              </div>

              {ancestorsLoading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  <span className="text-[11px] text-gray-400">Loading generational tree...</span>
                </div>
              ) : ancestors.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 dark:text-zinc-500 space-y-2">
                  <Info className="w-6 h-6 mx-auto text-gray-300" />
                  <p>No ancestral lineage records are mapped to this member yet.</p>
                  <p className="text-[10px] text-zinc-500">Add father & mother records inside the administrator dashboard to build a lineage.</p>
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-8">
                  {/* Vertical Timeline Connection Line */}
                  <div className="absolute top-4 bottom-4 left-6 sm:left-[27px] w-0.5 bg-gradient-to-b from-amber-500 via-amber-200 to-amber-50/10 dark:from-amber-600 dark:via-zinc-800 dark:to-zinc-950/20" />

                  {/* Member Self Card Pin at the very bottom or top */}
                  <div className="relative group transition-all duration-300">
                    {/* Active Pulsing Node Selector pin */}
                    <div className="absolute -left-[19px] sm:-left-[21px] top-6 w-3 h-3 bg-amber-600 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm ring-4 ring-amber-500/20 animate-pulse" />
                    
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-white dark:bg-zinc-800 border border-amber-600/30 flex items-center justify-center flex-shrink-0">
                        {member.photoUrl ? (
                          <img src={getDirectPhotoUrl(member.photoUrl)} alt={member.firstName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-black text-amber-700">{getInitials(member)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-amber-900 dark:text-amber-400 truncate">
                          {member.firstName} {member.lastName}
                        </h4>
                        <span className="text-[9px] font-bold text-amber-800/80 dark:text-amber-500/80 uppercase tracking-widest block">
                          Self / Subject
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* List of Ancestors in vertical order (Level 1, Level 2, Level 3) */}
                  {ancestors.map((anc, idx) => {
                    return (
                      <div key={anc.id} id={`ancestor-timeline-node-${anc.id}`} className="relative pl-2 group transition-all duration-300 scale-98 hover:scale-101">
                        
                        {/* Timeline Node Arrow/Dot indicator */}
                        <div className="absolute -left-[23px] sm:-left-[25px] top-6 w-2.5 h-2.5 bg-amber-500 dark:bg-zinc-700 rounded-full border border-white dark:border-zinc-900 group-hover:bg-amber-600 transition-colors" />

                        {/* Visual Connector Down Arrow */}
                        <div className="absolute -left-[27px] sm:-left-[29px] -top-5 text-[10px] text-amber-500 dark:text-zinc-700 font-bold">
                          ↓
                        </div>

                        {/* Ancestor Card */}
                        <Link
                          to={`/member/${anc.id}`}
                          className="flex items-center gap-3 p-3.5 bg-white dark:bg-zinc-850 hover:bg-amber-50/40 dark:hover:bg-amber-950/15 border border-gray-150 dark:border-white/5 rounded-2xl shadow-xs hover:border-amber-500/20 transition-all group/card block"
                        >
                          <div className="w-9.5 h-9.5 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 flex items-center justify-center flex-shrink-0">
                            {anc.photoUrl ? (
                              <img src={getDirectPhotoUrl(anc.photoUrl)} alt={anc.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover/card:scale-102 transition-transform" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold text-white ${anc.gender === 'F' ? 'bg-rose-400' : 'bg-amber-600'}`}>
                                {getInitials({ firstName: anc.firstName, lastName: anc.lastName })}
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-gray-950 dark:text-zinc-100 tracking-tight block truncate group-hover/card:text-amber-600">
                              {anc.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider">
                              <span className="text-amber-800 dark:text-amber-400 block">{anc.relationship}</span>
                              <span className="text-gray-300 dark:text-zinc-700 font-normal">|</span>
                              <span className="text-gray-400 dark:text-zinc-500">Gen {anc.level}</span>
                            </div>
                          </div>

                          <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-700 group-hover/card:text-amber-600 transition-colors" />
                        </Link>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default MemberProfile;

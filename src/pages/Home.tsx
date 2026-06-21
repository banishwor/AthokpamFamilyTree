import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useMembers from '../hooks/useMembers';
import { GitMerge, Users, Shield, Calendar, ArrowRight, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getDirectPhotoUrl } from '../utils';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { members, loading, error } = useMembers();

  // Compute stats dynamically from real member database
  const stats = useMemo(() => {
    if (!members || members.length === 0) {
      return { total: 0, branches: 0, photos: 0 };
    }
    const total = members.length;
    
    // Family branches: can be estimated by number of unique fathers/households or distinct address areas
    const fatherIds = members.map((m) => m.fatherId).filter(Boolean);
    const uniqueFathers = new Set(fatherIds).size;
    const branches = Math.max(3, uniqueFathers);

    // Photos uploaded
    const photos = members.filter((m) => m.photoUrl && m.photoUrl.trim() !== '').length;

    return { total, branches, photos };
  }, [members]);

  // Find Featured Elders (e.g. oldest/first members or members without fatherId/motherId)
  const featuredElders = useMemo(() => {
    if (!members || members.length === 0) return [];
    // Filter members with birth date, sort by year ascending (oldest first)
    return members
      .filter((m) => m.birthDate)
      .sort((a, b) => {
        const dateA = new Date(a.birthDate!).getTime();
        const dateB = new Date(b.birthDate!).getTime();
        return dateA - dateB;
      })
      .slice(0, 3);
  }, [members]);

  // Find Recent Additions (the last 3 members added)
  const recentAdditions = useMemo(() => {
    if (!members || members.length === 0) return [];
    // Sort by id or createdAt descending
    return [...members]
      .sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA;
      })
      .slice(0, 3);
  }, [members]);

  return (
    <div id="home-page-container" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 transition-colors duration-300">
      {/* 1. Hero Section */}
      <section id="hero-section" className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-gray-50/50 dark:from-zinc-900 dark:via-zinc-900/60 dark:to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-full text-amber-800 dark:text-amber-400 text-xs font-extrabold tracking-widest uppercase mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Athokpam Lineage Heritage</span>
          </div>

          <h1 id="hero-title" className="text-5xl sm:text-6xl lg:text-8xl font-light text-gray-900 dark:text-white tracking-tighter leading-[0.95] font-serif-heritage">
            Digital <br className="hidden sm:inline" />
            <span className="text-amber-600 dark:text-amber-500 italic">Lineage</span>
          </h1>

          <p id="hero-subtitle" className="mt-6 text-sm sm:text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Preserving our ancestral root systems, charting our histories, and celebrating our future generations. Navigate through timelines, view complete structures, and manage the lineage records with our historical database.
          </p>

          {/* Quick links & CTA */}
          <div id="hero-cta-buttons" className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              id="hero-btn-tree"
              to="/tree"
              className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-extrabold rounded-full text-sm inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <GitMerge className="w-4.5 h-4.5" />
              Interactive Family Tree
            </Link>
            <Link
              id="hero-btn-members"
              to="/members"
              className="px-6 py-3.5 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-900 dark:text-white font-extrabold rounded-full text-sm border border-gray-200 dark:border-zinc-850 inline-flex items-center gap-2 shadow-sm transition-all duration-300"
            >
              <Users className="w-4.5 h-4.5" />
              Browse Members
            </Link>
            <Link
              id="hero-btn-admin"
              to="/admin"
              className="px-6 py-3.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 font-extrabold rounded-full text-sm inline-flex items-center gap-2 transition-all duration-300"
            >
              <Shield className="w-4.5 h-4.5" />
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Dynamic Statistics section */}
      <section id="statistics-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {loading ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-8 rounded-3xl flex items-center justify-center gap-3 shadow-md">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-bold">Computing lineage statistics...</span>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-zinc-900 border border-red-100 p-6 rounded-3xl flex items-center justify-between text-red-600 text-xs font-bold shadow-md">
            <span>Unable to compute live database statistics.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat 1 */}
            <div id="stat-total-members" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-6 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center gap-5">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-2xl flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {stats.total}
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                  Total Members
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div id="stat-family-branches" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-6 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center gap-5">
              <div className="p-3 bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 rounded-2xl flex-shrink-0">
                <GitMerge className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {stats.branches}
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                  Family Branches
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div id="stat-photos-uploaded" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-6 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center gap-5">
              <div className="p-3 bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 rounded-2xl flex-shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {stats.photos}
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                  Photos Archived
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Featured Elders section */}
      <section id="featured-elders" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Elders of the Lineage
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Honoring our oldest recorded ancestors who laid the foundations of the Athokpam family.
            </p>
          </div>
          <Link
            id="link-all-members-from-elders"
            to="/members"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 group self-start sm:self-center"
          >
            Explore All Generations
            <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 h-56 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredElders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-10 rounded-2xl text-center text-xs text-gray-400">
            No ancestor records containing birth years available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredElders.map((elder) => (
              <div
                key={elder.id}
                id={`featured-elder-card-${elder.id}`}
                onClick={() => navigate(`/member/${elder.id}`)}
                className="group cursor-pointer bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 text-center"
              >
                <div className="relative w-20 h-20 rounded-full mx-auto overflow-hidden bg-amber-50/50 dark:bg-zinc-800/50 border-2 border-amber-200/50 flex items-center justify-center">
                  {elder.photoUrl ? (
                    <img
                      src={getDirectPhotoUrl(elder.photoUrl)}
                      alt={elder.firstName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-400 uppercase select-none">
                      {elder.firstName.charAt(0)}{elder.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-950 dark:text-white mt-4 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-sm">
                  {elder.firstName} {elder.middleName ? `${elder.middleName} ` : ''}{elder.lastName}
                </h3>
                {elder.birthDate && (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-mono">
                    Born: {new Date(elder.birthDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
                {elder.address && (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2 truncate">
                    {elder.address}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Recent Additions section */}
      <section id="recent-additions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
          Recent Portals Added
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 h-36 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentAdditions.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-10 rounded-2xl text-center text-xs text-gray-400">
            No family members currently recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentAdditions.map((member) => {
              const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : 'N/A';
              return (
                <div
                  key={member.id}
                  id={`recent-addition-card-${member.id}`}
                  onClick={() => navigate(`/member/${member.id}`)}
                  className="group cursor-pointer bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-500/10 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden bg-gray-50 dark:bg-zinc-855 disabled flex items-center justify-center">
                    {member.photoUrl ? (
                      <img
                        src={getDirectPhotoUrl(member.photoUrl)}
                        alt={member.firstName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xs text-gray-900 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Occupation: {member.occupation || 'Not Recorded'}
                    </p>
                    <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 block mt-1">
                      Birth Year: {birthYear}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

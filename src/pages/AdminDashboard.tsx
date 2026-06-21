import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useMembers from '../hooks/useMembers';
import {
  Users,
  Image as ImageIcon,
  UserPlus,
  Settings,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { members, loading, error } = useMembers();

  // Compute live admin statistics
  const metrics = useMemo(() => {
    if (!members || members.length === 0) {
      return { total: 0, photos: 0, males: 0, females: 0 };
    }
    const total = members.length;
    const photos = members.filter((m) => m.photoUrl && m.photoUrl.trim() !== '').length;
    const males = members.filter((m) => m.gender === 'M').length;
    const females = members.filter((m) => m.gender === 'F').length;

    return { total, photos, males, females };
  }, [members]);

  // Take the 5 most recently created family records
  const recentMembers = useMemo(() => {
    if (!members || members.length === 0) return [];
    return [...members]
      .sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA;
      })
      .slice(0, 5);
  }, [members]);

  const quickActions = [
    {
      title: 'Manage Members Registry',
      desc: 'Add, edit details, set relationships, or remove lineage records',
      link: '/admin/members',
      icon: <UserPlus className="w-5 h-5" />,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      title: 'Admin Photo Studio',
      desc: 'Upload professional portrait image attachments in high speed base64 encoding',
      link: '/admin/photos',
      icon: <ImageIcon className="w-5 h-5" />,
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
    {
      title: 'System Preferences',
      desc: 'Switch active visual theme configurations (Dark Mode, Light Mode, System)',
      link: '/admin/settings',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    },
  ];

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 transition-all px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header Ribbon section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-850 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest bg-red-100 text-red-700 px-2 py-0.5 rounded-md uppercase">
                Secure Session
              </span>
              <span className="text-gray-400 dark:text-zinc-500 font-mono text-xs">ROOT LEVEL ACCESS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1.5 tracking-tight flex items-center gap-2">
              Athokpam Administrative Core
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider font-extrabold">
              Historical Genealogy Control Dashboard
            </p>
          </div>
        </div>

        {/* 1. Metrics Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 h-24 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 border border-red-100 rounded-3xl text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div id="metric-total-members" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Registered</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white block mt-1 tracking-tight">{metrics.total}</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 2 */}
            <div id="metric-total-photos" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Linked Portraits</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white block mt-1 tracking-tight">{metrics.photos}</span>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-xl">
                <ImageIcon className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 3 */}
            <div id="metric-males-count" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Male Lineage</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white block mt-1 tracking-tight">{metrics.males}</span>
              </div>
              <div className="p-3 bg-teal-50 dark:bg-teal-950/30 text-teal-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 4 */}
            <div id="metric-females-count" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Female Lineage</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white block mt-1 tracking-tight">{metrics.females}</span>
              </div>
              <div className="p-3 bg-pink-50 dark:bg-pink-950/30 text-pink-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* 2. Quick Actions Panel */}
        <section id="quick-actions-panel">
          <h2 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
            Authorized Quick Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((act) => (
              <Link
                key={act.link}
                id={`quick-action-${act.title.toLowerCase().replace(/ /g, '-')}`}
                to={act.link}
                className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850/80 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-amber-500/25 dark:hover:border-amber-400/25 transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className={`p-2.5 w-fit rounded-xl ${act.color} mb-4`}>
                    {act.icon}
                  </div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-zinc-450 mt-1 lines-clamp-2">
                    {act.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider group-hover:underline">
                  <span>Open Tool</span>
                  <ChevronRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Recent Members & Timeline */}
        <div id="recent-members-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main List */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-805 pb-4">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Member Registry Feed
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">LATEST DATABASE SYNC CONTROLS</p>
              </div>

              <Link id="view-all-members-lnk" to="/admin/members" className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 group">
                Registry Panel
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                <span className="text-xs text-gray-500 font-bold">Synchronizing history...</span>
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No lineage records exist yet. Use "Manage Members" to create the first of the Athokpam tree.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px] text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-zinc-805 text-gray-400 uppercase font-bold text-[10px] tracking-wide">
                      <th className="py-3 px-3">Member Name</th>
                      <th className="py-3 px-3">ID</th>
                      <th className="py-3 px-3">Gender</th>
                      <th className="py-3 px-3">Birth Year</th>
                      <th className="py-3 px-3 text-right">Shortcuts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMembers.map((m) => {
                      const birthYear = m.birthDate ? new Date(m.birthDate).getFullYear() : 'N/A';
                      return (
                        <tr key={m.id} id={`recent-table-row-${m.id}`} className="border-b border-gray-50 dark:border-zinc-805/60 hover:bg-gray-50/55 dark:hover:bg-zinc-800/10 font-medium">
                          <td className="py-3.5 px-3 font-semibold text-gray-900 dark:text-zinc-100">
                            {m.firstName} {m.lastName}
                          </td>
                          <td className="py-3.5 px-3 text-mono font-bold text-gray-400 dark:text-zinc-500">#{m.id}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                              m.gender === 'F' ? 'bg-pink-50 text-pink-600 dark:bg-pink-950/20 dark:text-pink-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400'
                            }`}>
                              {m.gender === 'F' ? 'Female' : 'Male'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-gray-500">{birthYear}</td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                id={`shortcut-edit-btn-${m.id}`}
                                onClick={() => navigate(`/admin/members?edit=${m.id}`)}
                                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Edit Profile
                              </button>
                              <span className="text-gray-250 dark:text-zinc-700">|</span>
                              <button
                                id={`shortcut-upload-btn-${m.id}`}
                                onClick={() => navigate(`/admin/photos?memberId=${m.id}`)}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                Photo Studio
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Info Alerts widget */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-zinc-805 pb-4">
              Security Logins Information
            </h3>
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-950/30 rounded-2xl text-red-700 dark:text-red-400 flex items-start gap-2.5 leading-relaxed">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[11px] uppercase tracking-wider">Root Access Active</span>
                  You are viewing the private administrative portal. Be careful when updating mother, father, or spouse identity binders, as they govern the react-d3-tree algorithm structures.
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/10 rounded-2xl text-amber-800 dark:text-amber-400 flex items-start gap-2.5 leading-relaxed">
                <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[11px] uppercase tracking-wider">API Database Sync</span>
                  All modifications are posted in live stream to Google macro spreadsheets. Changes will refresh instantly for browse viewers.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

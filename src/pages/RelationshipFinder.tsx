import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Member } from '../types';
import { getDirectPhotoUrl } from '../utils';
import {
  GitMerge,
  Loader2,
  Users,
  Search,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const RelationshipFinder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected member IDs
  const [member1Id, setMember1Id] = useState<string>('');
  const [member2Id, setMember2Id] = useState<string>('');

  // Dropdown search queries
  const [searchQuery1, setSearchQuery1] = useState<string>('');
  const [searchQuery2, setSearchQuery2] = useState<string>('');

  // Dropdown open states
  const [isOpen1, setIsOpen1] = useState<boolean>(false);
  const [isOpen2, setIsOpen2] = useState<boolean>(false);

  // Result states
  const [calculating, setCalculating] = useState<boolean>(false);
  const [relationshipStr, setRelationshipStr] = useState<string>('');
  const [lineagePath, setLineagePath] = useState<Member[]>([]);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  // Load members on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const list = await apiService.getMembers();
        if (list && Array.isArray(list)) {
          // Sort members alphabetically by first name for easier browsing
          const sortedList = [...list].sort((a, b) => 
            String(a.firstName).localeCompare(String(b.firstName))
          );
          setMembers(sortedList);

          // Read pre-selected query params if navigating from profile
          const paramId1 = searchParams.get('id1');
          const paramId2 = searchParams.get('id2');

          if (paramId1) {
            const found1 = sortedList.find(m => String(m.id).trim() === paramId1.trim());
            if (found1) setMember1Id(String(found1.id));
          }
          if (paramId2) {
            const found2 = sortedList.find(m => String(m.id).trim() === paramId2.trim());
            if (found2) setMember2Id(String(found2.id));
          }
        } else {
          throw new Error('API returned empty member records.');
        }
      } catch (err: any) {
        console.error('Failed to load clan directory:', err);
        setError('Failed to fetch the clan directory. Please reload page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  // Clean initials helper
  const getInitials = (m: Member) => {
    const f = m.firstName?.charAt(0) || '';
    const l = m.lastName?.charAt(0) || '';
    return `${f}${l}`.toUpperCase() || 'M';
  };

  // Find direct relationship trigger
  const handleFindRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member1Id || !member2Id) {
      toast.error('Please select both family members first.');
      return;
    }
    if (member1Id === member2Id) {
      toast.error('Please select two different family members.');
      return;
    }

    setCalculating(true);
    setRelationshipStr('');
    setLineagePath([]);
    setHasCalculated(false);

    try {
      // 1. Query relationship from API
      const res = await apiService.getRelationship(member1Id, member2Id);
      
      let resText = '';
      if (res && res.success) {
        resText = res.relationship || res.text || res.data?.relationship || res.data?.text || '';
      } else if (res && typeof res === 'object') {
        resText = res.relationship || res.text || res.data || '';
      } else if (typeof res === 'string') {
        resText = res;
      }

      if (!resText) {
        const m1 = members.find(m => String(m.id) === member1Id);
        const m2 = members.find(m => String(m.id) === member2Id);
        resText = `${m1?.firstName} and ${m2?.firstName} belong to the same family tree lineage.`;
      }

      setRelationshipStr(resText);

      // 2. Build high-fidelity visual flowchart tracing path (BFS)
      const graphPath = computeBFSPath(member1Id, member2Id, members);
      setLineagePath(graphPath);
      setHasCalculated(true);
      toast.success('Relationship connection mapped successfully!');
    } catch (err: any) {
      console.error('Failed to map relationship:', err);
      toast.error('API relationship calculation offline. Displaying local direct trace.');
      
      // Fallback: render local tracking anyway
      const graphPath = computeBFSPath(member1Id, member2Id, members);
      setLineagePath(graphPath);
      const m1 = members.find(m => String(m.id) === member1Id);
      const m2 = members.find(m => String(m.id) === member2Id);
      setRelationshipStr(`${m1?.firstName} ${m1?.lastName} and ${m2?.firstName} ${m2?.lastName} are connected lineage roots in the database.`);
      setHasCalculated(true);
    } finally {
      setCalculating(false);
    }
  };

  // BFS Path calculation on current members
  const computeBFSPath = (startId: string, endId: string, allMembers: Member[]): Member[] => {
    const adj = new Map<string, string[]>();
    const idMap = new Map<string, Member>();

    allMembers.forEach(m => {
      const cid = String(m.id).trim();
      idMap.set(cid, m);
      if (!adj.has(cid)) adj.set(cid, []);
    });

    allMembers.forEach(m => {
      const cid = String(m.id).trim();
      
      if (m.fatherId) {
        const fid = String(m.fatherId).trim();
        if (idMap.has(fid)) {
          adj.get(cid)?.push(fid);
          adj.get(fid)?.push(cid);
        }
      }
      if (m.motherId) {
        const mid = String(m.motherId).trim();
        if (idMap.has(mid)) {
          adj.get(cid)?.push(mid);
          adj.get(mid)?.push(cid);
        }
      }
      if (m.spouseId) {
        const sid = String(m.spouseId).trim();
        if (idMap.has(sid)) {
          adj.get(cid)?.push(sid);
          adj.get(sid)?.push(cid);
        }
      }
    });

    const queue: string[][] = [[startId]];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const lastId = path[path.length - 1];

      if (lastId === endId) {
        const resolved = path.map(id => idMap.get(id)!).filter(Boolean);
        
        // Sort from oldest (birth date earliest or level of ancestors)
        const sorted = [...resolved];
        if (sorted.length > 1) {
          const first = sorted[0];
          const last = sorted[sorted.length - 1];
          const birthFirst = first.birthDate ? new Date(first.birthDate).getTime() : NaN;
          const birthLast = last.birthDate ? new Date(last.birthDate).getTime() : NaN;
          
          if (!isNaN(birthFirst) && !isNaN(birthLast) && birthLast < birthFirst) {
            sorted.reverse();
          } else if (isNaN(birthFirst) && !isNaN(birthLast)) {
            sorted.reverse();
          }
        }
        return sorted;
      }

      const neighbors = adj.get(lastId) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push([...path, n]);
        }
      }
    }

    // No path found, return just the two endpoints to prevent visual crash
    const startM = idMap.get(startId);
    const endM = idMap.get(endId);
    return [startM, endM].filter(Boolean) as Member[];
  };

  // Filter lists based on search queries
  const filteredList1 = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(searchQuery1.toLowerCase())
  );

  const filteredList2 = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(searchQuery2.toLowerCase())
  );

  // Active user selections
  const m1Selected = members.find(m => String(m.id) === member1Id);
  const m2Selected = members.find(m => String(m.id) === member2Id);

  if (loading) {
    return (
      <div id="relationship-loader-screen" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="text-xs font-bold text-gray-400">Loading relationship matrix directory...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div id="relationship-error-screen" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-6 py-20 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-red-150 p-8 rounded-3xl shadow-md space-y-4">
          <span className="p-3 bg-red-100 dark:bg-red-950/25 text-red-650 rounded-full font-bold text-lg inline-block">
            ⚠
          </span>
          <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Service Offline</h3>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="relationship-finder-page" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 py-10 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page title and introductory section */}
        <div id="relationship-header-block" className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-500/10 rounded-full text-amber-800 dark:text-amber-400 text-xs font-extrabold uppercase font-mono tracking-widest select-none">
            <GitMerge className="w-4 h-4 text-amber-600" />
            <span>Athokpam Lineage Calculators</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white tracking-tight">
            Interactive Relationship Finder
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Select any two individuals from the digital family archives to find their degree of kinship and generate an instant visual descent lineage path.
          </p>
        </div>

        {/* SELECTOR FORM CONTAINER */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
          <form onSubmit={handleFindRelationship} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
              {/* Visual arrow divider in center for desktop */}
              <div className="hidden md:flex absolute left-1/2 top-11 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-50 dark:bg-zinc-805 border border-amber-200/50 dark:border-white/5 items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm z-10">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* CARD 1: MEMBER 1 SELECTOR */}
              <div className="space-y-2 relative">
                <label className="text-xs font-black text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                  First Clan Member
                </label>

                {/* Custom searchable dropdown */}
                <div className="relative">
                  <div
                    onClick={() => {
                      setIsOpen1(!isOpen1);
                      setIsOpen2(false);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-805/40 border border-gray-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/35"
                  >
                    {m1Selected ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-white dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-750">
                          {m1Selected.photoUrl ? (
                            <img src={getDirectPhotoUrl(m1Selected.photoUrl)} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600">{getInitials(m1Selected)}</span>
                          )}
                        </div>
                        <span className="text-gray-900 dark:text-zinc-100 truncate font-bold">
                          {m1Selected.firstName} {m1Selected.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-zinc-500">Choose First Member...</span>
                    )}
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Dropdown panel */}
                  {isOpen1 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search name..."
                          value={searchQuery1}
                          onChange={(e) => setSearchQuery1(e.target.value)}
                          className="w-full bg-transparent border-none text-xs focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-zinc-800/50">
                        {filteredList1.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400 italic">No members found.</div>
                        ) : (
                          filteredList1.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => {
                                setMember1Id(String(m.id));
                                setIsOpen1(false);
                                setSearchQuery1('');
                              }}
                              className="p-3 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 flex items-center gap-3 cursor-pointer text-xs"
                            >
                              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700">
                                {m.photoUrl ? (
                                  <img src={getDirectPhotoUrl(m.photoUrl)} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-700">{getInitials(m)}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-gray-800 dark:text-zinc-200 block truncate">
                                  {m.firstName} {m.lastName}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: MEMBER 2 SELECTOR */}
              <div className="space-y-2 relative">
                <label className="text-xs font-black text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Second Clan Member
                </label>

                {/* Custom searchable dropdown */}
                <div className="relative">
                  <div
                    onClick={() => {
                      setIsOpen2(!isOpen2);
                      setIsOpen1(false);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-805/40 border border-gray-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between cursor-pointer text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/35"
                  >
                    {m2Selected ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-white dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-750">
                          {m2Selected.photoUrl ? (
                            <img src={getDirectPhotoUrl(m2Selected.photoUrl)} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600">{getInitials(m2Selected)}</span>
                          )}
                        </div>
                        <span className="text-gray-900 dark:text-zinc-100 truncate font-bold">
                          {m2Selected.firstName} {m2Selected.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-zinc-500">Choose Second Member...</span>
                    )}
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Dropdown panel */}
                  {isOpen2 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search name..."
                          value={searchQuery2}
                          onChange={(e) => setSearchQuery2(e.target.value)}
                          className="w-full bg-transparent border-none text-xs focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-zinc-800/50">
                        {filteredList2.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400 italic">No members found.</div>
                        ) : (
                          filteredList2.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => {
                                setMember2Id(String(m.id));
                                setIsOpen2(false);
                                setSearchQuery2('');
                              }}
                              className="p-3 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 flex items-center gap-3 cursor-pointer text-xs"
                            >
                              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700">
                                {m.photoUrl ? (
                                  <img src={getDirectPhotoUrl(m.photoUrl)} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-700">{getInitials(m)}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-gray-800 dark:text-zinc-200 block truncate">
                                  {m.firstName} {m.lastName}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-2 text-center">
              <button
                type="submit"
                id="btn-trigger-relationship-find"
                disabled={calculating || !member1Id || !member2Id}
                className="w-full sm:w-auto px-10 py-3.5 bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-600 disabled:bg-gray-200 dark:disabled:bg-zinc-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mx-auto"
              >
                {calculating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Calculating Kinship...
                  </>
                ) : (
                  <>
                    <GitMerge className="w-4.5 h-4.5" />
                    Find Kinship Connection
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ============================================== */}
        {/* OUTCOME AREA: BEAUTIFUL RESULTS CARD */}
        {/* ============================================== */}
        {hasCalculated && (
          <div id="relationship-finder-results" className="space-y-8 animate-fade-in">
            
            {/* Core Outcome Result Card */}
            <div className="bg-amber-500/10 dark:bg-zinc-900 border-2 border-amber-500/25 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-md text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex p-3.5 bg-amber-500/10 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400 rounded-full">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-[10px] text-amber-800 dark:text-amber-500 font-mono tracking-widest uppercase font-black">
                Relationship Certificate Results
              </p>
              <h2 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white leading-relaxed font-sans px-4">
                "{relationshipStr}"
              </h2>
              <div className="h-px bg-amber-500/15 dark:bg-zinc-800/80 max-w-md mx-auto" />
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                Determined via real-time Google sheet directory hierarchy traversal.
              </p>
            </div>

            {/* VISUAL LINEAGE PATHFLOW CHART */}
            {lineagePath && lineagePath.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                
                <div className="text-center border-b border-gray-100 dark:border-white/5 pb-4 max-w-md mx-auto">
                  <span className="text-amber-600 text-[10px] uppercase font-black tracking-widest font-mono">Generation Trace</span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Visual Lineage Pathway Flow
                  </h3>
                </div>

                {/* GRAPH LAYOUT */}
                <div className="relative flex flex-col items-center">
                  
                  {/* Desktop: Centered Vertical line. Mobile: Left aligned line */}
                  <div className="absolute top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-600 via-amber-300 to-amber-500/20 dark:from-amber-600 dark:via-zinc-800 dark:to-zinc-950/20 md:left-1/2 -translate-x-1/2 left-10" />

                  <div className="w-full space-y-8 select-none">
                    {lineagePath.map((memberNode, idx) => {
                      const isEven = idx % 2 === 0;

                      return (
                        <div
                          key={memberNode.id}
                          id={`lineage-node-node-${memberNode.id}`}
                          className="relative flex flex-col md:flex-row items-start md:items-center w-full justify-start md:justify-center transition-all duration-300"
                        >
                          {/* Anchor Connector Dot */}
                          <div className="absolute left-10 md:left-1/2 -translate-x-1/2 top-6 w-3 h-3 bg-amber-600 dark:bg-zinc-700 border-2 border-white dark:border-zinc-950 rounded-full shadow-sm" />

                          {/* Flow Arrow pointing down */}
                          {idx > 0 && (
                            <div className="absolute left-10 md:left-1/2 -translate-x-1/2 -top-6 text-[11px] text-amber-500 dark:text-zinc-600 font-bold">
                              ↓
                            </div>
                          )}

                          {/* Member Node card, offset left or right on desktop, side stacked on mobile */}
                          <div
                            className={`w-full max-w-sm pl-16 md:pl-0 flex ${
                              isEven ? 'md:justify-end md:pr-10' : 'md:justify-start md:pl-10'
                            }`}
                          >
                            <div className="w-full bg-gray-50/50 dark:bg-zinc-950/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 border border-gray-150 dark:border-zinc-800 p-3 rounded-2xl flex items-center gap-3 group transition-all duration-300">
                              
                              {/* Avatar display */}
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center flex-shrink-0 shadow-inner">
                                {memberNode.photoUrl ? (
                                  <img src={getDirectPhotoUrl(memberNode.photoUrl)} className="w-full h-full object-cover" />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center font-extrabold text-xs text-white ${memberNode.gender === 'F' ? 'bg-rose-400' : 'bg-amber-600'}`}>
                                    {getInitials(memberNode)}
                                  </div>
                                )}
                              </div>

                              {/* Details */}
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-black text-gray-900 dark:text-zinc-100 truncate block">
                                  {memberNode.firstName} {memberNode.lastName}
                                </span>
                                {memberNode.birthDate && (
                                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-gray-400">
                                    <span>b. {new Date(memberNode.birthDate).getFullYear()}</span>
                                  </div>
                                )}
                              </div>

                              {/* Route trigger */}
                              <button
                                onClick={() => navigate(`/member/${memberNode.id}`)}
                                className="p-1 px-2.5 bg-white dark:bg-zinc-850 hover:bg-amber-600 hover:text-white border border-gray-200 dark:border-zinc-800 dark:hover:border-transparent rounded-lg text-[9px] font-bold uppercase cursor-pointer transition-all flex items-center gap-1"
                              >
                                View
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>

                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default RelationshipFinder;

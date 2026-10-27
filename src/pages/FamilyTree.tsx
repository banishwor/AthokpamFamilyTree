import React, { useState, useEffect, useRef, useCallback } from 'react';
import Tree from 'react-d3-tree';
import useTree from '../hooks/useTree';
import useMembers from '../hooks/useMembers';
import TreeNode from '../components/TreeNode';
import TreeQuickEdit from '../components/TreeQuickEdit';
import SearchableSelect from '../components/SearchableSelect';
import { Member } from '../types';
import { fullName, sortedByName } from '../utils/memberSave';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Loader2, GitMerge, RefreshCw, ZoomIn, ZoomOut, Info, Maximize2, Home } from 'lucide-react';

// Custom SVG path drawing function to connect children from the bottom-middle of parents' cards
const customPathFunc = (link: any) => {
  const { source, target } = link;
  const startX = source.x;
  // Card height is 82px and they are positioned at y = 20.
  // So the bottom edge of the parents' cards is exactly at source.y + 102
  const startY = source.y + 102;
  const endX = target.x;
  const endY = target.y;

  // Let's find the midway point vertically between the parent bottom and child top joint
  const midY = (startY + endY) / 2;

  // Draw a standard vertical/horizontal elegant elbow step-down path
  return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
};

export const FamilyTree: React.FC = () => {
  const { treeData, loading, error, refresh } = useTree();
  
  // Calculate reliable initial width and height to prevent centering at 0,0 on iOS
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = Math.min(window.innerWidth - 32, 1200);
      const h = Math.max(window.innerHeight - 300, 500);
      return { width: w, height: h };
    }
    return { width: 800, height: 600 };
  });

  const [translate, setTranslate] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = Math.min(window.innerWidth - 32, 1200);
      return { x: w / 2, y: 80 };
    }
    return { x: 400, y: 80 };
  });

  const [zoom, setZoom] = useState<number>(0.8);
  const containerRef = useRef<HTMLDivElement>(null);

  // Member list (shared cache) powers the person search and, for an
  // admin session, the tap-to-edit popup.
  const { members: allMembers } = useMembers();
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isAdmin') === 'true';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    } catch {
      /* ignore */
    }
  }, []);
  const [searchId, setSearchId] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingMember: Member | null =
    editingId != null ? allMembers.find((m) => String(m.id) === editingId) || null : null;

  // Keep zoom/translate in sync with the user's own pan/zoom gestures
  // (rd3t reports them via onUpdate). Functional updates that return
  // the previous value when nothing changed keep this loop-free.
  const handleTreeUpdate = useCallback((evt: any) => {
    if (!evt || typeof evt.zoom !== 'number' || !evt.translate) return;
    setZoom((prev) => (Math.abs(prev - evt.zoom) > 0.0001 ? evt.zoom : prev));
    setTranslate((prev) =>
      Math.abs(prev.x - evt.translate.x) > 0.5 || Math.abs(prev.y - evt.translate.y) > 0.5
        ? { x: evt.translate.x, y: evt.translate.y }
        : prev
    );
  }, []);

  const zoomBy = useCallback(
    (factor: number) => {
      setZoom((prevZoom) => {
        const next = Math.min(2, Math.max(0.2, +(prevZoom * factor).toFixed(3)));
        if (next === prevZoom) return prevZoom;
        setTranslate((prevT) => {
          const cx = dimensions.width / 2;
          const cy = dimensions.height / 2;
          const ratio = next / prevZoom;
          return { x: cx - (cx - prevT.x) * ratio, y: cy - (cy - prevT.y) * ratio };
        });
        return next;
      });
    },
    [dimensions]
  );

  // Centre the view on one person's card (found in the rendered SVG)
  // and ring-highlight it briefly.
  const focusMember = useCallback(
    (memberId: string) => {
      const container = containerRef.current;
      if (!container) return;
      const card = container.querySelector(`[id="tree-card-member-${memberId}"]`);
      if (!card) {
        toast('That person is inside a collapsed branch. Tap EXPAND (+) on their family line, then search again.', {
          icon: 'ℹ️',
        });
        return;
      }
      let node: Element | null = card;
      let transform = '';
      while (node) {
        const t = node.getAttribute?.('transform') || '';
        if (t.includes('translate')) {
          transform = t;
          break;
        }
        node = node.parentElement;
      }
      const match = /translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/.exec(transform);
      if (!match) {
        toast.error('Could not locate that person on the tree.');
        return;
      }
      const nx = parseFloat(match[1]);
      const ny = parseFloat(match[2]);
      const z = Math.min(1.1, Math.max(zoom, 0.95));
      setZoom(z);
      setTranslate({ x: dimensions.width / 2 - nx * z, y: dimensions.height * 0.42 - ny * z });
      setHighlightId(memberId);
      window.setTimeout(() => {
        setHighlightId((cur) => (cur === memberId ? null : cur));
      }, 4500);
    },
    [dimensions, zoom]
  );

  const searchOptions = sortedByName(allMembers).map((m) => ({ id: String(m.id), name: fullName(m) }));

  // ResizeObserver for responsive canvas sizing (as required by responsive guidelines)
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          
          // Guard against incorrect zero scale values reporting on start (especially Safari/iOS lifecycle)
          if (width > 120 && height > 120) {
            const targetHeight = height > 200 ? height : 600;
            setDimensions({ width, height: targetHeight });
            // Center the root node horizontally, place it slightly down vertically
            setTranslate({ x: width / 2, y: 80 });
          }
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const handleRecenter = () => {
    setTranslate({ x: dimensions.width / 2, y: 80 });
    setZoom(0.8);
    setHighlightId(null);
    setSearchId('');
  };

  return (
    <div id="family-tree-page" className="h-[100dvh] md:h-auto md:min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-3 py-3 sm:px-6 lg:px-8 md:py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col h-full md:h-[calc(100vh-140px)]">
        {/* Header Block */}
        <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <GitMerge className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              Athokpam Family Heritage Tree
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 uppercase tracking-widest font-bold">
              GENEALOGICAL LINEAGE INTERACTIVE MAP
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-tree-recenter"
              onClick={handleRecenter}
              className="px-3.5 py-1.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-805 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Recenter Tree
            </button>
            <button
              id="btn-tree-refresh"
              onClick={refresh}
              className="p-1.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-805 rounded-xl shadow-sm transition-all"
              title="Refresh lineage tree data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>


        {/* Mobile slim toolbar: home, search, recenter, refresh.
            No zoom buttons on touch screens (pinch handles it) and
            no title block — every pixel goes to the tree. */}
        <div className="flex md:hidden items-center gap-2 mb-2">
          <Link
            to="/"
            aria-label="Back to home"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 shadow-sm"
          >
            <Home className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <SearchableSelect
              id="tree-person-search-mobile"
              value={searchId}
              onChange={(id) => {
                setSearchId(id);
                if (id) focusMember(id);
              }}
              options={searchOptions}
              emptyLabel="-- Find a person in the tree --"
              placeholder="Find a person in the tree"
            />
          </div>
          <button
            type="button"
            onClick={handleRecenter}
            aria-label="Recenter tree"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 shadow-sm"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh tree data"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Person search (desktop) */}
        <div className="hidden md:block mb-4 max-w-md">
          <SearchableSelect
            id="tree-person-search"
            value={searchId}
            onChange={(id) => {
              setSearchId(id);
              if (id) focusMember(id);
            }}
            options={searchOptions}
            emptyLabel="-- Find a person in the tree --"
            placeholder="Find a person in the tree"
          />
          {isAdmin && (
            <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1.5">
              Admin: tap the pencil on any person's card to edit them right here.
            </p>
          )}
        </div>

        {/* Tree Canvas Wrapper */}
        <div
          ref={containerRef}
          id="tree-canvas-container"
          className="flex-1 min-h-0 md:min-h-[400px] border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-zinc-900 sophisticated-grid-bg shadow-inner relative overflow-hidden flex flex-col items-stretch justify-stretch"
        >
          {loading ? (
            <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                Loading interactive tree schema...
              </span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-red-50/30 dark:bg-zinc-900/20 z-30">
              <span className="p-3 bg-red-100 text-red-700 rounded-full font-bold text-lg mb-4">
                ⚠
              </span>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                Failed to load family tree data
              </h3>
              <p className="text-xs text-gray-400 mt-2 max-w-sm">
                Error log: {error}. Please ensure the database contains records and your internet connection is active.
              </p>
              <button
                id="btn-tree-error-retry"
                onClick={refresh}
                className="mt-4 px-4 py-2 bg-amber-600 text-white font-extrabold text-xs rounded-xl hover:bg-amber-700 transition"
              >
                Retry Request
              </button>
            </div>
          ) : treeData ? (
            <div className="w-full h-full relative" id="react-d3-tree-viewport">
              <Tree
                data={treeData}
                dimensions={dimensions}
                translate={translate}
                zoom={zoom}
                onUpdate={handleTreeUpdate}
                scaleExtent={{ min: 0.2, max: 2.0 }}
                orientation="vertical"
                nodeSize={{ x: 355, y: 190 }}
                pathFunc={customPathFunc}
                pathClassFunc={() => 'stroke-amber-400/90 dark:stroke-amber-500/40 stroke-[2px] fill-none transition-all'}
                separation={{ siblings: 1.4, nonSiblings: 1.7 }}
                renderCustomNodeElement={(rd3tProps) => (
                  <TreeNode
                    nodeDatum={rd3tProps.nodeDatum}
                    toggleNode={rd3tProps.toggleNode}
                    isAdmin={isAdmin}
                    highlightId={highlightId}
                    zoomLevel={zoom}
                    onEditMember={(id) => setEditingId(id)}
                  />
                )}
              />
              {/* Floating zoom controls */}
              <div className="absolute bottom-3 right-3 z-20 hidden md:flex flex-col items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-lg p-1">
                <button
                  type="button"
                  onClick={() => zoomBy(1.25)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 transition"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <span className="text-[11px] font-black text-gray-500 dark:text-zinc-400 tabular-nums">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => zoomBy(0.8)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 transition"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className="w-6 h-px bg-gray-200 dark:bg-zinc-800" />
                <button
                  type="button"
                  onClick={handleRecenter}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 transition"
                  aria-label="Recenter tree"
                  title="Recenter tree"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 dark:text-zinc-500">
              <GitMerge className="w-12 h-12 mb-3" />
              <span className="text-xs font-bold">No family tree data currently available.</span>
            </div>
          )}
        </div>

        {editingMember && (
          <TreeQuickEdit
            member={editingMember}
            allMembers={allMembers}
            onClose={() => setEditingId(null)}
            onSaved={() => {
              setEditingId(null);
              refresh();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FamilyTree;

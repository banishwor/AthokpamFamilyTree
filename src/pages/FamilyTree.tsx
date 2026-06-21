import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import useTree from '../hooks/useTree';
import TreeNode from '../components/TreeNode';
import { Loader2, GitMerge, RefreshCw, ZoomIn, Info, Maximize2 } from 'lucide-react';

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
  };

  return (
    <div id="family-tree-page" className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-140px)]">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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


        {/* Tree Canvas Wrapper */}
        <div
          ref={containerRef}
          id="tree-canvas-container"
          className="flex-1 min-h-[400px] border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-zinc-900 sophisticated-grid-bg shadow-inner relative overflow-hidden flex flex-col items-stretch justify-stretch"
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
                  />
                )}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 dark:text-zinc-500">
              <GitMerge className="w-12 h-12 mb-3" />
              <span className="text-xs font-bold">No family tree data currently available.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;

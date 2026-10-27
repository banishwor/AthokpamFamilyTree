import React, { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronLeft, ImageDown, Loader2, Share2 } from 'lucide-react';
import useMembers from '../hooks/useMembers';
import { fullName } from '../utils/memberSave';
import {
  ancestorStats,
  buildAncestorTree,
  collectAncestorPeople,
  AncestorNode,
} from '../utils/ancestors';
import {
  CHART_BG,
  ChartFooter,
  ChartHeader,
  ChartPerson,
  captureChartPng,
  downloadDataUrl,
  shareChartImage,
  useEmbeddedPhotos,
} from '../components/chartKit';

/** Card for one ancestor: the person, plus their siblings (when that
 *  generation's collateral toggle is on) as a compact row beneath. */
const AncestorCard: React.FC<{ node: AncestorNode; photos: Record<string, string> }> = ({ node, photos }) => (
  <div
    className="acard"
    style={{
      background: '#FFFFFF',
      border: '1.5px solid #E5D9B8',
      borderRadius: 16,
      padding: '12px 12px 10px',
      boxShadow: '0 1px 3px rgba(120, 90, 20, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <ChartPerson member={node.member} photos={photos} />
    {node.siblings.length > 0 && (
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #D8C48F', width: '100%' }}>
        <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 700, color: '#92700C', textAlign: 'center', marginBottom: 6 }}>
          SIBLINGS
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {node.siblings.map((s) => (
            <ChartPerson key={s.id} member={s} photos={photos} size={34} />
          ))}
        </div>
      </div>
    )}
  </div>
);

const AncestorLi: React.FC<{ node: AncestorNode; photos: Record<string, string>; isRoot?: boolean }> = ({
  node,
  photos,
  isRoot = false,
}) => (
  <li>
    <AncestorCard node={node} photos={photos} />
    {/* Vertical stub from this card down to the connector bar below.
        In normal flow, directly under the card (order 3 in the li's
        flex column), so contact with the card is by construction.
        Earlier versions positioned this stub absolutely (and before
        that as a pseudo-element border); both intermittently left a
        few-px gap under one parent card (Thouranishabi) while the
        others connected, for reasons the live DOM never revealed. */}
    {!isRoot && (
      <div
        aria-hidden
        style={{
          order: 3,
          width: 2,
          height: 24,
          background: '#C3A35F',
          flexShrink: 0,
        }}
      />
    )}
    {(node.father || node.mother) && (
      <ul>
        {node.father && <AncestorLi node={node.father} photos={photos} />}
        {node.mother && <AncestorLi node={node.mother} photos={photos} />}
      </ul>
    )}
  </li>
);

const GEN_OPTIONS: { label: string; value: number }[] = [
  { label: '2 generations', value: 2 },
  { label: '3 generations', value: 3 },
  { label: '4 generations', value: 4 },
  { label: 'All generations', value: 99 },
];

const SIBLING_GEN_LABELS = [
  'Own siblings',
  "Parents' siblings",
  "Grandparents' siblings",
  "Great-grandparents' siblings",
  "Great-great-grandparents' siblings",
];

const AncestorsChart: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { members, loading, error } = useMembers();
  const [generations, setGenerations] = useState(3);
  const [siblingGens, setSiblingGens] = useState<ReadonlySet<number>>(new Set());
  const [exporting, setExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const root = useMemo(() => members.find((m) => m.id === id) ?? null, [members, id]);

  const tree = useMemo(
    () => (root ? buildAncestorTree(root, members, generations, siblingGens) : null),
    [root, members, generations, siblingGens]
  );

  const stats = tree ? ancestorStats(tree) : { ancestors: 0, siblings: 0, depth: 0 };
  const chartPeople = useMemo(() => (tree ? collectAncestorPeople(tree) : []), [tree]);
  const photos = useEmbeddedPhotos(chartPeople);

  const toggleSiblingGen = (gen: number) => {
    setSiblingGens((prev) => {
      const next = new Set(prev);
      if (next.has(gen)) next.delete(gen);
      else next.add(gen);
      return next;
    });
  };

  const fileName = root ? `ancestors-of-${fullName(root).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png` : 'ancestor-chart.png';

  const handleDownload = async () => {
    if (!chartRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await captureChartPng(chartRef.current);
      downloadDataUrl(dataUrl, fileName);
      toast.success('Chart image downloaded — ready to share.');
    } catch {
      toast.error('Could not create the image. Try a smaller generation count.');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!chartRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await captureChartPng(chartRef.current);
      const outcome = await shareChartImage(dataUrl, fileName, root ? `Ancestors of ${fullName(root)}` : 'Ancestor Chart');
      if (outcome === 'unsupported') {
        toast('Sharing images is not supported in this browser — use Download instead.', { icon: 'ℹ️' });
      } else if (outcome === 'error') {
        toast.error('Could not share the image. Try Download instead.');
      }
    } catch {
      toast.error('Could not create the image. Try a smaller generation count.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error || !root || !tree) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 px-6 py-20 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 p-8 rounded-3xl shadow-md space-y-4">
          <h3 className="font-extrabold text-gray-900 dark:text-white">Chart unavailable</h3>
          <p className="text-sm text-gray-500">{error || 'That family member could not be found.'}</p>
          <Link to="/members" className="inline-block px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const siblingToggleCount = Math.min(generations, 4) + 1; // generations 0..4

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Controls — never part of the exported image */}
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <Link
            to={`/member/${root.id}`}
            className="px-3.5 min-h-[44px] inline-flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl text-sm font-bold shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Profile
          </Link>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Generations">
            {GEN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGenerations(opt.value)}
                className={`px-3 min-h-[44px] rounded-xl text-sm font-bold border transition ${
                  generations === opt.value
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto">
            <button
              type="button"
              onClick={handleShare}
              disabled={exporting || stats.ancestors === 0}
              className="px-4 min-h-[44px] inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-amber-600 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Share
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting || stats.ancestors === 0}
              className="px-4 min-h-[44px] inline-flex items-center gap-2 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageDown className="w-4 h-4" />} Download PNG
            </button>
          </div>
        </div>

        {/* Collateral toggles: whose siblings join the chart */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mr-1">Also include:</span>
          {SIBLING_GEN_LABELS.slice(0, siblingToggleCount).map((label, gen) => (
            <button
              key={gen}
              type="button"
              onClick={() => toggleSiblingGen(gen)}
              aria-pressed={siblingGens.has(gen)}
              className={`px-3 min-h-[40px] rounded-full text-xs font-bold border transition ${
                siblingGens.has(gen)
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {stats.ancestors === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 rounded-3xl p-10 text-center">
            <p className="font-bold text-gray-900 dark:text-white">No ancestors recorded yet for {fullName(root)}.</p>
            <p className="text-sm text-gray-500 mt-2">
              A chart appears once a father or mother is linked to {root.gender === 'F' ? 'her' : 'him'} in the family records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4 -mx-3 px-3">
            {/* The exported image: everything inside this frame */}
            <div
              ref={chartRef}
              style={{
                display: 'inline-block',
                background: CHART_BG,
                padding: '38px 42px 30px',
                fontFamily: 'Georgia, "Times New Roman", serif',
              }}
            >
              <ChartHeader
                title={`Ancestors of ${fullName(root)}`}
                subtitle={
                  `${stats.ancestors} ancestor${stats.ancestors === 1 ? '' : 's'} across ${stats.depth} generation${stats.depth === 1 ? '' : 's'}` +
                  (stats.siblings > 0 ? ` · including ${stats.siblings} sibling${stats.siblings === 1 ? '' : 's'}` : '')
                }
              />
              <div className="achart">
                <ul>
                  <AncestorLi node={tree} photos={photos} isRoot />
                </ul>
              </div>
              <ChartFooter />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AncestorsChart;

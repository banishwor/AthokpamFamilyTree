import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import { ChevronLeft, Heart, ImageDown, Loader2, Share2 } from 'lucide-react';
import useMembers from '../hooks/useMembers';
import { Member } from '../types';
import { getDirectPhotoUrl } from '../utils';
import { fullName } from '../utils/memberSave';
import {
  buildDescendantTree,
  countDescendants,
  treeDepth,
  DescendantNode,
} from '../utils/descendants';

const CHART_BG = '#FDFBF6';
const SITE_LINK = 'banishwor.github.io/AthokpamFamilyTree';

function yearsOf(m: Member): string {
  const b = m.birthDate ? m.birthDate.slice(0, 4) : '';
  const d = m.deathDate ? m.deathDate.slice(0, 4) : '';
  if (!b && !d) return '';
  return d ? `${b} – ${d}` : `b. ${b}`;
}

function initialsOf(m: Member): string {
  return `${(m.firstName || '?').charAt(0)}${(m.lastName || '').charAt(0)}`.toUpperCase();
}

/** One person inside a chart card: photo if it embedded cleanly, else initials. */
const ChartPerson: React.FC<{ member: Member; photos: Record<string, string> }> = ({ member, photos }) => {
  const photo = photos[member.id];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 118 }}>
      {photo ? (
        <img
          src={photo}
          alt={fullName(member)}
          style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C3A35F' }}
        />
      ) : (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 17,
            color: '#fff',
            background: member.gender === 'F' ? '#DB2777' : '#B08A3C',
            border: '2px solid #C3A35F',
          }}
        >
          {initialsOf(member)}
        </div>
      )}
      <div
        style={{
          marginTop: 7,
          fontSize: 13.5,
          fontWeight: 700,
          lineHeight: 1.25,
          color: '#292524',
          textAlign: 'center',
          wordBreak: 'break-word',
        }}
      >
        {fullName(member)}
      </div>
      {yearsOf(member) && (
        <div style={{ fontSize: 11, color: '#92700C', marginTop: 1 }}>{yearsOf(member)}</div>
      )}
    </div>
  );
};

/** A node in the chart: one person, or a couple side by side. */
const ChartCouple: React.FC<{ node: DescendantNode; photos: Record<string, string> }> = ({ node, photos }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: node.spouse ? 6 : 0,
      background: '#FFFFFF',
      border: '1.5px solid #E5D9B8',
      borderRadius: 16,
      padding: '12px 12px 10px',
      boxShadow: '0 1px 3px rgba(120, 90, 20, 0.12)',
    }}
  >
    <ChartPerson member={node.member} photos={photos} />
    {node.spouse && (
      <>
        <Heart style={{ width: 15, height: 15, color: '#C3A35F', fill: '#C3A35F', marginTop: 20, flexShrink: 0 }} />
        <ChartPerson member={node.spouse} photos={photos} />
      </>
    )}
  </div>
);

const ChartNodeLi: React.FC<{ node: DescendantNode; photos: Record<string, string> }> = ({ node, photos }) => (
  <li>
    <ChartCouple node={node} photos={photos} />
    {node.children.length > 0 && (
      <ul>
        {node.children.map((child) => (
          <ChartNodeLi key={child.member.id} node={child} photos={photos} />
        ))}
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

const DescendantChart: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { members, loading, error } = useMembers();
  const [generations, setGenerations] = useState(3);
  const [includeSpouses, setIncludeSpouses] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const chartRef = useRef<HTMLDivElement>(null);

  const root = useMemo(() => members.find((m) => m.id === id) ?? null, [members, id]);

  const tree = useMemo(
    () => (root ? buildDescendantTree(root, members, generations, includeSpouses) : null),
    [root, members, generations, includeSpouses]
  );

  const descendantCount = tree ? countDescendants(tree) : 0;
  const depthReached = tree ? treeDepth(tree) : 0;

  // Pre-embed portraits as data URLs so the exported PNG can include
  // them (a plain <img> to Google Drive would be blocked by canvas
  // security). Any photo that fails simply falls back to initials.
  useEffect(() => {
    if (!tree) return;
    const wanted: Member[] = [];
    const walk = (n: DescendantNode) => {
      if (n.member.photoUrl) wanted.push(n.member);
      if (n.spouse?.photoUrl) wanted.push(n.spouse);
      n.children.forEach(walk);
    };
    walk(tree);
    let cancelled = false;
    wanted
      .filter((m) => !(m.id in photos))
      .forEach(async (m) => {
        const direct = getDirectPhotoUrl(m.photoUrl);
        if (!direct) return;
        try {
          const res = await fetch(direct);
          if (!res.ok) throw new Error('photo fetch failed');
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          if (!cancelled) setPhotos((prev) => ({ ...prev, [m.id]: dataUrl }));
        } catch {
          if (!cancelled) setPhotos((prev) => ({ ...prev, [m.id]: '' }));
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  const fileName = root ? `descendants-of-${fullName(root).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png` : 'descendant-chart.png';

  const capturePng = async (): Promise<string | null> => {
    const node = chartRef.current;
    if (!node) return null;
    const width = node.scrollWidth;
    const pixelRatio = width > 2600 ? 1.5 : 2;
    return toPng(node, { pixelRatio, backgroundColor: CHART_BG, cacheBust: true });
  };

  const handleDownload = async () => {
    setExporting(true);
    try {
      const dataUrl = await capturePng();
      if (!dataUrl) throw new Error('nothing to capture');
      const a = document.createElement('a');
      a.download = fileName;
      a.href = dataUrl;
      a.click();
      toast.success('Chart image downloaded — ready to share.');
    } catch {
      toast.error('Could not create the image. Try a smaller generation count.');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    setExporting(true);
    try {
      const dataUrl = await capturePng();
      if (!dataUrl) throw new Error('nothing to capture');
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: root ? `Descendants of ${fullName(root)}` : 'Descendant Chart' });
      } else {
        toast('Sharing images is not supported in this browser — use Download instead.', { icon: 'ℹ️' });
      }
    } catch (err) {
      // User closing the share sheet is not an error.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Could not share the image. Try Download instead.');
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

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Controls — never part of the exported image */}
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
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
          <button
            type="button"
            onClick={() => setIncludeSpouses((v) => !v)}
            aria-pressed={includeSpouses}
            className={`px-3 min-h-[44px] rounded-xl text-sm font-bold border transition ${
              includeSpouses
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-800'
            }`}
          >
            Spouses {includeSpouses ? 'shown' : 'hidden'}
          </button>
          <div className="flex gap-1.5 ml-auto">
            <button
              type="button"
              onClick={handleShare}
              disabled={exporting || descendantCount === 0}
              className="px-4 min-h-[44px] inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-amber-600 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Share
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting || descendantCount === 0}
              className="px-4 min-h-[44px] inline-flex items-center gap-2 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageDown className="w-4 h-4" />} Download PNG
            </button>
          </div>
        </div>

        {descendantCount === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/5 rounded-3xl p-10 text-center">
            <p className="font-bold text-gray-900 dark:text-white">No descendants recorded yet for {fullName(root)}.</p>
            <p className="text-sm text-gray-500 mt-2">
              A chart appears once children are linked to {root.gender === 'F' ? 'her' : 'him'} (or {root.gender === 'F' ? 'her' : 'his'} spouse) in the family records.
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
              <div style={{ textAlign: 'center', marginBottom: 26 }}>
                <div style={{ fontSize: 12.5, letterSpacing: 3.5, fontWeight: 700, color: '#92700C' }}>
                  ATHOKPAM FAMILY TREE
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#292524', marginTop: 6 }}>
                  Descendants of {fullName(root)}
                </div>
                <div style={{ fontSize: 13.5, color: '#78716C', marginTop: 5 }}>
                  {descendantCount} descendant{descendantCount === 1 ? '' : 's'} across {depthReached} generation{depthReached === 1 ? '' : 's'}
                </div>
              </div>

              <div className="dchart">
                <ul>
                  <ChartNodeLi node={tree} photos={photos} />
                </ul>
              </div>

              <div
                style={{
                  marginTop: 30,
                  paddingTop: 16,
                  borderTop: '2px solid #C3A35F',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#57534E' }}>
                  Generated using Athokpam Family Tree
                </div>
                <div style={{ fontSize: 12.5, color: '#92700C', marginTop: 3 }}>
                  Developed by Banishwor Athokpam · {SITE_LINK}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescendantChart;

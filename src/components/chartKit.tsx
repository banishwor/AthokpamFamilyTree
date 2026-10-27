import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Member } from '../types';
import { getDirectPhotoUrl } from '../utils';
import { fullName } from '../utils/memberSave';

/**
 * Shared building blocks for the shareable chart images
 * (descendants + ancestors). Charts are always drawn light and
 * parchment-styled, whatever the site theme, because the output
 * is a photo shared on social media.
 */
export const CHART_BG = '#FDFBF6';
export const SITE_LINK = 'banishwor.github.io/AthokpamFamilyTree';

export function yearOf(dateStr?: string): string {
  if (!dateStr) return '';
  // Dates arrive as UTC ISO strings (a 1 Jan 1950 IST birth is stored
  // as 1949-12-31T18:30Z) — parse, don't slice, or the year shifts.
  const y = new Date(dateStr).getFullYear();
  return Number.isNaN(y) ? '' : String(y);
}

export function yearsOf(m: Member): string {
  const b = yearOf(m.birthDate);
  const d = yearOf(m.deathDate);
  if (!b && !d) return '';
  return d ? `${b} – ${d}` : `b. ${b}`;
}

export function initialsOf(m: Member): string {
  return `${(m.firstName || '?').charAt(0)}${(m.lastName || '').charAt(0)}`.toUpperCase();
}

/**
 * Pre-embed portraits as data URLs so they survive canvas export
 * (a plain <img> to Google Drive would be blocked by canvas
 * security). Returns a map of member id → data URL; a member whose
 * photo cannot be embedded maps to '' and renders as initials.
 */
export function useEmbeddedPhotos(people: Member[]): Record<string, string> {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const attempted = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    people
      .filter((m) => m.photoUrl && !attempted.current.has(m.id))
      .forEach(async (m) => {
        attempted.current.add(m.id);
        const direct = getDirectPhotoUrl(m.photoUrl);
        if (!direct) {
          if (!cancelled) setPhotos((prev) => ({ ...prev, [m.id]: '' }));
          return;
        }
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
  }, [people]);

  return photos;
}

/** One person inside a chart card: embedded photo, else initials medallion. */
export const ChartPerson: React.FC<{
  member: Member;
  photos: Record<string, string>;
  size?: number;
}> = ({ member, photos, size = 52 }) => {
  const photo = photos[member.id];
  const fontSize = Math.round(size * 0.33);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: size === 52 ? 118 : 84 }}>
      {photo ? (
        <img
          src={photo}
          alt={fullName(member)}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C3A35F' }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize,
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
          fontSize: size === 52 ? 13.5 : 11.5,
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

export const ChartHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: 26 }}>
    <div style={{ fontSize: 12.5, letterSpacing: 3.5, fontWeight: 700, color: '#92700C' }}>
      ATHOKPAM FAMILY TREE
    </div>
    <div style={{ fontSize: 30, fontWeight: 800, color: '#292524', marginTop: 6 }}>{title}</div>
    <div style={{ fontSize: 13.5, color: '#78716C', marginTop: 5 }}>{subtitle}</div>
  </div>
);

export const ChartFooter: React.FC = () => (
  <div style={{ marginTop: 30, paddingTop: 16, borderTop: '2px solid #C3A35F', textAlign: 'center' }}>
    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#57534E' }}>
      Generated using Athokpam Family Tree
    </div>
    <div style={{ fontSize: 12.5, color: '#92700C', marginTop: 3 }}>
      Developed by Banishwor Athokpam · {SITE_LINK}
    </div>
  </div>
);

/** Render the chart frame to a PNG data URL at 2x (1.5x when very wide). */
export async function captureChartPng(node: HTMLElement): Promise<string> {
  const width = node.scrollWidth;
  const pixelRatio = width > 2600 ? 1.5 : 2;
  return toPng(node, { pixelRatio, backgroundColor: CHART_BG, cacheBust: true });
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.download = filename;
  a.href = dataUrl;
  a.click();
}

export type ShareOutcome = 'shared' | 'unsupported' | 'aborted' | 'error';

/** Share a PNG via the Web Share API where the browser supports files. */
export async function shareChartImage(dataUrl: string, filename: string, title: string): Promise<ShareOutcome> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title });
      return 'shared';
    }
    return 'unsupported';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'aborted';
    return 'error';
  }
}

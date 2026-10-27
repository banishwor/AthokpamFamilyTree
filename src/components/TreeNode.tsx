import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getDirectPhotoUrl } from '../utils';
import { useTheme } from '../context/ThemeContext';

/**
 * One node of the interactive tree, drawn as PURE SVG (rects, text,
 * clipped images) — no foreignObject HTML.
 *
 * Why: iOS Safari / WKWebView renders foreignObject content at the
 * wrong position when an ancestor <g> carries the d3 zoom
 * transform — on iPhone the person cards bunched up at the canvas
 * corner, detached from the (correctly drawn) connector lines and
 * dots, so the tree looked "all disconnected". Pure SVG elements
 * transform identically in every browser, phones included.
 *
 * Card geometry (node-local coords): card top at y=20, height 82,
 * so the bottom edge is y=102. The toggle dot (r=11) ends at y=11,
 * leaving a 9px band where the incoming connector line is visible
 * between dot and card. FamilyTree's customPathFunc is tuned to
 * these numbers — change them together.
 */

interface TreeNodeProps {
  nodeDatum: any;
  toggleNode: () => void;
  /** Show the quick-edit pencil on each person card (admin session) */
  isAdmin?: boolean;
  /** Member id to visually highlight (e.g. after a person search) */
  highlightId?: string | null;
  /** Called when an admin taps the pencil on a person's card */
  onEditMember?: (memberId: string) => void;
  /** Current tree zoom (0.2–2). EXPAND/COLLAPSE labels hide below 0.6. */
  zoomLevel?: number;
}

export const CARD_W = 214;
export const CARD_H = 82;
export const CARD_TOP = 20;

function truncate(text: string, max: number): string {
  const t = (text || '').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ nodeDatum, toggleNode, isAdmin, highlightId, onEditMember, zoomLevel }) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Basic fields from primary datum
  const memberId = nodeDatum.id || nodeDatum.attributes?.id;
  const firstName = nodeDatum.firstName || nodeDatum.name || 'Unknown';
  const lastName = nodeDatum.lastName || '';
  const gender = nodeDatum.gender || nodeDatum.attributes?.gender || 'M';
  const photoUrl = nodeDatum.photoUrl || nodeDatum.attributes?.photoUrl;
  const occupation = nodeDatum.occupation || nodeDatum.attributes?.occupation || '';
  const birthDate = nodeDatum.attributes?.birthDate || '';

  const isPrimaryFemale = gender && (String(gender).toUpperCase().startsWith('F') || String(gender).toLowerCase() === 'female' || gender === 'F');

  const spouseObj = nodeDatum.spouse;
  const hasSpouse = !!spouseObj;

  // Husband always on the left, wife on the right.
  let husband: any = null;
  let wife: any = null;

  if (hasSpouse) {
    const primary = { id: memberId, firstName, lastName, gender: isPrimaryFemale ? 'F' : 'M', photoUrl, occupation, birthDate };
    const spouse = {
      id: spouseObj.id,
      firstName: spouseObj.firstName,
      lastName: spouseObj.lastName,
      gender: isPrimaryFemale ? 'M' : 'F',
      photoUrl: spouseObj.photoUrl,
      occupation: spouseObj.occupation,
      birthDate: spouseObj.birthDate,
    };
    if (isPrimaryFemale) {
      wife = primary;
      husband = spouse;
    } else {
      husband = primary;
      wife = spouse;
    }
  }

  const getInitials = (fName: string, lName: string) => {
    const f = fName ? fName.charAt(0).toUpperCase() : '';
    const l = lName ? lName.charAt(0).toUpperCase() : '';
    return `${f}${l}` || 'M';
  };

  /** One person card as SVG, with its left edge at local x = cx. */
  const renderMemberCard = (m: any, cx: number) => {
    const isFemaleCard = m.gender === 'F';
    const mFullName = `${m.firstName} ${m.lastName || ''}`.trim();
    const hasValidId = m.id && m.id !== 'undefined' && !String(m.id).startsWith('virtual');
    const isHighlighted = !!highlightId && hasValidId && String(m.id) === String(highlightId);
    const clipId = `avatar-clip-${String(m.id || 'x').replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const cardFill = isDark ? '#16181D' : '#FFFFFF';
    const cardStroke = isHighlighted
      ? '#F59E0B'
      : isFemaleCard
        ? isDark
          ? '#831843'
          : '#FBCFE8'
        : isDark
          ? '#3F3F46'
          : '#FDE68A';
    const nameFill = isDark ? '#E4E4E7' : '#111827';
    const subFill = isDark ? '#71717A' : '#9CA3AF';
    const avatarBg = isDark ? '#27272A' : '#F9FAFB';

    return (
      <g
        key={String(m.id || cx)}
        id={`tree-card-member-${m.id}`}
        onClick={(e) => {
          e.stopPropagation();
          if (hasValidId) navigate(`/member/${m.id}`);
        }}
        style={{ cursor: hasValidId ? 'pointer' : 'default' }}
      >
        <rect
          x={cx}
          y={0}
          width={CARD_W}
          height={CARD_H}
          rx={12}
          fill={cardFill}
          stroke={cardStroke}
          strokeWidth={isHighlighted ? 3.5 : 1.2}
        />
        {/* Avatar: photo (clipped to a rounded square) or initials */}
        <clipPath id={clipId}>
          <rect x={cx + 8} y={19} width={44} height={44} rx={9} />
        </clipPath>
        <rect x={cx + 8} y={19} width={44} height={44} rx={9} fill={avatarBg} stroke={isDark ? '#3F3F46' : '#F3F4F6'} />
        {m.photoUrl ? (
          <image
            href={getDirectPhotoUrl(m.photoUrl)}
            x={cx + 8}
            y={19}
            width={44}
            height={44}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <>
            <rect x={cx + 8} y={19} width={44} height={44} clipPath={`url(#${clipId})`} fill={isFemaleCard ? '#F43F5E' : '#B08A3C'} />
            <text x={cx + 30} y={41} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#FFFFFF">
              {getInitials(m.firstName, m.lastName)}
            </text>
          </>
        )}
        {/* Details */}
        <text x={cx + 60} y={m.occupation || m.birthDate ? 28 : 36} fontSize={11.5} fontWeight={800} fill={nameFill}>
          {truncate(mFullName, 24)}
        </text>
        {m.occupation ? (
          <text x={cx + 60} y={44} fontSize={9} fill={subFill}>
            {truncate(m.occupation, 32)}
          </text>
        ) : null}
        {m.birthDate ? (
          <text x={cx + 60} y={m.occupation ? 58 : 46} fontSize={8.5} fontFamily="'JetBrains Mono', monospace" fill={subFill}>
            {truncate(`b. ${m.birthDate}`, 30)}
          </text>
        ) : null}
        {hasValidId && (
          <text x={cx + 60} y={74} fontSize={8.5} fontWeight={800} fill="#C5A059">
            View Profile →
          </text>
        )}
        {/* Admin quick-edit pencil */}
        {isAdmin && hasValidId && onEditMember && (
          <g
            onClick={(e) => {
              e.stopPropagation();
              onEditMember(String(m.id));
            }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={cx + CARD_W} cy={0} r={11} fill="#D97706" stroke={isDark ? '#0D0E12' : '#FFFFFF'} strokeWidth={2} />
            <text x={cx + CARD_W} y={0.5} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#FFFFFF">
              ✎
            </text>
          </g>
        )}
      </g>
    );
  };

  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;

  return (
    <g>
      {/* Circle to trigger native node toggle, positioned in the exact horizontal center */}
      <circle
        r="11"
        fill={hasSpouse ? '#c5a059' : isPrimaryFemale ? '#f43f5e' : '#c5a059'}
        stroke={isDark ? '#0D0E12' : '#FFFFFF'}
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
        onClick={toggleNode}
      />
      {hasChildren && (zoomLevel ?? 1) >= 0.6 && (
        <text
          y="-18"
          x="0"
          textAnchor="middle"
          fill="#897147"
          fontSize="9"
          fontWeight="bold"
          className="pointer-events-none select-none font-mono tracking-wider opacity-90"
        >
          {nodeDatum.__rd3t.collapsed ? 'EXPAND (+)' : 'COLLAPSE (-)'}
        </text>
      )}

      {/* Person card(s), hanging below the toggle dot */}
      <g transform={`translate(0 ${CARD_TOP})`}>
        {hasSpouse ? (
          <>
            {husband && renderMemberCard(husband, -228)}
            {/* Partnership heart between the two cards */}
            <g>
              <circle cx={0} cy={41} r={10.5} fill={isDark ? '#27272A' : '#FFFBEB'} stroke="#C5A059" strokeWidth={1} />
              <text x={0} y={41.5} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#D97706">
                ♥
              </text>
            </g>
            {wife && renderMemberCard(wife, 14)}
          </>
        ) : (
          renderMemberCard(
            {
              id: memberId,
              firstName,
              lastName,
              gender: isPrimaryFemale ? 'F' : 'M',
              photoUrl,
              occupation,
              birthDate,
            },
            -CARD_W / 2
          )
        )}
      </g>
    </g>
  );
};

export default TreeNode;

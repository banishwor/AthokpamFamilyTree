import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getDirectPhotoUrl } from '../utils';
import { useTheme } from '../context/ThemeContext';

const isSafariOrIOS = typeof navigator !== 'undefined' && (
  /Apple/.test(navigator.vendor) || 
  /iPhone|iPad|iPod/.test(navigator.userAgent) || 
  (navigator.maxTouchPoints > 1 && navigator.userAgent.includes('Macintosh'))
);

interface TreeNodeProps {
  nodeDatum: any;
  toggleNode: () => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ nodeDatum, toggleNode }) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Basic fields from primary datum
  const memberId = nodeDatum.id || nodeDatum.attributes?.id;
  const firstName = nodeDatum.firstName || nodeDatum.name || 'Unknown';
  const lastName = nodeDatum.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const gender = nodeDatum.gender || nodeDatum.attributes?.gender || 'M';
  const photoUrl = nodeDatum.photoUrl || nodeDatum.attributes?.photoUrl;
  const occupation = nodeDatum.occupation || nodeDatum.attributes?.occupation || '';
  const birthDate = nodeDatum.attributes?.birthDate || '';

  const isPrimaryFemale = gender && (String(gender).toUpperCase().startsWith('F') || String(gender).toLowerCase() === 'female' || gender === 'F');

  const spouseObj = nodeDatum.spouse;
  const hasSpouse = !!spouseObj;

  // Find husband and wife to make sure Wife is always on the right side of the husband!
  let husband: any = null;
  let wife: any = null;

  if (hasSpouse) {
    if (isPrimaryFemale) {
      wife = {
        id: memberId,
        firstName,
        lastName,
        gender: 'F',
        photoUrl,
        occupation,
        birthDate,
      };
      husband = {
        id: spouseObj.id,
        firstName: spouseObj.firstName,
        lastName: spouseObj.lastName,
        gender: 'M',
        photoUrl: spouseObj.photoUrl,
        occupation: spouseObj.occupation,
        birthDate: spouseObj.birthDate,
      };
    } else {
      husband = {
        id: memberId,
        firstName,
        lastName,
        gender: 'M',
        photoUrl,
        occupation,
        birthDate,
      };
      wife = {
        id: spouseObj.id,
        firstName: spouseObj.firstName,
        lastName: spouseObj.lastName,
        gender: 'F',
        photoUrl: spouseObj.photoUrl,
        occupation: spouseObj.occupation,
        birthDate: spouseObj.birthDate,
      };
    }
  }

  // Adjust container width based on whether there is a spouse
  // Generous padding buffers added to prevent iOS/Safari from clipping on scale hover transitions
  const width = hasSpouse ? 500 : 265;
  const x = hasSpouse ? -250 : -132.5;
  const height = 115;
  const y = 8;

  const getInitials = (fName: string, lName: string) => {
    const f = fName ? fName.charAt(0).toUpperCase() : '';
    const l = lName ? lName.charAt(0).toUpperCase() : '';
    return `${f}${l}` || 'M';
  };

  const renderMemberCard = (m: any) => {
    const isFemaleCard = m.gender === 'F';
    const mFullName = `${m.firstName} ${m.lastName || ''}`.trim();

    // Disable link if it is a virtual root or invalid ID
    const hasValidId = m.id && m.id !== 'undefined' && !String(m.id).startsWith('virtual');

    // To resolve Safari/iOS rendering bug in SVG foreignObject, disable transitions and transforms
    const transitionClass = isSafariOrIOS ? '' : 'transition-all duration-300 will-change-transform';
    const hoverScaleClass = isSafariOrIOS || !hasValidId ? '' : 'hover:scale-105 hover:-translate-y-0.5';
    const hoverBorderClass = isSafariOrIOS
      ? ''
      : (isFemaleCard
          ? 'hover:border-pink-500 hover:shadow-[0_10px_20px_-3px_rgba(244,63,94,0.35),_0_4px_6px_-2px_rgba(244,63,94,0.2)]'
          : 'hover:border-amber-500 hover:shadow-[0_10px_20px_-3px_rgba(197,160,89,0.35),_0_4px_6px_-2px_rgba(197,160,89,0.2)]');

    // Theme values computed in JS to bypass Safari's dark mode foreignObject boundary selector inheritance bugs
    const cardBgClass = isDark ? 'bg-zinc-850' : 'bg-white';
    
    const cardBorderClass = isFemaleCard
      ? (isDark ? 'border-pink-950/45' : 'border-pink-200')
      : (isDark ? 'border-zinc-800/80' : 'border-amber-200/80');

    const avatarBgBorderClass = isDark
      ? 'bg-zinc-800 border-zinc-700'
      : 'bg-gray-50 border-gray-100';

    const nameTextClass = isDark
      ? 'text-zinc-150 group-hover:text-amber-400'
      : 'text-gray-900 group-hover:text-amber-600';

    const occupationTextClass = isDark ? 'text-zinc-500' : 'text-gray-400';
    const birthTextClass = isDark ? 'text-zinc-600' : 'text-zinc-400';

    return (
      <div
        id={`tree-card-member-${m.id}`}
        onClick={(e) => {
          e.stopPropagation();
          if (hasValidId) {
            navigate(`/member/${m.id}`);
          }
        }}
        className={`w-[214px] h-[82px] p-2 border rounded-xl shadow-md flex items-center gap-2.5 text-left ${cardBgClass} ${cardBorderClass} ${transitionClass} ${
          hasValidId
            ? `cursor-pointer group ${hoverScaleClass}`
            : 'cursor-default'
        } ${hoverBorderClass}`}
      >
        {/* Node Avatar */}
        <div className={`${isSafariOrIOS ? '' : 'relative'} w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center border shadow-inner ${avatarBgBorderClass}`}>
          {m.photoUrl ? (
            <img
              src={getDirectPhotoUrl(m.photoUrl)}
              alt={mFullName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center font-bold text-xs text-white ${
                isFemaleCard
                  ? 'bg-gradient-to-tr from-pink-500 to-rose-400'
                  : 'bg-amber-600'
              }`}
            >
              {getInitials(m.firstName, m.lastName)}
            </div>
          )}
          {/* Tiny gender dot (disabled on Safari/iOS to prevent positioning bug inside foreignObject) */}
          {!isSafariOrIOS && (
            <div
              className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white ${
                isFemaleCard ? 'bg-pink-500' : 'bg-amber-650'
              }`}
            />
          )}
        </div>

        {/* Node Details */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className={`text-[11px] font-extrabold truncate transition-colors leading-tight ${nameTextClass}`}>
            {mFullName}
          </h4>
          {m.occupation ? (
            <p className={`text-[9px] truncate leading-none mt-1 ${occupationTextClass}`}>
              {m.occupation}
            </p>
          ) : null}
          {m.birthDate && (
            <p className={`text-[8px] font-mono leading-none mt-1 ${birthTextClass}`}>
              b. {m.birthDate}
            </p>
          )}
          {hasValidId && (
            <span className="text-[8px] inline-block font-black text-[#c5a059] mt-1 hover:underline">
              View Profile →
            </span>
          )}
        </div>
      </div>
    );
  };

  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;

  return (
    <g>
      {/* Circle to trigger native node toggle, positioned in the exact horizontal center */}
      <circle
        r="11"
        fill={hasSpouse ? '#c5a059' : (isPrimaryFemale ? '#f43f5e' : '#c5a059')}
        className={`cursor-pointer hover:scale-120 transition-transform shadow-md stroke-2 ${isDark ? 'stroke-zinc-950' : 'stroke-white'}`}
        onClick={toggleNode}
      />
      {hasChildren && (
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

      {/* HTML Card Container inside SVG using foreignObject */}
      <foreignObject
        width={width}
        height={height}
        x={x}
        y={y}
        style={{ overflow: 'visible' }}
      >
        {hasSpouse ? (
          // Custom side-by-side spouse rendering wrapped in standard XHTML xmlns namespace for perfect Safari compliance
          <div xmlns="http://www.w3.org/1999/xhtml" className="flex items-center justify-center gap-1.5 w-full h-full py-2">
            {/* Husband Card (Left Side) */}
            {husband && renderMemberCard(husband)}

            {/* Elegant Partnership Link Element with Intersecting Heart */}
            <div
              className={`flex-shrink-0 flex items-center justify-center w-5.5 h-5.5 rounded-full border text-amber-500/90 -mx-1 shadow-sm cursor-pointer ${
                isSafariOrIOS
                  ? 'bg-amber-50 dark:bg-zinc-800 border-amber-500/20'
                  : 'bg-amber-500/10 border-amber-500/20 z-10 backdrop-blur-md animate-pulse hover:scale-120 duration-300 transition-transform'
              }`}
              title="Spousal union"
            >
              <Heart className="w-3 h-3 fill-amber-500 text-amber-500" />
            </div>

            {/* Wife Card (Right Side) */}
            {wife && renderMemberCard(wife)}
          </div>
        ) : (
          // Single Member Card rendering wrapped in standard XHTML xmlns namespace for perfect Safari compliance
          <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center py-2">
            {renderMemberCard({
              id: memberId,
              firstName,
              lastName,
              gender: isPrimaryFemale ? 'F' : 'M',
              photoUrl,
              occupation,
              birthDate,
            })}
          </div>
        )}
      </foreignObject>
    </g>
  );
};

export default TreeNode;

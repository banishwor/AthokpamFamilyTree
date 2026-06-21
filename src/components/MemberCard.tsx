import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Member } from '../types';
import { Calendar, Briefcase, ChevronRight, User } from 'lucide-react';
import { getDirectPhotoUrl } from '../utils';

interface MemberCardProps {
  member: Member;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const navigate = useNavigate();

  const getInitials = () => {
    const first = member.firstName?.charAt(0) || '';
    const last = member.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'M';
  };

  const getBirthAndDeath = () => {
    if (!member.birthDate) return 'Unknown Birth';
    const birthYear = new Date(member.birthDate).getFullYear();
    if (member.deathDate) {
      const deathYear = new Date(member.deathDate).getFullYear();
      return `${birthYear} - ${deathYear}`;
    }
    return `${birthYear} - Present`;
  };

  return (
    <div
      id={`member-card-${member.id}`}
      onClick={() => navigate(`/member/${member.id}`)}
      className="group cursor-pointer bg-white dark:bg-zinc-850 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/20 dark:hover:border-amber-400/20 transition-all duration-300 flex flex-col h-full"
    >
      {/* Photo Container */}
      <div className="relative aspect-[4/3] bg-amber-50/50 dark:bg-zinc-800/50 overflow-hidden flex items-center justify-center">
        {member.photoUrl ? (
          <img
            id={`member-img-${member.id}`}
            src={getDirectPhotoUrl(member.photoUrl)}
            alt={`${member.firstName} ${member.lastName}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            id={`member-avatar-fallback-${member.id}`}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-inner select-none ${
              member.gender === 'F'
                ? 'bg-gradient-to-tr from-pink-500 to-rose-400'
                : 'bg-gradient-to-tr from-amber-600 to-orange-400'
            }`}
          >
            {getInitials()}
          </div>
        )}

        {/* Gender Badge */}
        <span
          id={`member-gender-badge-${member.id}`}
          className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-sm ${
            member.gender === 'F'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
          }`}
        >
          {member.gender === 'F' ? 'Female' : 'Male'}
        </span>
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 id={`member-name-${member.id}`} className="font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-base flex items-center gap-1">
            {member.firstName} {member.middleName ? `${member.middleName} ` : ''}{member.lastName}
          </h3>

          <div className="mt-3 space-y-2 text-xs text-gray-500 dark:text-zinc-400">
            {/* Timeline */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
              <span>{getBirthAndDeath()}</span>
            </div>

            {/* Occupation */}
            {member.occupation && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                <span className="truncate">{member.occupation}</span>
              </div>
            )}
          </div>
        </div>

        {/* View Profile Button bar */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
          <span>View Profile</span>
          <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default MemberCard;

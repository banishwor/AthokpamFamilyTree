import { Member } from '../types';
import { apiService } from '../services/api';

/** Format a stored date to YYYY-MM-DD for <input type="date"> using local
 *  components, preventing timezone offset day shifts. */
export function formatDateInput(dateStr?: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

export function fullName(m: Pick<Member, 'firstName' | 'middleName' | 'lastName'>): string {
  return [m.firstName, m.middleName, m.lastName].filter(Boolean).join(' ').trim();
}

/** A–Z ordering by displayed full name (case-insensitive). */
export const compareByFullName = (a: Member, b: Member): number =>
  fullName(a).localeCompare(fullName(b), undefined, { sensitivity: 'base' });

/** Return a copy of the list sorted A–Z by full name. */
/**
 * Family order for siblings in trees and charts: eldest first
 * (ascending birth date), so the eldest is always leftmost.
 * Members without a birth date go after dated siblings; ties and
 * undated pairs fall back to A–Z by full name. Mirrors the ordering
 * the interactive tree has always used.
 */
export function compareByBirthThenName(a: Member, b: Member): number {
  const dateA = a.birthDate ? new Date(a.birthDate).getTime() : NaN;
  const dateB = b.birthDate ? new Date(b.birthDate).getTime() : NaN;
  const hasA = !Number.isNaN(dateA);
  const hasB = !Number.isNaN(dateB);
  if (hasA && hasB) return dateA - dateB;
  if (hasA) return -1;
  if (hasB) return 1;
  return compareByFullName(a, b);
}

export function sortedByName<T extends Member>(list: T[]): T[] {
  return [...list].sort(compareByFullName);
}

/** Profile completeness across 8 signals, used by rings and queues. */
export function memberCompleteness(m: Member): { percent: number; missing: string[] } {
  const checks: Array<[boolean, string]> = [
    [!!m.photoUrl, 'photo'],
    [!!m.birthDate, 'birth date'],
    [!!m.fatherId, 'father'],
    [!!m.motherId, 'mother'],
    [!!m.occupation, 'occupation'],
    [!!m.education, 'education'],
    [!!m.address, 'address'],
    [!!m.bio, 'bio'],
  ];
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label);
  const percent = Math.round(((checks.length - missing.length) / checks.length) * 100);
  return { percent, missing };
}

/**
 * Add or update a member and keep the spouse link reciprocal,
 * mirroring the desktop admin form's behaviour exactly:
 * detach the previous spouse if they pointed back, detach the new
 * spouse's previous partner, then bind the new spouse to this member.
 * Returns the saved member's id. Throws on API failure.
 */
export async function saveMemberWithSpouseLink(
  allMembers: Member[],
  editing: Member | null,
  payload: Partial<Member>,
  spouseId: string
): Promise<string> {
  let savedMemberId = '';

  if (editing) {
    const response = await apiService.updateMember(editing.id, payload);
    if (!response.success) {
      throw new Error(response.message || 'Operation failed on remote spreadsheet server.');
    }
    savedMemberId = String(editing.id);
  } else {
    const response = await apiService.addMember(payload);
    if (!response.success || !response.id) {
      throw new Error(response.message || 'Operation failed on remote spreadsheet server.');
    }
    savedMemberId = String(response.id);
  }

  const oldSpouseId = editing ? String(editing.spouseId || '') : '';
  const newSpouseId = spouseId || '';

  if (newSpouseId !== oldSpouseId) {
    if (oldSpouseId) {
      const oldSpouseObj = allMembers.find((m) => String(m.id) === oldSpouseId);
      if (oldSpouseObj && String(oldSpouseObj.spouseId) === savedMemberId) {
        await apiService.updateMember(oldSpouseId, { spouseId: null });
      }
    }
    if (newSpouseId) {
      const newSpouseObj = allMembers.find((m) => String(m.id) === newSpouseId);
      if (newSpouseObj) {
        const theirSpouseId = newSpouseObj.spouseId ? String(newSpouseObj.spouseId) : '';
        if (theirSpouseId && theirSpouseId !== savedMemberId) {
          const theirSpouseObj = allMembers.find((m) => String(m.id) === theirSpouseId);
          if (theirSpouseObj && String(theirSpouseObj.spouseId) === newSpouseId) {
            await apiService.updateMember(theirSpouseId, { spouseId: null });
          }
        }
        await apiService.updateMember(newSpouseId, { spouseId: savedMemberId });
      }
    }
  }

  return savedMemberId;
}

import { Member } from '../types';
import { compareByBirthThenName } from './memberSave';

/**
 * One person in an ancestors chart: their parents (the chart grows
 * upward), plus their siblings when that generation's collateral
 * toggle is on.
 */
export interface AncestorNode {
  member: Member;
  father: AncestorNode | null;
  mother: AncestorNode | null;
  siblings: Member[];
}

/** Siblings = members sharing a recorded father or mother, eldest first. */
export function siblingsOf(member: Member, members: Member[]): Member[] {
  const seen = new Set<string>();
  return members
    .filter((m) => {
      if (m.id === member.id) return false;
      const sharesFather = !!member.fatherId && m.fatherId === member.fatherId;
      const sharesMother = !!member.motherId && m.motherId === member.motherId;
      if (!sharesFather && !sharesMother) return false;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    })
    .sort(compareByBirthThenName);
}

/**
 * Build the ancestor tree for `root`: parents up to `maxGenerations`
 * generations. A branch simply ends where no parent is recorded —
 * no placeholders are invented. `siblingGenerations` holds the
 * generation numbers (0 = the person, 1 = parents, 2 = grandparents…)
 * whose siblings should be attached as collaterals.
 */
export function buildAncestorTree(
  root: Member,
  members: Member[],
  maxGenerations: number,
  siblingGenerations: ReadonlySet<number>
): AncestorNode {
  const byId = new Map(members.map((m) => [m.id, m]));

  const build = (member: Member, generation: number, path: Set<string>): AncestorNode => {
    const nextPath = new Set(path);
    nextPath.add(member.id);

    let father: AncestorNode | null = null;
    let mother: AncestorNode | null = null;
    if (generation < maxGenerations) {
      const f = member.fatherId ? byId.get(member.fatherId) : undefined;
      const mo = member.motherId ? byId.get(member.motherId) : undefined;
      if (f && !nextPath.has(f.id)) father = build(f, generation + 1, nextPath);
      if (mo && !nextPath.has(mo.id)) mother = build(mo, generation + 1, nextPath);
    }

    return {
      member,
      father,
      mother,
      siblings: siblingGenerations.has(generation) ? siblingsOf(member, members) : [],
    };
  };

  return build(root, 0, new Set());
}

export interface AncestorStats {
  /** Ancestors above the root (root excluded). */
  ancestors: number;
  /** Collateral siblings attached anywhere in the chart. */
  siblings: number;
  /** Deepest generation reached (root = 0). */
  depth: number;
}

export function ancestorStats(node: AncestorNode): AncestorStats {
  let ancestors = 0;
  let siblings = node.siblings.length;
  let depth = 0;
  const walk = (n: AncestorNode, gen: number, isRoot: boolean) => {
    if (!isRoot) ancestors += 1;
    siblings += isRoot ? 0 : n.siblings.length;
    depth = Math.max(depth, gen);
    if (n.father) walk(n.father, gen + 1, false);
    if (n.mother) walk(n.mother, gen + 1, false);
  };
  walk(node, 0, true);
  return { ancestors, siblings, depth };
}

/** Everyone drawn in the chart (for photo embedding). */
export function collectAncestorPeople(node: AncestorNode): Member[] {
  const out: Member[] = [];
  const walk = (n: AncestorNode) => {
    out.push(n.member, ...n.siblings);
    if (n.father) walk(n.father);
    if (n.mother) walk(n.mother);
  };
  walk(node);
  return out;
}

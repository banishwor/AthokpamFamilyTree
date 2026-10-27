import { Member } from '../types';
import { compareByBirthThenName } from './memberSave';

/** One person in a descendant chart, with their spouse (when shown) and their chart-children. */
export interface DescendantNode {
  member: Member;
  spouse: Member | null;
  children: DescendantNode[];
}

/** Find a member's spouse: their spouseId, or whoever points back at them. */
export function spouseOf(member: Member, members: Member[]): Member | null {
  if (member.spouseId) {
    const byId = members.find((m) => m.id === member.spouseId);
    if (byId) return byId;
  }
  return members.find((m) => m.spouseId === member.id) ?? null;
}

/** Children of a couple = anyone whose fatherId or motherId is either partner. */
export function childrenOfCouple(aId: string, bId: string | null, members: Member[]): Member[] {
  return members
    .filter(
      (m) =>
        m.fatherId === aId ||
        m.motherId === aId ||
        (bId !== null && (m.fatherId === bId || m.motherId === bId))
    )
    .sort(compareByBirthThenName);
}

/**
 * Build the descendant tree for `root`, up to `maxGenerations` of
 * descendants (the root is generation 0). Children hang off couples,
 * so a child linked only through the other parent still appears.
 * A path set guards against link cycles.
 */
export function buildDescendantTree(
  root: Member,
  members: Member[],
  maxGenerations: number,
  includeSpouses: boolean
): DescendantNode {
  const build = (member: Member, generation: number, path: Set<string>): DescendantNode => {
    const spouse = includeSpouses ? spouseOf(member, members) : null;
    const nextPath = new Set(path);
    nextPath.add(member.id);
    if (spouse) nextPath.add(spouse.id);

    let children: DescendantNode[] = [];
    if (generation < maxGenerations) {
      children = childrenOfCouple(member.id, spouse?.id ?? null, members)
        .filter((c) => !nextPath.has(c.id))
        .map((c) => build(c, generation + 1, nextPath));
    }
    return { member, spouse, children };
  };
  return build(root, 0, new Set());
}

/** Total people shown in the chart (descendants incl. spouses, excluding the root couple). */
export function countDescendants(node: DescendantNode): number {
  let n = 0;
  for (const child of node.children) {
    n += 1 + (child.spouse ? 1 : 0) + countDescendants(child);
  }
  return n;
}

/** Deepest generation reached (root = 0). */
export function treeDepth(node: DescendantNode): number {
  if (node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(treeDepth));
}

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Member } from '../types';

export function useTree() {
  const [treeData, setTreeData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all members directly to construct the best recursive tree representation client-side
      const members = await apiService.getMembers();

      if (!members || !Array.isArray(members) || members.length === 0) {
        setTreeData(null);
        return;
      }

      // Convert members list to a map for fast lookup
      const memberMap = new Map<string, Member>();
      members.forEach((m) => {
        if (m && m.id !== undefined && m.id !== null) {
          memberMap.set(String(m.id).trim(), m);
        }
      });

      // Keep track of placed IDs to prevent cycles or duplicates
      const placedIds = new Set<string>();

      // Normalize gender helper
      const isFemale = (m: Member) => {
        if (!m || !m.gender) return false;
        const g = String(m.gender).toUpperCase().trim();
        return g.startsWith('F') || g === 'FEMALE';
      };

      // Helper to find spouse
      const getSpouse = (member: Member): Member | null => {
        if (member.spouseId) {
          const sp = memberMap.get(String(member.spouseId).trim());
          if (sp) return sp;
        }
        // Bidirectional backup check
        for (const m of members) {
          if (m && m.spouseId && String(m.spouseId).trim() === String(member.id).trim()) {
            return m;
          }
        }
        return null;
      };

      // Helper to get children for a couple
      const getChildrenOf = (parent1Id: string, parent2Id?: string | null): Member[] => {
        const id1 = String(parent1Id).trim();
        const id2 = parent2Id ? String(parent2Id).trim() : null;

        return members.filter((m) => {
          if (!m) return false;
          const fId = m.fatherId ? String(m.fatherId).trim() : null;
          const mId = m.motherId ? String(m.motherId).trim() : null;

          return (
            (fId && (fId === id1 || (id2 && fId === id2))) ||
            (mId && (mId === id1 || (id2 && mId === id2)))
          );
        });
      };

      // Recursively build a node in the tree
      const buildNode = (member: Member): any => {
        const memberIdStr = String(member.id).trim();
        placedIds.add(memberIdStr);

        const spouse = getSpouse(member);
        if (spouse) {
          placedIds.add(String(spouse.id).trim());
        }

        // Build main attributes for primary member
        const attributes: any = {
          id: memberIdStr,
          gender: isFemale(member) ? 'F' : 'M',
        };
        if (member.occupation) attributes.occupation = member.occupation;
        if (member.birthDate) {
          try {
            const dateVal = new Date(member.birthDate);
            if (!isNaN(dateVal.getTime())) {
              attributes.birthDate = dateVal.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            } else {
              attributes.birthDate = String(member.birthDate).split('T')[0];
            }
          } catch {
            attributes.birthDate = String(member.birthDate);
          }
        }

        const node: any = {
          id: memberIdStr,
          name: `${member.firstName} ${member.lastName || ''}`.trim(),
          firstName: member.firstName,
          lastName: member.lastName || '',
          gender: isFemale(member) ? 'F' : 'M',
          photoUrl: member.photoUrl || undefined,
          attributes,
        };

        // Attach spouse if found
        if (spouse) {
          // Format spouse birth date
          let spouseBirth = spouse.birthDate;
          if (spouseBirth) {
            try {
              const d = new Date(spouseBirth);
              if (!isNaN(d.getTime())) {
                spouseBirth = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
              }
            } catch {
              // use as-is
            }
          }

          node.spouse = {
            id: String(spouse.id).trim(),
            firstName: spouse.firstName,
            lastName: spouse.lastName || '',
            gender: isFemale(spouse) ? 'F' : 'M',
            photoUrl: spouse.photoUrl || undefined,
            occupation: spouse.occupation || undefined,
            birthDate: spouseBirth || undefined,
          };
        }

        // Recursively find and attach children
        const childrenList = getChildrenOf(member.id, spouse?.id);
        
        // Sort children list so that older siblings appear on the left (first in array / ascending birth date order)
        const sortedChildrenList = [...childrenList].sort((a, b) => {
          const dateA = a.birthDate ? new Date(a.birthDate).getTime() : NaN;
          const dateB = b.birthDate ? new Date(b.birthDate).getTime() : NaN;
          const hasA = !isNaN(dateA);
          const hasB = !isNaN(dateB);

          if (hasA && hasB) {
            return dateA - dateB; // Oldest has smaller timestamp, so it comes first (index 0)
          }
          if (hasA) return -1;
          if (hasB) return 1;
          // Fallback to name or ID comparison
          return String(a.firstName + (a.lastName || '')).localeCompare(String(b.firstName + (b.lastName || '')));
        });

        const childrenNodes: any[] = [];

        sortedChildrenList.forEach((child) => {
          const childIdStr = String(child.id).trim();
          if (!placedIds.has(childIdStr)) {
            childrenNodes.push(buildNode(child));
          }
        });

        if (childrenNodes.length > 0) {
          node.children = childrenNodes;
        }

        return node;
      };

      // Find all roots (orphans that are not placed as spouses of children)
      const potentialRoots = members.filter((m) => {
        if (!m) return false;
        
        // Does this member have parents that exist in the system?
        const hasFather = m.fatherId && memberMap.has(String(m.fatherId).trim());
        const hasMother = m.motherId && memberMap.has(String(m.motherId).trim());
        const hasParents = hasFather || hasMother;
        if (hasParents) return false;

        // Is this member married to someone who DOES have parents in the system?
        const spouse = getSpouse(m);
        if (spouse) {
          const spouseHasFather = spouse.fatherId && memberMap.has(String(spouse.fatherId).trim());
          const spouseHasMother = spouse.motherId && memberMap.has(String(spouse.motherId).trim());
          if (spouseHasFather || spouseHasMother) {
            return false; // Their spouse has parents, so their spouse is the primary child node. This member is just a spouse.
          }
        }

        return true;
      });

      if (potentialRoots.length === 0) {
        // Fallback in case of cycle or no clear root
        const fallbackRoot = members[0];
        setTreeData(buildNode(fallbackRoot));
        return;
      }

      // Prioritize primary male patriarchs (e.g. traditional genealogy tree)
      const maleRoots = potentialRoots.filter((m) => !isFemale(m));
      const primaryRoot = maleRoots.length > 0 ? maleRoots[0] : potentialRoots[0];

      const primaryLineageTree = buildNode(primaryRoot);

      // Collect any remaining root ancestor nodes that haven't been placed in the tree
      const remainingRoots = potentialRoots.filter(
        (r) => String(r.id).trim() !== String(primaryRoot.id).trim() && !placedIds.has(String(r.id).trim())
      );

      if (remainingRoots.length > 0) {
        // If we have multiple disconnected branches, wrap them under a beautiful main root
        const rootChildren = [primaryLineageTree];
        remainingRoots.forEach((r) => {
          const rIdStr = String(r.id).trim();
          if (!placedIds.has(rIdStr)) {
            rootChildren.push(buildNode(r));
          }
        });

        setTreeData({
          id: 'virtual-ancestors',
          name: 'Athokpam Family Lineage',
          firstName: 'Athokpam',
          lastName: 'Lineage',
          gender: 'M',
          attributes: {
            occupation: 'Heritage Branches',
          },
          children: rootChildren,
        });
      } else {
        setTreeData(primaryLineageTree);
      }
    } catch (err: any) {
      console.error('Error generating client family tree data:', err);
      setError(err.message || 'Failed to load family tree.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return {
    treeData,
    loading,
    error,
    refresh: fetchTree,
  };
}
export default useTree;

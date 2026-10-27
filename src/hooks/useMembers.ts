import { useState, useEffect, useCallback } from 'react';
import { Member } from '../types';
import { apiService, peekMembersCache, subscribeMembers } from '../services/api';

/**
 * Shared member-list hook. The list comes from the app-wide cache in
 * services/api.ts: if a cached copy exists (even from a previous page),
 * it renders instantly with no spinner and no network call, then quietly
 * revalidates in the background. `refresh()` forces a network fetch.
 */
export function useMembers() {
  const [members, setMembers] = useState<Member[]>(() => peekMembersCache() ?? []);
  const [loading, setLoading] = useState<boolean>(() => peekMembersCache() === null);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (force = false) => {
    // Only show the spinner when there is nothing to display yet.
    if (peekMembersCache() === null) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getMembers(force ? { force: true } : undefined);
      if (Array.isArray(data)) {
        setMembers(data);
      } else {
        setMembers([]);
        console.warn('API getMembers response is not an array:', data);
      }
    } catch (err: any) {
      console.error('Error fetching members:', err);
      // Keep showing cached data if we have any; only surface the error
      // when the screen would otherwise be empty.
      if (peekMembersCache() === null) {
        setError(err.message || 'Failed to fetch family members.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    // Background revalidations and write-invalidations push updates here.
    const unsubscribe = subscribeMembers((fresh) => {
      setMembers(fresh);
      setError(null);
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchMembers]);

  const refresh = useCallback(() => fetchMembers(true), [fetchMembers]);

  return {
    members,
    loading,
    error,
    refresh,
    setMembers,
  };
}
export default useMembers;

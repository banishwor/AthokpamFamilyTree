import { useState, useEffect, useCallback } from 'react';
import { Member } from '../types';
import { apiService } from '../services/api';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getMembers();
      // Ensure data is array
      if (Array.isArray(data)) {
        setMembers(data);
      } else {
        setMembers([]);
        console.warn('API getMembers response is not an array:', data);
      }
    } catch (err: any) {
      console.error('Error fetching members:', err);
      setError(err.message || 'Failed to fetch family members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refresh: fetchMembers,
    setMembers
  };
}
export default useMembers;

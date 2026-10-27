import { Member } from '../types';

const BASE_URL = 'https://script.google.com/macros/s/AKfycbzBVoD591uVO_31PT1re7QEM-Rlnw0fYvCGFh5DohRLrgHkBfRiRs3kPJtGBDg53nj3/exec';

// A helper for API calls
async function callApi<T>(params: Record<string, string>, body?: any): Promise<T> {
  const url = new URL(BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const options: RequestInit = {
    method: body ? 'POST' : 'GET',
    mode: 'cors',
    credentials: 'omit',
  };

  if (body) {
    // Note: Google Apps Script can sometimes have pre-flight issues with Application/JSON on redirect
    // So sending as plain text or standard POST avoids CORS issues while the server still parses the payload
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
    options.headers = {
      'Content-Type': 'text/plain;charset=utf-8', 
    };
  }

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.success === false) {
      throw new Error(data.message || 'API request failed');
    }
    return data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}


/* ------------------------------------------------------------------ */
/* Member-list cache                                                    */
/* The Apps Script backend takes seconds per call and the member list  */
/* is needed by almost every page. Fetch it once, share it everywhere: */
/*  - in-memory + sessionStorage (survives reloads within the tab)     */
/*  - 5-minute freshness window; stale data is served instantly while  */
/*    a background revalidation refreshes it (stale-while-revalidate)  */
/*  - concurrent callers share a single in-flight request              */
/*  - every write (add/update/delete/photo) invalidates the cache      */
/* ------------------------------------------------------------------ */

const MEMBERS_TTL_MS = 5 * 60 * 1000;
const MEMBERS_SS_KEY = 'aft_members_cache_v1';
const ANCESTORS_SS_PREFIX = 'aft_ancestors_cache_v1:';

interface CacheEntry<T> {
  ts: number;
  data: T;
}

let membersEntry: CacheEntry<Member[]> | null = null;
let membersInflight: Promise<Member[]> | null = null;
const membersListeners = new Set<(members: Member[]) => void>();

function ssGet<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.ts === 'number' && 'data' in parsed) return parsed as CacheEntry<T>;
  } catch {
    /* storage unavailable — ignore */
  }
  return null;
}

function ssSet<T>(key: string, entry: CacheEntry<T>): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    /* quota / private mode — ignore */
  }
}

function ssDel(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function setMembersCache(data: Member[]): void {
  membersEntry = { ts: Date.now(), data };
  ssSet(MEMBERS_SS_KEY, membersEntry);
  membersListeners.forEach((fn) => {
    try {
      fn(data);
    } catch {
      /* listener errors must not break the fetch */
    }
  });
}

/** Synchronous peek at the cached member list (fresh or stale), or null. */
export function peekMembersCache(): Member[] | null {
  if (membersEntry) return membersEntry.data;
  const stored = ssGet<Member[]>(MEMBERS_SS_KEY);
  if (stored) {
    membersEntry = stored;
    return stored.data;
  }
  return null;
}

function membersCacheAge(): number | null {
  const entry = membersEntry || ssGet<Member[]>(MEMBERS_SS_KEY);
  if (!entry) return null;
  if (!membersEntry) membersEntry = entry;
  return Date.now() - entry.ts;
}

/** Subscribe to member-list updates (background revalidation, writes). */
export function subscribeMembers(fn: (members: Member[]) => void): () => void {
  membersListeners.add(fn);
  return () => {
    membersListeners.delete(fn);
  };
}

/** Drop all cached read data. Called automatically after every write. */
export function invalidateReadCaches(): void {
  membersEntry = null;
  ssDel(MEMBERS_SS_KEY);
  ancestorsEntries.clear();
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(ANCESTORS_SS_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => ssDel(k));
  } catch {
    /* ignore */
  }
}

async function fetchMembersFromNetwork(): Promise<Member[]> {
  if (membersInflight) return membersInflight;
  membersInflight = (async () => {
    const res = await callApi<any>({ action: 'members' });
    const data = res && typeof res === 'object' && 'data' in res ? res.data : res;
    const list = Array.isArray(data) ? (data as Member[]) : [];
    setMembersCache(list);
    return list;
  })();
  try {
    return await membersInflight;
  } finally {
    membersInflight = null;
  }
}

/**
 * The one member-list loader for the whole app.
 * Fresh cache -> no network. Stale cache -> served instantly and
 * revalidated in the background (subscribers get the update).
 * No cache -> one shared network fetch. `force` always fetches.
 */
export async function loadMembers(options?: { force?: boolean }): Promise<Member[]> {
  const cached = peekMembersCache();
  const age = membersCacheAge();
  if (!options?.force && cached && age !== null) {
    if (age < MEMBERS_TTL_MS) return cached;
    // Stale: return now, refresh behind the scenes.
    fetchMembersFromNetwork().catch(() => {
      /* keep serving stale on failure */
    });
    return cached;
  }
  return fetchMembersFromNetwork();
}

/* Ancestors are per-member; cache them the same way (same TTL). */
const ancestorsEntries = new Map<string, CacheEntry<{ success: boolean; data: any[] }>>();
const ancestorsInflight = new Map<string, Promise<{ success: boolean; data: any[] }>>();

async function loadAncestors(id: string): Promise<{ success: boolean; data: any[] }> {
  const key = ANCESTORS_SS_PREFIX + id;
  let entry = ancestorsEntries.get(id) || null;
  if (!entry) {
    entry = ssGet<{ success: boolean; data: any[] }>(key);
    if (entry) ancestorsEntries.set(id, entry);
  }
  if (entry && Date.now() - entry.ts < MEMBERS_TTL_MS) return entry.data;
  if (ancestorsInflight.has(id)) return ancestorsInflight.get(id)!;
  const promise = (async () => {
    const res = await callApi<any>({ action: 'ancestors', id });
    let out: { success: boolean; data: any[] };
    if (res && res.success) out = res;
    else if (Array.isArray(res)) out = { success: true, data: res };
    else if (res && Array.isArray(res.data)) out = { success: true, data: res.data };
    else out = { success: false, data: [] };
    const fresh: CacheEntry<{ success: boolean; data: any[] }> = { ts: Date.now(), data: out };
    ancestorsEntries.set(id, fresh);
    ssSet(key, fresh);
    return out;
  })();
  ancestorsInflight.set(id, promise);
  try {
    return await promise;
  } finally {
    ancestorsInflight.delete(id);
  }
}

export const apiService = {
  // 1. Get all members (shared cache — see loadMembers above)
  getMembers: async (options?: { force?: boolean }): Promise<Member[]> => {
    return loadMembers(options);
  },

  // 2. Get single member details
  getMember: async (id: string): Promise<Member> => {
    const res = await callApi<any>({ action: 'member', id });
    if (res && typeof res === 'object' && 'data' in res) {
      return res.data;
    }
    return res;
  },

  // 3. Get parents of a member
  getParents: async (id: string): Promise<Member[]> => {
    const res = await callApi<any>({ action: 'parents', id });
    if (res && typeof res === 'object' && 'data' in res) {
      return res.data;
    }
    return res;
  },

  // 4. Get children of a member
  getChildren: async (id: string): Promise<Member[]> => {
    const res = await callApi<any>({ action: 'children', id });
    if (res && typeof res === 'object' && 'data' in res) {
      return res.data;
    }
    return res;
  },

  // 5. Get tree structure (root node and descendants for react-d3-tree)
  getTree: async (): Promise<any> => {
    const res = await callApi<any>({ action: 'tree' });
    if (res && typeof res === 'object' && 'data' in res) {
      return res.data;
    }
    return res;
  },

  // 6. Login
  login: async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    return callApi<{ success: boolean; message?: string }>({}, {
      action: 'login',
      username,
      password,
    });
  },

  // 7. Add Member
  addMember: async (data: Partial<Member>): Promise<{ success: boolean; id?: string; message?: string }> => {
    const res = await callApi<{ success: boolean; id?: string; message?: string }>({}, {
      action: 'addMember',
      data,
    });
    invalidateReadCaches();
    return res;
  },

  // 8. Update Member
  updateMember: async (id: string, data: Partial<Member>): Promise<{ success: boolean; message?: string }> => {
    const res = await callApi<{ success: boolean; message?: string }>({}, {
      action: 'updateMember',
      id,
      data,
    });
    invalidateReadCaches();
    return res;
  },

  // 9. Delete Member
  deleteMember: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await callApi<{ success: boolean; message?: string }>({}, {
      action: 'deleteMember',
      id,
    });
    invalidateReadCaches();
    return res;
  },

  // 10. Upload Photo (Base64)
  uploadPhoto: async (base64: string, fileName: string): Promise<{ success: boolean; fileUrl?: string; photoUrl?: string; message?: string }> => {
    return callApi<{ success: boolean; fileUrl?: string; photoUrl?: string; message?: string }>({}, {
      action: 'uploadPhoto',
      fileName,
      base64,
    });
  },

  // 11. Update Member Photo url
  updateMemberPhoto: async (memberId: string, photoUrl: string): Promise<{ success: boolean; message?: string }> => {
    const res = await callApi<{ success: boolean; message?: string }>({}, {
      action: 'updateMemberPhoto',
      memberId,
      photoUrl,
    });
    invalidateReadCaches();
    return res;
  },

  // 12. Get Ancestors (timeline lineage) — per-id cache, same TTL
  getAncestors: async (id: string): Promise<{ success: boolean; data: any[] }> => {
    return loadAncestors(id);
  },

  // 13. Get Relationship details
  getRelationship: async (id1: string, id2: string): Promise<any> => {
    return callApi<any>({ action: 'relationship', id1, id2 });
  }
};

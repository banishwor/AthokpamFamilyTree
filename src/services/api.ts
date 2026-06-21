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

export const apiService = {
  // 1. Get all members
  getMembers: async (): Promise<Member[]> => {
    const res = await callApi<any>({ action: 'members' });
    if (res && typeof res === 'object' && 'data' in res) {
      return res.data;
    }
    return res;
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
    return callApi<{ success: boolean; id?: string; message?: string }>({}, {
      action: 'addMember',
      data,
    });
  },

  // 8. Update Member
  updateMember: async (id: string, data: Partial<Member>): Promise<{ success: boolean; message?: string }> => {
    return callApi<{ success: boolean; message?: string }>({}, {
      action: 'updateMember',
      id,
      data,
    });
  },

  // 9. Delete Member
  deleteMember: async (id: string): Promise<{ success: boolean; message?: string }> => {
    return callApi<{ success: boolean; message?: string }>({}, {
      action: 'deleteMember',
      id,
    });
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
    return callApi<{ success: boolean; message?: string }>({}, {
      action: 'updateMemberPhoto',
      memberId,
      photoUrl,
    });
  },

  // 12. Get Ancestors (timeline lineage)
  getAncestors: async (id: string): Promise<{ success: boolean; data: any[] }> => {
    const res = await callApi<any>({ action: 'ancestors', id });
    if (res && res.success) {
      return res;
    }
    // Fallback if data is returned directly or in a slightly different format
    if (Array.isArray(res)) {
      return { success: true, data: res };
    }
    if (res && Array.isArray(res.data)) {
      return { success: true, data: res.data };
    }
    return { success: false, data: [] };
  },

  // 13. Get Relationship details
  getRelationship: async (id1: string, id2: string): Promise<any> => {
    return callApi<any>({ action: 'relationship', id1, id2 });
  }
};

export interface Member {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string; // "M" | "F"
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
  birthDate?: string;
  deathDate?: string;
  occupation?: string;
  education?: string;
  address?: string;
  bio?: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilyTreeNode {
  name: string;
  id?: string;
  gender?: string;
  photoUrl?: string;
  attributes?: {
    occupation?: string;
    birthDate?: string;
    spouse?: string;
    [key: string]: any;
  };
  children?: FamilyTreeNode[];
}

export interface Statistics {
  totalMembers: number;
  familyBranches: number;
  photosUploaded: number;
}

export interface Ancestor {
  id: string;
  name: string;
  level: number;
  relationship: string;
  photoUrl?: string;
}

export interface RelationshipResult {
  success: boolean;
  relationship?: string;
  path?: string[] | { id: string; name: string }[];
  text?: string;
  data?: {
    relationship?: string;
    path?: string[] | { id: string; name: string }[];
    text?: string;
  };
}

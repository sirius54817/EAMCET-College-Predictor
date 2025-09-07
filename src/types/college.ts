// College data types based on the JSON structure
export interface College {
  INSTCODE: string;
  "NAME OF THE INSTITUTION": string;
  PLACE: string;
  COED: string;
  ESTD: number;
  "OC_BO YS": number | null;
  "OC_GIR LS": number | null;
  "SC_BO YS": number | null;
  "SC_GIR LS": number | null;
  "ST_BOY S": number | null;
  "ST_GIR LS": number | null;
  "BCA_B OYS": number | null;
  "BCA_GI RLS": number | null;
  "BCB_B OYS": number | null;
  "BCB_GI RLS": number | null;
  "BCC_B OYS": number | null;
  "BCC_GI RLS": number | null;
  "BCD_B OYS": number | null;
  "BCD_GI RLS": number | null;
  "BCE_B OYS": number | null;
  "BCE_GI RLS": number | null;
  "OC_EWS_B OYS": number | null;
  "OC_EWS_G IRLS": number | null;
  "COLLFE E": number | null;
}

export type Category = 'OC' | 'SC' | 'ST' | 'BCA' | 'BCB' | 'BCC' | 'BCD' | 'BCE' | 'OC_EWS';
export type Gender = 'BOYS' | 'GIRLS';

export interface SearchFilters {
  rank: number;
  category: Category;
  gender: Gender;
  maxFee?: number;
  coed?: 'COED' | 'BOYS' | 'GIRLS' | 'ALL';
}

export interface CollegeResult {
  college: College;
  cutoffRank: number | null;
  eligible: boolean;
  branch?: string;
}
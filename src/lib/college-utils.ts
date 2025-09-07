import { College, Category, Gender, SearchFilters, CollegeResult } from '@/types/college';

// Function to get the appropriate cutoff field based on category and gender
export function getCutoffField(category: Category, gender: Gender): keyof College {
  const fieldMap: Record<Category, Record<Gender, keyof College>> = {
    OC: {
      BOYS: 'OC_BO YS',
      GIRLS: 'OC_GIR LS'
    },
    SC: {
      BOYS: 'SC_BO YS',
      GIRLS: 'SC_GIR LS'
    },
    ST: {
      BOYS: 'ST_BOY S',
      GIRLS: 'ST_GIR LS'
    },
    BCA: {
      BOYS: 'BCA_B OYS',
      GIRLS: 'BCA_GI RLS'
    },
    BCB: {
      BOYS: 'BCB_B OYS',
      GIRLS: 'BCB_GI RLS'
    },
    BCC: {
      BOYS: 'BCC_B OYS',
      GIRLS: 'BCC_GI RLS'
    },
    BCD: {
      BOYS: 'BCD_B OYS',
      GIRLS: 'BCD_GI RLS'
    },
    BCE: {
      BOYS: 'BCE_B OYS',
      GIRLS: 'BCE_GI RLS'
    },
    OC_EWS: {
      BOYS: 'OC_EWS_B OYS',
      GIRLS: 'OC_EWS_G IRLS'
    }
  };

  return fieldMap[category][gender];
}

// Function to check if a student is eligible for a college based on their rank
export function isEligible(college: College, rank: number, category: Category, gender: Gender): boolean {
  const cutoffField = getCutoffField(category, gender);
  const cutoffRank = college[cutoffField] as number | null;
  
  if (cutoffRank === null) return false;
  return rank <= cutoffRank;
}

// Function to get the cutoff rank for a specific college, category, and gender
export function getCutoffRank(college: College, category: Category, gender: Gender): number | null {
  const cutoffField = getCutoffField(category, gender);
  return college[cutoffField] as number | null;
}

// Function to search colleges based on filters
export function searchColleges(colleges: College[], filters: SearchFilters): CollegeResult[] {
  const results: CollegeResult[] = [];
  
  // Group colleges by institution
  const collegeGroups = colleges.reduce((groups, college) => {
    const key = `${college.INSTCODE}-${college["NAME OF THE INSTITUTION"]}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(college);
    return groups;
  }, {} as Record<string, College[]>);

  // Process each college group
  Object.values(collegeGroups).forEach(collegeGroup => {
    // Find the best cutoff (lowest rank number) for this college
    let bestCutoff: number | null = null;
    let eligibleCollege: College | null = null;

    collegeGroup.forEach(college => {
      // Apply filters
      if (filters.maxFee && college["COLLFE E"] && college["COLLFE E"] > filters.maxFee) return;
      if (filters.coed && filters.coed !== 'ALL' && college.COED !== filters.coed) return;

      const cutoffRank = getCutoffRank(college, filters.category, filters.gender);
      if (cutoffRank !== null) {
        if (bestCutoff === null || cutoffRank < bestCutoff) {
          bestCutoff = cutoffRank;
          eligibleCollege = college;
        }
      }
    });

    if (eligibleCollege && bestCutoff !== null) {
      const eligible = filters.rank <= bestCutoff;
      results.push({
        college: eligibleCollege,
        cutoffRank: bestCutoff,
        eligible
      });
    }
  });

  // Sort results: eligible colleges first, then by cutoff rank
  return results.sort((a, b) => {
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    
    if (a.cutoffRank && b.cutoffRank) {
      return a.cutoffRank - b.cutoffRank;
    }
    return 0;
  });
}

// Function to get unique places from colleges data
export function getUniquePlaces(colleges: College[]): string[] {
  const places = [...new Set(colleges.map(college => college.PLACE))];
  return places.sort();
}

// Function to get fee range from colleges data
export function getFeeRange(colleges: College[]): { min: number; max: number } {
  const fees = colleges.map(college => college["COLLFE E"]).filter(fee => fee !== null && fee > 0) as number[];
  
  if (fees.length === 0) {
    return { min: 0, max: 0 };
  }
  
  return {
    min: Math.min(...fees),
    max: Math.max(...fees)
  };
}
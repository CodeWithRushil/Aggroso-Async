import { UnverifiableClaim } from '../types/index.js';

interface ClaimPattern {
  regex: RegExp;
  category: 'medical' | 'superlative' | 'financial' | 'physical_absolutist';
  reason: string;
  recommendation: string;
}

const CLAIM_PATTERNS: ClaimPattern[] = [
  // Medical & Health Claims
  {
    regex: /\b(100%\s*(cure|cured|healing)|miracle\s*(cure|remedy|treatment)|cures?\s*(cancer|arthritis|diabetes|alzheimer|depression|baldness|all\s*diseases?))\b/i,
    category: 'medical',
    reason: 'Unsubstantiated medical or therapeutic cure claim prohibited by marketplace policy §4.1.',
    recommendation: 'Remove claims of curing or treating medical conditions. Replace with descriptive statements about ingredients, comfort, or intended wellness support.'
  },
  {
    regex: /\b(lose\s*\d+\s*(lbs|pounds|kg)\s*in\s*\d+\s*(days|hours)|instant\s*weight\s*loss|burns\s*fat\s*overnight)\b/i,
    category: 'medical',
    reason: 'Unrealistic or dangerous physiological claim regarding rapid weight loss or metabolism.',
    recommendation: 'Describe product nutritional attributes or materials without promising specific biological outcomes.'
  },

  // Absolute Superlatives
  {
    regex: /\b(best\s*(in\s*the\s*(world|universe|market|country)|ever\s*made|on\s*earth)|undisputed\s*(#1|number\s*one)|greatest\s*of\s*all\s*time|unbeatable\s*quality)\b/i,
    category: 'superlative',
    reason: 'Unverifiable superlative claim lacking independent third-party certification or verifiable testing data.',
    recommendation: 'Replace subjective superlatives with objective specifications, verified materials, or verified customer satisfaction metrics.'
  },

  // Financial & Profit Guarantees
  {
    regex: /\b(guaranteed\s*(\d+%\s*)?(profit|income|returns?|millionaire|wealth)|(\d+%\s*|1000%\s*)roi|risk-free\s*investment|passive\s*income\s*machine)\b/i,
    category: 'financial',
    reason: 'Deceptive financial guarantee or speculative wealth claim violating financial transparency policies.',
    recommendation: 'Frame software, tools, or courses around their educational or analytical utility without guaranteeing monetary return.'
  },

  // Physical Absolutist Claims
  {
    regex: /\b(infinite\s*(battery|power|life)|lasts?\s*forever|indestructible|100%\s*bulletproof\s*glass|never\s*(breaks?|fails?|dies?))\b/i,
    category: 'physical_absolutist',
    reason: 'Physically impossible or unverifiable absolutist durability claim.',
    recommendation: 'Specify tested drop height, IP water/dust resistance rating, or manufacturer laboratory battery benchmark in hours.'
  }
];

export class ClaimDetector {
  /**
   * Scans text fields to detect unverifiable, superlative, medical, or financial claims
   */
  public detectClaims(field: string, text: string): UnverifiableClaim[] {
    if (!text || text.trim().length === 0) return [];

    const detected: UnverifiableClaim[] = [];

    for (const pattern of CLAIM_PATTERNS) {
      const match = text.match(pattern.regex);
      if (match) {
        detected.push({
          claim: match[0],
          field,
          reason: pattern.reason,
          recommendation: pattern.recommendation
        });
      }
    }

    return detected;
  }

  /**
   * Scans all fields in a listing for unverifiable claims
   */
  public scanListing(listing: {
    title?: string;
    description?: string;
    attributes?: Record<string, string>;
  }): UnverifiableClaim[] {
    const claims: UnverifiableClaim[] = [];

    if (listing.title) {
      claims.push(...this.detectClaims('title', listing.title));
    }

    if (listing.description) {
      claims.push(...this.detectClaims('description', listing.description));
    }

    if (listing.attributes) {
      for (const [key, value] of Object.entries(listing.attributes)) {
        claims.push(...this.detectClaims(`attributes.${key}`, `${key}: ${value}`));
      }
    }

    return claims;
  }
}

export const claimDetector = new ClaimDetector();

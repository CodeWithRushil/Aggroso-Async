import { PolicySection } from '../types/index.js';
import { MARKETPLACE_POLICIES } from './marketplacePolicy.js';
import { BRAND_CONTENT_GUIDES } from './brandGuide.js';

export const ALL_POLICIES: PolicySection[] = [
  ...MARKETPLACE_POLICIES,
  ...BRAND_CONTENT_GUIDES
];

export interface PolicyMatch {
  policy: PolicySection;
  score: number;
  matchedKeywords: string[];
}

export class PolicyEngine {
  private policies: PolicySection[];

  constructor() {
    this.policies = ALL_POLICIES;
  }

  public getAllPolicies(): PolicySection[] {
    return this.policies;
  }

  public getPolicyById(id: string): PolicySection | undefined {
    return this.policies.find(p => p.id.toLowerCase() === id.toLowerCase());
  }

  /**
   * Retrieves relevant policies based on listing content using semantic keyword relevance scoring
   */
  public retrieveRelevantPolicies(listingText: string, minScore = 1): PolicyMatch[] {
    const textLower = listingText.toLowerCase();
    const results: PolicyMatch[] = [];

    for (const policy of this.policies) {
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const kw of policy.keywords) {
        const kwLower = kw.toLowerCase();
        if (textLower.includes(kwLower)) {
          // Weight longer/specific keywords higher
          const weight = kwLower.split(' ').length > 1 ? 3 : 2;
          score += weight;
          matchedKeywords.push(kw);
        }
      }

      // Check title and summary keywords
      const titleWords = policy.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      for (const word of titleWords) {
        if (textLower.includes(word) && !matchedKeywords.includes(word)) {
          score += 1;
        }
      }

      if (score >= minScore) {
        results.push({
          policy,
          score,
          matchedKeywords
        });
      }
    }

    // Sort descending by score
    return results.sort((a, b) => b.score - a.score);
  }
}

export const defaultPolicyEngine = new PolicyEngine();

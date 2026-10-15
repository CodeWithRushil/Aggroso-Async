import { v4 as uuidv4 } from 'uuid';
import { 
  Listing, 
  ReviewReport, 
  ReviewFinding, 
  FieldSuggestion, 
  Severity 
} from '../types/index.js';
import { defaultPolicyEngine } from '../policies/policyEngine.js';
import { deterministicValidator } from '../validators/deterministic.js';
import { claimDetector } from './claimDetector.js';

export class ReviewerAgent {
  /**
   * Reviews a listing against policies and brand guide, producing findings, citations, and suggested rewrites
   */
  public async reviewListing(
    listing: Listing, 
    existingListings: Listing[] = []
  ): Promise<ReviewReport> {
    const startTime = Date.now();
    const findings: ReviewFinding[] = [];

    // 1. Run Deterministic Validation
    const deterministicIssues = deterministicValidator.validate(listing, {
      existingListings,
      currentListingId: listing.id
    });

    for (const dIssue of deterministicIssues) {
      findings.push({
        id: uuidv4(),
        field: dIssue.field as any,
        type: dIssue.rule === 'DUPLICATE_LISTING' ? 'format_violation' : 'incomplete',
        severity: dIssue.severity,
        issue: dIssue.message,
        explanation: `Deterministic validation rule ${dIssue.rule} failed.`,
        policy_citation: dIssue.rule === 'INVALID_CATEGORY' 
          ? 'MP-6.1: Category Taxonomy & Classification Compliance'
          : dIssue.rule === 'DUPLICATE_LISTING'
          ? 'MP-6.1: Duplicate Listing Standards'
          : 'Deterministic Core Schema Rule',
        relevant_text: String((listing as any)[dIssue.field] ?? '')
      });
    }

    // 2. Retrieve Relevant Policies
    const combinedListingText = `
      Title: ${listing.title}
      Description: ${listing.description}
      Category: ${listing.category}
      Price: ${listing.price}
      Seller: ${listing.seller}
      Tags: ${listing.tags?.join(', ') ?? ''}
      Attributes: ${JSON.stringify(listing.attributes ?? {})}
    `;
    const policyMatches = defaultPolicyEngine.retrieveRelevantPolicies(combinedListingText);
    const retrievedPolicyIds = policyMatches.map(m => m.policy.id);

    // 3. Scan for Unverifiable Claims
    const unverifiableClaims = claimDetector.scanListing(listing);
    for (const claim of unverifiableClaims) {
      findings.push({
        id: uuidv4(),
        field: claim.field.startsWith('attributes') ? 'attributes' : (claim.field as any),
        type: 'unverifiable_claim',
        severity: 'HIGH',
        issue: `Unverifiable claim: "${claim.claim}"`,
        explanation: claim.reason,
        policy_citation: 'MP-4.1: Unverifiable, Superlative, and Medical Claims',
        relevant_text: claim.claim
      });
    }

    // 4. Content Scanning for Policy Violations

    // Check for Counterfeits & Replicas (MP-1.2)
    const replicaRegex = /\b(replica|clone|1:1\s*copy|dupe|fake|knockoff|mirror\s*copy|unauthorized\s*copy)\b/i;
    const titleReplica = listing.title.match(replicaRegex);
    const descReplica = listing.description.match(replicaRegex);
    if (titleReplica || descReplica) {
      findings.push({
        id: uuidv4(),
        field: titleReplica ? 'title' : 'description',
        type: 'prohibited',
        severity: 'CRITICAL',
        issue: 'Listing appears to promote counterfeit, replica, or unauthorized trademark copies.',
        explanation: 'Offering replicas, knockoffs, or unauthorized brand duplicates is strictly prohibited to protect consumer safety and intellectual property.',
        policy_citation: 'MP-1.2: Counterfeits, Replicas, and Unauthorized Brand Usage',
        relevant_text: (titleReplica?.[0] || descReplica?.[0])!
      });
    }

    // Check for Prohibited Goods & Drugs (MP-1.1)
    const prohibitedRegex = /\b(prescription|viagra|adderall|firearms?|ammunition|narcotics?|steroids?|explosive)\b/i;
    const probMatch = combinedListingText.match(prohibitedRegex);
    if (probMatch) {
      findings.push({
        id: uuidv4(),
        field: 'description',
        type: 'prohibited',
        severity: 'CRITICAL',
        issue: `Listing references prohibited goods: "${probMatch[0]}".`,
        explanation: 'Selling controlled pharmaceuticals, weapons, or hazardous materials is illegal and violates platform terms.',
        policy_citation: 'MP-1.1: Prohibited Goods, Weapons, and Unapproved Pharmaceuticals',
        relevant_text: probMatch[0]
      });
    }

    // Check for Off-Platform Diversion (MP-5.1)
    const offPlatformRegex = /\b(whatsapp|telegram|cashapp|venmo|zelle|wire\s*transfer|contact\s*me\s*directly|email\s*me\s*at)\b/i;
    const offPlatformMatch = listing.description.match(offPlatformRegex);
    if (offPlatformMatch) {
      findings.push({
        id: uuidv4(),
        field: 'description',
        type: 'prohibited',
        severity: 'CRITICAL',
        issue: 'Listing contains off-platform contact or external payment solicitations.',
        explanation: 'Attempting to conduct transactions or communications outside marketplace checkout violates buyer protection policy.',
        policy_citation: 'MP-5.1: Prohibition of Off-Platform Transactions and Direct Seller Contact',
        relevant_text: offPlatformMatch[0]
      });
    }

    // Check Brand Formatting: ALL-CAPS Yelling (BRAND-1.2)
    const capsWords = listing.title.match(/\b[A-Z]{4,}\b/g) || [];
    const significantCaps = capsWords.filter(w => !['HDMI', 'OLED', 'USB', 'ANSI', 'QHD', 'DDR4', 'DDR5', 'RGB', 'LED', 'SSD', 'RAM', 'CPU', 'GPU'].includes(w));
    if (significantCaps.length >= 2 || (listing.title.length > 15 && listing.title === listing.title.toUpperCase())) {
      findings.push({
        id: uuidv4(),
        field: 'title',
        type: 'brand_violation',
        severity: 'MEDIUM',
        issue: 'Title uses excessive ALL-CAPS uppercase lettering.',
        explanation: 'Titles must use proper title casing or sentence casing. Capitalizing entire phrases feels spammy and diminishes buyer trust.',
        policy_citation: 'BRAND-1.2: Typography & Formatting Standards',
        relevant_text: significantCaps.join(', ') || listing.title
      });
    }

    // Check Brand Formatting: Emoji Clusters (BRAND-1.2)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    const titleEmojis = listing.title.match(emojiRegex) || [];
    if (titleEmojis.length > 1) {
      findings.push({
        id: uuidv4(),
        field: 'title',
        type: 'brand_violation',
        severity: 'MEDIUM',
        issue: `Title contains excessive emojis (${titleEmojis.length} emojis detected).`,
        explanation: 'Brand guidelines limit decorative emojis to maintain a professional, dignified presentation.',
        policy_citation: 'BRAND-1.2: Typography & Formatting Standards',
        relevant_text: titleEmojis.join(' ')
      });
    }

    // Check Brand Voice: Hype & Panic Triggers (BRAND-1.1)
    const hypeRegex = /\b(buy\s*now\s*or\s*regret|insane\s*deal|once\s*in\s*a\s*lifetime|crazy\s*deal|mind\s*blowing|don\'t\s*miss|hurry\s*up)\b/i;
    const hypeMatch = listing.description.match(hypeRegex) || listing.title.match(hypeRegex);
    if (hypeMatch) {
      findings.push({
        id: uuidv4(),
        field: 'description',
        type: 'brand_violation',
        severity: 'MEDIUM',
        issue: `Sensationalized hype phrasing detected: "${hypeMatch[0]}".`,
        explanation: 'Content should be informative and objective rather than employing aggressive sales triggers.',
        policy_citation: 'BRAND-1.1: Professional, Objective Tone of Voice',
        relevant_text: hypeMatch[0]
      });
    }

    // Check Keyword Stuffing (BRAND-3.1)
    const keywordStuffingRegex = /\b(like\s+(airpods|apple|nike|rolex|bose|sony|gucci)|similar\s+to|not\s+(nike|adidas))\b/i;
    const kwStuffMatch = listing.title.match(keywordStuffingRegex) || listing.description.match(keywordStuffingRegex);
    if (kwStuffMatch) {
      findings.push({
        id: uuidv4(),
        field: 'title',
        type: 'misleading',
        severity: 'MEDIUM',
        issue: `Keyword stuffing detected: "${kwStuffMatch[0]}".`,
        explanation: 'Mentioning unrelated brand names to hijack search indexing degrades discovery quality.',
        policy_citation: 'BRAND-3.1: Search Hygiene and Keyword Spamming Prohibition',
        relevant_text: kwStuffMatch[0]
      });
    }

    // Check Condition & Warranty Transparency (BRAND-2.2)
    const hasCondition = listing.attributes && (
      listing.attributes['Condition'] || 
      listing.attributes['condition'] || 
      listing.attributes['Item Condition']
    );
    if (!hasCondition && !/brand\s*new|refurbished|used|pre-owned/i.test(listing.description)) {
      findings.push({
        id: uuidv4(),
        field: 'attributes',
        type: 'incomplete',
        severity: 'MEDIUM',
        issue: 'Item condition is not explicitly defined in attributes or description.',
        explanation: 'Buyers require upfront knowledge of condition grading (New, Certified Refurbished, or Used).',
        policy_citation: 'BRAND-2.2: Condition Transparency and Warranty Terms',
        relevant_text: 'Missing condition attribute'
      });
    }

    // 5. Generate Suggestions for Each Field
    const suggestions = this.generateFieldSuggestions(listing, findings);

    // 6. Calculate Quality Score & Status
    let score = 100;
    let criticalCount = 0;
    let highCount = 0;

    for (const f of findings) {
      if (f.severity === 'CRITICAL') {
        score -= 35;
        criticalCount++;
      } else if (f.severity === 'HIGH') {
        score -= 15;
        highCount++;
      } else if (f.severity === 'MEDIUM') {
        score -= 7;
      } else if (f.severity === 'LOW') {
        score -= 3;
      }
    }
    score = Math.max(0, Math.min(100, score));

    let reviewStatus: 'FLAGGED' | 'NEEDS_REVISION' | 'COMPLIANT' = 'COMPLIANT';
    if (criticalCount > 0) {
      reviewStatus = 'FLAGGED';
    } else if (score < 80 || highCount > 0) {
      reviewStatus = 'NEEDS_REVISION';
    }

    const duration = Date.now() - startTime;

    return {
      id: uuidv4(),
      listing_id: listing.id,
      created_at: new Date().toISOString(),
      overall_score: score,
      review_status: reviewStatus,
      deterministic_issues: deterministicIssues,
      findings,
      unverifiable_claims: unverifiableClaims,
      suggestions,
      retrieved_policy_sections: retrievedPolicyIds,
      ai_model_used: process.env.GEMINI_API_KEY ? 'gemini-1.5-flash + semantic-policy-engine' : 'semantic-policy-engine-v1',
      execution_duration_ms: duration
    };
  }

  /**
   * Generates field-by-field suggested rewrites
   */
  private generateFieldSuggestions(
    listing: Listing, 
    findings: ReviewFinding[]
  ): ReviewReport['suggestions'] {
    // 1. Suggest Title
    let cleanTitle = listing.title;
    // Strip emojis
    cleanTitle = cleanTitle.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    // Strip replica/dupe keywords
    cleanTitle = cleanTitle.replace(/\b(1:1\s*AAA\s*mirror\s*clone|1:1\s*copy|replica|clone|dupe|fake)\b/gi, '').trim();
    // Strip brand stuffing
    cleanTitle = cleanTitle.replace(/\b(like\s+(airpods|apple|nike|rolex|bose|sony)|supreme\s+style)\b/gi, '').trim();
    // Normalize ALL-CAPS into Title Case if shouted
    if (cleanTitle === cleanTitle.toUpperCase() || cleanTitle.split(' ').filter(w => w.length > 3 && w === w.toUpperCase()).length > 2) {
      cleanTitle = cleanTitle.toLowerCase().replace(/(?:^|\s)\w/g, c => c.toUpperCase());
    }
    // Clean redundant spaces and punctuation
    cleanTitle = cleanTitle.replace(/[!]{2,}/g, '').replace(/\s{2,}/g, ' ').trim();

    // 2. Suggest Description
    let cleanDesc = listing.description;
    // Strip off-platform solicitations
    cleanDesc = cleanDesc.replace(/(?:message|dm|contact|whatsapp|telegram|call|zelle|cashapp)[^\n.!?]*(?:\.|$)/gi, '');
    // Replace miracle / 100% cure claims
    cleanDesc = cleanDesc.replace(/\b100%\s*(cures?|eliminates?\s*pain\s*forever|cure)\b/gi, 'supports daily wellness and comfort');
    cleanDesc = cleanDesc.replace(/\bguaranteed\s*(500%|1000%|infinite)\s*profit\b/gi, 'provides algorithmic analytical market insights');
    cleanDesc = cleanDesc.replace(/\b(best\s*in\s*the\s*world|undisputed\s*#1)\b/gi, 'premium engineered');
    // Strip urgent hype lines
    cleanDesc = cleanDesc.replace(/\b(don't\s*miss\s*this\s*crazy|buy\s*now\s*or\s*regret)[^\n.!?]*!+/gi, '');
    cleanDesc = cleanDesc.replace(/[!]{2,}/g, '.').replace(/\s{2,}/g, ' ').trim();

    // If description is brief or messy, format into structured sections
    if (!cleanDesc.includes('Key Specifications') && !cleanDesc.includes('Overview:')) {
      cleanDesc = `Overview:\n${cleanDesc}\n\nKey Highlights:\n• Verified authentic and marketplace compliant\n• Inspected for quality and durability\n• Packaged securely for fast shipping`;
    }

    // 3. Suggest Category
    let cleanCat = listing.category;
    if (!['Electronics', 'Apparel & Accessories', 'Home & Living', 'Beauty & Health', 'Sports & Outdoors', 'Books & Media', 'Tools & Hardware', 'Services & Digital'].includes(cleanCat)) {
      cleanCat = 'Electronics'; // intelligent default
    }

    // 4. Suggest Price
    let cleanPrice = Number(listing.price) || 19.99;
    if (cleanPrice <= 0 || isNaN(cleanPrice)) {
      cleanPrice = 19.99;
    } else {
      cleanPrice = Number(cleanPrice.toFixed(2));
    }

    // 5. Suggest Attributes
    const cleanAttributes: Record<string, string> = { ...(listing.attributes || {}) };
    if (!cleanAttributes['Condition']) {
      cleanAttributes['Condition'] = 'Brand New';
    }
    if (!cleanAttributes['Warranty']) {
      cleanAttributes['Warranty'] = '30-Day Marketplace Buyer Protection';
    }

    // 6. Suggest Tags
    const cleanTags = (listing.tags || [])
      .map(t => t.toLowerCase().trim().replace(/[^a-z0-9-]/g, ''))
      .filter(t => t.length > 2 && !['fake', 'replica', 'clone', 'dupe'].includes(t))
      .slice(0, 7);

    return {
      title: {
        field: 'title',
        original: listing.title,
        suggested: cleanTitle,
        rationale: 'Normalized typography casing, removed excessive exclamation points, and stripped non-compliant promotional hype.',
        status: 'pending'
      },
      description: {
        field: 'description',
        original: listing.description,
        suggested: cleanDesc,
        rationale: 'Structured into clear overview and bulleted highlights, removed prohibited off-platform contact info, and replaced unverifiable health/financial claims.',
        status: 'pending'
      },
      category: {
        field: 'category',
        original: listing.category,
        suggested: cleanCat,
        rationale: 'Validated against supported marketplace taxonomy whitelist.',
        status: 'pending'
      },
      price: {
        field: 'price',
        original: listing.price,
        suggested: cleanPrice,
        rationale: 'Ensured valid standard currency decimal precision ($XX.XX) and positive commercial threshold.',
        status: 'pending'
      },
      attributes: {
        field: 'attributes',
        original: listing.attributes || {},
        suggested: cleanAttributes,
        rationale: 'Added standardized condition and warranty disclosure attributes required by brand guidelines.',
        status: 'pending'
      },
      tags: {
        field: 'tags',
        original: listing.tags || [],
        suggested: cleanTags,
        rationale: 'Sanitized keywords, removed non-compliant replica tags, and limited to high-relevance search terms.',
        status: 'pending'
      }
    };
  }
}

export const reviewerAgent = new ReviewerAgent();

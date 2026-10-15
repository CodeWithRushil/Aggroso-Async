import { describe, it, expect } from 'vitest';
import { reviewerAgent } from '../src/ai/reviewerAgent.js';
import { Listing } from '../src/types/index.js';

describe('ReviewerAgent', () => {
  it('flags replica listings as FLAGGED with CRITICAL severity and cited policies', async () => {
    const replicaListing: Listing = {
      id: 'test-rep-1',
      title: 'Rolex Submariner 1:1 AAA Mirror Clone Watch',
      description: 'Super high quality replica watch. Message me on WhatsApp +1-555-0199 for discount via Zelle wire.',
      category: 'Apparel & Accessories',
      price: 299.00,
      currency: 'USD',
      attributes: { 'Brand': 'Rolex' },
      seller: 'ReplicaKing',
      tags: ['rolex', 'replica'],
      status: 'PENDING_REVIEW',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const review = await reviewerAgent.reviewListing(replicaListing);

    expect(review.review_status).toBe('FLAGGED');
    expect(review.overall_score).toBeLessThan(70);

    // Verify policy citations exist
    const citations = review.findings.map(f => f.policy_citation);
    expect(citations.some(c => c.includes('MP-1.2'))).toBe(true); // Replica policy
    expect(citations.some(c => c.includes('MP-5.1'))).toBe(true); // Off-platform policy

    // Verify suggestions are generated field-by-field
    expect(review.suggestions.title.suggested).not.toContain('1:1 AAA Mirror Clone');
    expect(review.suggestions.title.status).toBe('pending');
    expect(review.suggestions.description.suggested).not.toContain('WhatsApp');
  });

  it('rates compliant listing with high quality score and COMPLIANT status', async () => {
    const compliantListing: Listing = {
      id: 'test-comp-1',
      title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      description: 'Industry-leading noise cancellation with dual processors. Up to 30 hours battery life with quick charge capability. Includes carrying case and audio cable.',
      category: 'Electronics',
      price: 349.99,
      currency: 'USD',
      attributes: {
        'Brand': 'Sony',
        'Condition': 'Brand New',
        'Warranty': '1-Year Manufacturer Warranty'
      },
      seller: 'Authorized Audio',
      tags: ['sony', 'headphones', 'bluetooth'],
      status: 'PENDING_REVIEW',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const review = await reviewerAgent.reviewListing(compliantListing);

    expect(review.review_status).toBe('COMPLIANT');
    expect(review.overall_score).toBeGreaterThanOrEqual(85);
    expect(review.findings.filter(f => f.severity === 'CRITICAL').length).toBe(0);
  });
});

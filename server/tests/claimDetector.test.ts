import { describe, it, expect } from 'vitest';
import { claimDetector } from '../src/ai/claimDetector.js';

describe('ClaimDetector', () => {
  it('detects medical and miracle cure claims', () => {
    const claims = claimDetector.detectClaims(
      'description', 
      'This herbal tincture is a miracle cure that 100% cures joint pain and cures arthritis.'
    );

    expect(claims.length).toBeGreaterThan(0);
    expect(claims.some(c => c.reason.includes('medical or therapeutic cure claim'))).toBe(true);
  });

  it('detects extreme superlatives', () => {
    const claims = claimDetector.detectClaims(
      'title',
      'The Best In The World Undisputed #1 Noise Cancelling Headphones'
    );

    expect(claims.length).toBeGreaterThan(0);
    expect(claims.some(c => c.reason.includes('superlative'))).toBe(true);
  });

  it('detects impossible physical absolutist claims', () => {
    const claims = claimDetector.detectClaims(
      'description',
      'Equipped with infinite battery power that lasts forever and never dies.'
    );

    expect(claims.length).toBeGreaterThan(0);
    expect(claims.some(c => c.reason.includes('absolutist'))).toBe(true);
  });

  it('scans full listing structure', () => {
    const claims = claimDetector.scanListing({
      title: 'Undisputed #1 Smart Watch',
      description: 'Guaranteed 500% profit with our crypto trading app',
      attributes: { 'Durability': 'Indestructible metal' }
    });

    expect(claims.length).toBe(3);
  });
});

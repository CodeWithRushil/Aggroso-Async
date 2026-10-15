import { describe, it, expect } from 'vitest';
import { defaultPolicyEngine } from '../src/policies/policyEngine.js';

describe('PolicyEngine', () => {
  it('loads all marketplace policy and brand guide sections', () => {
    const policies = defaultPolicyEngine.getAllPolicies();
    expect(policies.length).toBeGreaterThanOrEqual(10);
    
    // Verify required sections exist
    expect(defaultPolicyEngine.getPolicyById('MP-1.1')).toBeDefined();
    expect(defaultPolicyEngine.getPolicyById('MP-1.2')).toBeDefined();
    expect(defaultPolicyEngine.getPolicyById('MP-4.1')).toBeDefined();
    expect(defaultPolicyEngine.getPolicyById('BRAND-1.2')).toBeDefined();
  });

  it('retrieves relevant policies matching prohibited keywords', () => {
    const sampleText = 'Selling 1:1 AAA clone replica luxury watch, message on whatsapp for discount';
    const matches = defaultPolicyEngine.retrieveRelevantPolicies(sampleText);
    
    expect(matches.length).toBeGreaterThan(0);
    const matchedIds = matches.map(m => m.policy.id);
    
    // Should match Counterfeits (MP-1.2) and Off-Platform Diversion (MP-5.1)
    expect(matchedIds).toContain('MP-1.2');
    expect(matchedIds).toContain('MP-5.1');
  });

  it('retrieves medical claim policy for miracle cures', () => {
    const sampleText = 'Miracle organic herbal tea that 100% cures arthritis and eliminates cancer';
    const matches = defaultPolicyEngine.retrieveRelevantPolicies(sampleText);
    
    const matchedIds = matches.map(m => m.policy.id);
    expect(matchedIds).toContain('MP-4.1');
  });
});

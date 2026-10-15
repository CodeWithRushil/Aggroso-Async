import { describe, it, expect } from 'vitest';
import { deterministicValidator, SUPPORTED_CATEGORIES } from '../src/validators/deterministic.js';
import { Listing } from '../src/types/index.js';

describe('DeterministicValidator', () => {
  const validListing: Partial<Listing> = {
    id: 'test-1',
    title: 'Anker 100W USB-C GaN Fast Charger',
    description: 'A premium quality fast charger with foldable prongs and dual ports for laptops and phones.',
    category: 'Electronics',
    price: 49.99,
    seller: 'Anker Official'
  };

  it('passes on a valid listing', () => {
    const issues = deterministicValidator.validate(validListing);
    expect(issues.length).toBe(0);
  });

  it('detects missing required fields', () => {
    const issues = deterministicValidator.validate({
      title: '',
      description: '',
      category: '',
      price: undefined,
      seller: ''
    });

    const fields = issues.map(i => i.field);
    expect(fields).toContain('title');
    expect(fields).toContain('description');
    expect(fields).toContain('category');
    expect(fields).toContain('price');
    expect(fields).toContain('seller');
  });

  it('rejects unsupported categories', () => {
    const issues = deterministicValidator.validate({
      ...validListing,
      category: 'WeaponsAndHazardousMaterials'
    });

    expect(issues.some(i => i.rule === 'INVALID_CATEGORY')).toBe(true);
  });

  it('accepts all supported categories', () => {
    for (const cat of SUPPORTED_CATEGORIES) {
      const issues = deterministicValidator.validate({
        ...validListing,
        category: cat
      });
      expect(issues.some(i => i.rule === 'INVALID_CATEGORY')).toBe(false);
    }
  });

  it('validates price bounds and formatting', () => {
    // Non-positive price
    let issues = deterministicValidator.validate({ ...validListing, price: 0 });
    expect(issues.some(i => i.rule === 'PRICE_NON_POSITIVE')).toBe(true);

    // Below minimum threshold ($0.50)
    issues = deterministicValidator.validate({ ...validListing, price: 0.10 });
    expect(issues.some(i => i.rule === 'PRICE_TOO_LOW')).toBe(true);

    // More than 2 decimal places
    issues = deterministicValidator.validate({ ...validListing, price: 19.999 });
    expect(issues.some(i => i.rule === 'PRICE_DECIMAL_PRECISION')).toBe(true);
  });

  it('enforces title and description length constraints', () => {
    // Title too short (< 10 chars)
    let issues = deterministicValidator.validate({ ...validListing, title: 'Short' });
    expect(issues.some(i => i.rule === 'TITLE_TOO_SHORT')).toBe(true);

    // Title too long (> 150 chars)
    const longTitle = 'A'.repeat(160);
    issues = deterministicValidator.validate({ ...validListing, title: longTitle });
    expect(issues.some(i => i.rule === 'TITLE_TOO_LONG')).toBe(true);

    // Description too short (< 30 chars)
    issues = deterministicValidator.validate({ ...validListing, description: 'Too brief text' });
    expect(issues.some(i => i.rule === 'DESCRIPTION_TOO_SHORT')).toBe(true);
  });

  it('detects duplicate listings from the same seller', () => {
    const existingListings: Listing[] = [
      {
        id: 'existing-1',
        title: 'Anker 100W USB-C GaN Fast Charger',
        description: 'Original description here.',
        category: 'Electronics',
        price: 49.99,
        currency: 'USD',
        attributes: {},
        seller: 'Anker Official',
        tags: [],
        status: 'COMPLIANT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const issues = deterministicValidator.validate(
      {
        ...validListing,
        title: 'anker 100w usb-c gan fast charger!', // normalized match
        seller: 'Anker Official'
      },
      { existingListings, currentListingId: 'new-id' }
    );

    expect(issues.some(i => i.rule === 'DUPLICATE_LISTING')).toBe(true);
  });
});

import { DeterministicIssue, Listing } from '../types/index.js';

export const SUPPORTED_CATEGORIES = [
  'Electronics',
  'Apparel & Accessories',
  'Home & Living',
  'Beauty & Health',
  'Sports & Outdoors',
  'Books & Media',
  'Tools & Hardware',
  'Services & Digital'
] as const;

export interface ValidationContext {
  existingListings?: Listing[];
  currentListingId?: string;
}

export class DeterministicValidator {
  public static readonly MIN_TITLE_LENGTH = 10;
  public static readonly MAX_TITLE_LENGTH = 150;
  public static readonly MIN_DESCRIPTION_LENGTH = 30;
  public static readonly MAX_DESCRIPTION_LENGTH = 3000;
  public static readonly MIN_PRICE = 0.50;
  public static readonly MAX_PRICE = 1000000;

  /**
   * Run all deterministic validations on a listing candidate
   */
  public validate(listing: Partial<Listing>, context?: ValidationContext): DeterministicIssue[] {
    const issues: DeterministicIssue[] = [];

    // 1. Required fields check
    this.checkRequiredFields(listing, issues);

    // 2. Supported category validation
    this.validateCategory(listing.category, issues);

    // 3. Price format & bounds validation
    this.validatePrice(listing.price, issues);

    // 4. Title and Description length constraints
    this.validateLengths(listing.title, listing.description, issues);

    // 5. Duplicate listing detection
    if (context?.existingListings && listing.title && listing.seller) {
      this.detectDuplicates(
        listing.title, 
        listing.seller, 
        context.existingListings, 
        context.currentListingId, 
        issues
      );
    }

    return issues;
  }

  private checkRequiredFields(listing: Partial<Listing>, issues: DeterministicIssue[]): void {
    if (!listing.title || listing.title.trim().length === 0) {
      issues.push({
        field: 'title',
        rule: 'REQUIRED_FIELD',
        message: 'Title is required and cannot be blank.',
        severity: 'CRITICAL'
      });
    }

    if (!listing.description || listing.description.trim().length === 0) {
      issues.push({
        field: 'description',
        rule: 'REQUIRED_FIELD',
        message: 'Description is required and cannot be blank.',
        severity: 'CRITICAL'
      });
    }

    if (!listing.category || listing.category.trim().length === 0) {
      issues.push({
        field: 'category',
        rule: 'REQUIRED_FIELD',
        message: 'Category is required.',
        severity: 'CRITICAL'
      });
    }

    if (listing.price === undefined || listing.price === null || String(listing.price).trim() === '') {
      issues.push({
        field: 'price',
        rule: 'REQUIRED_FIELD',
        message: 'Price is required.',
        severity: 'CRITICAL'
      });
    }

    if (!listing.seller || listing.seller.trim().length === 0) {
      issues.push({
        field: 'seller',
        rule: 'REQUIRED_FIELD',
        message: 'Seller identifier is required.',
        severity: 'CRITICAL'
      });
    }
  }

  private validateCategory(category: string | undefined, issues: DeterministicIssue[]): void {
    if (!category || category.trim().length === 0) return;

    const trimmed = category.trim();
    const isSupported = SUPPORTED_CATEGORIES.some(
      c => c.toLowerCase() === trimmed.toLowerCase()
    );

    if (!isSupported) {
      issues.push({
        field: 'category',
        rule: 'INVALID_CATEGORY',
        message: `Category "${trimmed}" is not supported. Supported categories: ${SUPPORTED_CATEGORIES.join(', ')}.`,
        severity: 'HIGH'
      });
    }
  }

  private validatePrice(price: any, issues: DeterministicIssue[]): void {
    if (price === undefined || price === null || String(price).trim() === '') return;

    const num = Number(price);
    if (isNaN(num)) {
      issues.push({
        field: 'price',
        rule: 'INVALID_PRICE_FORMAT',
        message: 'Price must be a valid numerical value.',
        severity: 'CRITICAL'
      });
      return;
    }

    if (num <= 0) {
      issues.push({
        field: 'price',
        rule: 'PRICE_NON_POSITIVE',
        message: 'Price must be greater than zero.',
        severity: 'CRITICAL'
      });
      return;
    }

    if (num < DeterministicValidator.MIN_PRICE) {
      issues.push({
        field: 'price',
        rule: 'PRICE_TOO_LOW',
        message: `Price ($${num.toFixed(2)}) is below minimum threshold ($${DeterministicValidator.MIN_PRICE.toFixed(2)}). Avoid placeholder pricing.`,
        severity: 'HIGH'
      });
    } else if (num > DeterministicValidator.MAX_PRICE) {
      issues.push({
        field: 'price',
        rule: 'PRICE_TOO_HIGH',
        message: `Price exceeds maximum marketplace limit ($${DeterministicValidator.MAX_PRICE.toLocaleString()}).`,
        severity: 'HIGH'
      });
    }

    // Check decimal precision (at most 2 decimal places)
    const priceStr = String(num);
    const decimalParts = priceStr.split('.');
    if (decimalParts.length > 1 && decimalParts[1].length > 2) {
      issues.push({
        field: 'price',
        rule: 'PRICE_DECIMAL_PRECISION',
        message: 'Price cannot contain more than 2 decimal places (cents).',
        severity: 'MEDIUM'
      });
    }
  }

  private validateLengths(
    title: string | undefined, 
    description: string | undefined, 
    issues: DeterministicIssue[]
  ): void {
    if (title && title.trim().length > 0) {
      const titleLen = title.trim().length;
      if (titleLen < DeterministicValidator.MIN_TITLE_LENGTH) {
        issues.push({
          field: 'title',
          rule: 'TITLE_TOO_SHORT',
          message: `Title length (${titleLen} chars) is too short. Minimum is ${DeterministicValidator.MIN_TITLE_LENGTH} characters.`,
          severity: 'MEDIUM'
        });
      } else if (titleLen > DeterministicValidator.MAX_TITLE_LENGTH) {
        issues.push({
          field: 'title',
          rule: 'TITLE_TOO_LONG',
          message: `Title length (${titleLen} chars) exceeds maximum allowed of ${DeterministicValidator.MAX_TITLE_LENGTH} characters.`,
          severity: 'MEDIUM'
        });
      }
    }

    if (description && description.trim().length > 0) {
      const descLen = description.trim().length;
      if (descLen < DeterministicValidator.MIN_DESCRIPTION_LENGTH) {
        issues.push({
          field: 'description',
          rule: 'DESCRIPTION_TOO_SHORT',
          message: `Description length (${descLen} chars) is too short. Minimum is ${DeterministicValidator.MIN_DESCRIPTION_LENGTH} characters.`,
          severity: 'MEDIUM'
        });
      } else if (descLen > DeterministicValidator.MAX_DESCRIPTION_LENGTH) {
        issues.push({
          field: 'description',
          rule: 'DESCRIPTION_TOO_LONG',
          message: `Description length (${descLen} chars) exceeds maximum allowed of ${DeterministicValidator.MAX_DESCRIPTION_LENGTH} characters.`,
          severity: 'MEDIUM'
        });
      }
    }
  }

  private detectDuplicates(
    title: string,
    seller: string,
    existingListings: Listing[],
    currentListingId: string | undefined,
    issues: DeterministicIssue[]
  ): void {
    const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
    const currentNorm = normalize(title);
    const sellerNorm = seller.trim().toLowerCase();

    for (const item of existingListings) {
      if (currentListingId && item.id === currentListingId) continue;
      if (item.seller.trim().toLowerCase() !== sellerNorm) continue;

      const itemNorm = normalize(item.title);
      if (itemNorm === currentNorm) {
        issues.push({
          field: 'title',
          rule: 'DUPLICATE_LISTING',
          message: `Potential duplicate listing detected: Seller "${seller}" already has an active listing "${item.title}" (ID: ${item.id}).`,
          severity: 'CRITICAL'
        });
        break;
      }
    }
  }
}

export const deterministicValidator = new DeterministicValidator();

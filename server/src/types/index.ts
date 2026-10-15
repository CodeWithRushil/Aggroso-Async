export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ListingStatus = 
  | 'DRAFT' 
  | 'PENDING_REVIEW' 
  | 'FLAGGED' 
  | 'NEEDS_REVISION' 
  | 'COMPLIANT' 
  | 'APPROVED' 
  | 'REJECTED';

export type FieldDecisionStatus = 'pending' | 'accepted' | 'edited' | 'rejected';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  attributes: Record<string, string>;
  seller: string;
  tags: string[];
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface DeterministicIssue {
  field: string;
  rule: string;
  message: string;
  severity: Severity;
}

export interface PolicySection {
  id: string;
  doc: 'Marketplace Policy' | 'Brand-Content Guide';
  section: string;
  title: string;
  summary: string;
  full_text: string;
  keywords: string[];
  examples_bad: string[];
  examples_good: string[];
  default_severity: Severity;
}

export interface ReviewFinding {
  id: string;
  field: 'title' | 'description' | 'category' | 'price' | 'attributes' | 'tags' | 'seller' | 'general';
  type: 'prohibited' | 'misleading' | 'unclear' | 'incomplete' | 'unverifiable_claim' | 'brand_violation' | 'format_violation';
  severity: Severity;
  issue: string;
  explanation: string;
  policy_citation: string;
  relevant_text: string;
}

export interface UnverifiableClaim {
  claim: string;
  field: string;
  reason: string;
  recommendation: string;
}

export interface FieldSuggestion<T = any> {
  field: string;
  original: T;
  suggested: T;
  rationale: string;
  status: FieldDecisionStatus;
  user_edited_value?: T;
}

export interface ReviewReport {
  id: string;
  listing_id: string;
  created_at: string;
  overall_score: number; // 0-100
  review_status: 'FLAGGED' | 'NEEDS_REVISION' | 'COMPLIANT';
  deterministic_issues: DeterministicIssue[];
  findings: ReviewFinding[];
  unverifiable_claims: UnverifiableClaim[];
  suggestions: {
    title: FieldSuggestion<string>;
    description: FieldSuggestion<string>;
    category: FieldSuggestion<string>;
    price: FieldSuggestion<number>;
    attributes: FieldSuggestion<Record<string, string>>;
    tags: FieldSuggestion<string[]>;
  };
  retrieved_policy_sections: string[]; // policy IDs
  ai_model_used: string;
  execution_duration_ms: number;
}

export interface AuditLogEntry {
  id: string;
  listing_id: string;
  review_id?: string;
  action: 
    | 'LISTING_CREATED'
    | 'REVIEW_GENERATED'
    | 'FIELD_ACCEPTED'
    | 'FIELD_EDITED'
    | 'FIELD_REJECTED'
    | 'REVISION_SAVED'
    | 'LISTING_APPROVED'
    | 'LISTING_REJECTED'
    | 'BATCH_PROCESSED';
  field_name?: string;
  reviewer: string;
  previous_value?: any;
  new_value?: any;
  notes?: string;
  timestamp: string;
}

export interface BatchProcessingItem {
  listing_id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  score?: number;
  review_status?: string;
  critical_count?: number;
  error?: string;
}

export interface AppLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  context: string;
  message: string;
  metadata?: Record<string, any>;
}

import { 
  Listing, 
  ReviewReport, 
  AuditLogEntry, 
  PolicySection, 
  AppLogEntry, 
  BatchReviewSummary, 
  BatchProcessingItem 
} from '../types/index.js';

const API_BASE = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? '' : 'http://localhost:3001');

export async function fetchListings(): Promise<Listing[]> {
  const res = await fetch(`${API_BASE}/api/listings`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch listings');
  return data.data;
}

export async function fetchListingDetails(id: string): Promise<{
  listing: Listing;
  review: ReviewReport | null;
  auditLogs: AuditLogEntry[];
}> {
  const res = await fetch(`${API_BASE}/api/listings/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch listing details');
  return data.data;
}

export async function createListing(payload: {
  title: string;
  description: string;
  category: string;
  price: number;
  attributes?: Record<string, string>;
  seller: string;
  tags?: string[];
}): Promise<{ listing: Listing; review: ReviewReport }> {
  const res = await fetch(`${API_BASE}/api/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to create listing');
  return data.data;
}

export async function rerunReview(listingId: string, reviewer?: string): Promise<{
  listing: Listing;
  review: ReviewReport;
}> {
  const res = await fetch(`${API_BASE}/api/listings/${listingId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewer })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to rerun review');
  return data.data;
}

export async function submitFieldDecision(
  reviewId: string, 
  payload: {
    listingId: string;
    field: string;
    decision: 'accepted' | 'edited' | 'rejected';
    editedValue?: any;
    reviewer?: string;
    notes?: string;
  }
): Promise<{
  listing: Listing;
  review: ReviewReport;
  auditLogs: AuditLogEntry[];
}> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to update field decision');
  return data.data;
}

export async function finalizeListingReview(
  reviewId: string,
  payload: {
    listingId: string;
    decision: 'APPROVED' | 'REJECTED';
    reviewer?: string;
    notes?: string;
  }
): Promise<{
  listing: Listing;
  review: ReviewReport | null;
  auditLogs: AuditLogEntry[];
}> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to finalize review');
  return data.data;
}

export async function processBatchReview(payload: {
  listingIds?: string[];
  newListings?: any[];
  reviewer?: string;
}): Promise<{
  summary: BatchReviewSummary;
  items: BatchProcessingItem[];
}> {
  const res = await fetch(`${API_BASE}/api/batch/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to process batch review');
  return data;
}

export async function fetchPolicies(query?: string): Promise<PolicySection[]> {
  const url = query 
    ? `${API_BASE}/api/policies/search?q=${encodeURIComponent(query)}`
    : `${API_BASE}/api/policies`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch policies');
  return data.data;
}

export async function fetchLogs(limit = 100, context?: string): Promise<AppLogEntry[]> {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (context) params.set('context', context);
  const res = await fetch(`${API_BASE}/api/logs?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch logs');
  return data.data;
}

export async function clearLogs(): Promise<void> {
  await fetch(`${API_BASE}/api/logs`, { method: 'DELETE' });
}

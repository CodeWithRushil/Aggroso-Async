import React, { useState } from 'react';
import { 
  Listing, 
  ReviewReport, 
  AuditLogEntry, 
  FieldDecisionStatus 
} from '../types/index.js';
import { FieldSuggestionCard } from './FieldSuggestionCard.js';
import { DiffViewer } from './DiffViewer.js';
import { StatusBadge } from './StatusBadge.js';
import { 
  X, 
  CheckCheck, 
  XCircle, 
  RotateCw, 
  FileText, 
  GitCompare, 
  ShieldAlert, 
  AlertOctagon, 
  History, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ListingReviewModalProps {
  listing: Listing;
  review: ReviewReport | null;
  auditLogs: AuditLogEntry[];
  onClose: () => void;
  onFieldDecision: (field: string, decision: 'accepted' | 'edited' | 'rejected', editedValue?: any) => Promise<void>;
  onFinalize: (decision: 'APPROVED' | 'REJECTED') => Promise<void>;
  onRerunReview: () => Promise<void>;
  onOpenPolicyExplorer?: (policyId?: string) => void;
}

export const ListingReviewModal: React.FC<ListingReviewModalProps> = ({
  listing,
  review,
  auditLogs,
  onClose,
  onFieldDecision,
  onFinalize,
  onRerunReview,
  onOpenPolicyExplorer
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'diff' | 'findings' | 'claims' | 'history'>('suggestions');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApproveAll = async () => {
    if (!review) return;
    setIsSubmitting(true);
    try {
      const fields = ['title', 'description', 'category', 'price', 'attributes', 'tags'];
      for (const f of fields) {
        const sugg = (review.suggestions as any)[f];
        if (sugg && sugg.status === 'pending') {
          await onFieldDecision(f, 'accepted');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeAction = async (decision: 'APPROVED' | 'REJECTED') => {
    setIsSubmitting(true);
    try {
      await onFinalize(decision);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRerun = async () => {
    setIsSubmitting(true);
    try {
      await onRerunReview();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} id="listing-review-modal">
      <div className="modal-content modal-content-large">
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ maxWidth: '75%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <StatusBadge status={listing.status} />
              {review && <StatusBadge score={review.overall_score} />}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Seller: <strong style={{ color: 'var(--text-main)' }}>{listing.seller}</strong> | Category: <strong style={{ color: 'var(--text-main)' }}>{listing.category}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {listing.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleRerun}
              disabled={isSubmitting}
              id="btn-rerun-review"
              title="Re-run AI Policy Evaluation"
            >
              <RotateCw size={14} className={isSubmitting ? 'loading-spinner' : ''} /> Re-run Review
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              id="btn-close-modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Quick Approval Action Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: 'var(--bg-elevated)', 
            padding: '12px 18px', 
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Deterministic Issues: <strong>{review?.deterministic_issues.length || 0}</strong> | Findings: <strong>{review?.findings.length || 0}</strong> | Claims: <strong>{review?.unverifiable_claims.length || 0}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleApproveAll}
                disabled={isSubmitting || !review}
                id="btn-approve-all-suggestions"
              >
                <Sparkles size={14} color="var(--primary)" /> Accept All Suggestions
              </button>

              <button
                className="btn btn-rose btn-sm"
                onClick={() => handleFinalizeAction('REJECTED')}
                disabled={isSubmitting}
                id="btn-finalize-reject"
              >
                <XCircle size={14} /> Reject Listing
              </button>

              <button
                className="btn btn-emerald btn-sm"
                onClick={() => handleFinalizeAction('APPROVED')}
                disabled={isSubmitting}
                id="btn-finalize-approve"
              >
                <CheckCheck size={14} /> Approve Listing
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
              onClick={() => setActiveTab('suggestions')}
              id="tab-btn-suggestions"
            >
              <FileText size={16} /> Field Suggestions
            </button>
            <button
              className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
              onClick={() => setActiveTab('diff')}
              id="tab-btn-diff"
            >
              <GitCompare size={16} /> Side-by-Side Diff
            </button>
            <button
              className={`tab-btn ${activeTab === 'findings' ? 'active' : ''}`}
              onClick={() => setActiveTab('findings')}
              id="tab-btn-findings"
            >
              <ShieldAlert size={16} /> Policy Findings ({review?.findings.length || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
              onClick={() => setActiveTab('claims')}
              id="tab-btn-claims"
            >
              <AlertOctagon size={16} /> Unverifiable Claims ({review?.unverifiable_claims.length || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              id="tab-btn-history"
            >
              <History size={16} /> Review History ({auditLogs.length})
            </button>
          </div>

          {/* Tab 1: Field Suggestions */}
          {activeTab === 'suggestions' && review && (
            <div>
              <FieldSuggestionCard
                fieldName="Title"
                suggestion={review.suggestions.title}
                onDecision={(d, v) => onFieldDecision('title', d, v)}
                isSubmitting={isSubmitting}
              />
              <FieldSuggestionCard
                fieldName="Description"
                suggestion={review.suggestions.description}
                onDecision={(d, v) => onFieldDecision('description', d, v)}
                isSubmitting={isSubmitting}
              />
              <FieldSuggestionCard
                fieldName="Category"
                suggestion={review.suggestions.category}
                onDecision={(d, v) => onFieldDecision('category', d, v)}
                isSubmitting={isSubmitting}
              />
              <FieldSuggestionCard
                fieldName="Price"
                suggestion={review.suggestions.price}
                onDecision={(d, v) => onFieldDecision('price', d, v)}
                isSubmitting={isSubmitting}
              />
              <FieldSuggestionCard
                fieldName="Attributes"
                suggestion={review.suggestions.attributes}
                onDecision={(d, v) => onFieldDecision('attributes', d, v)}
                isSubmitting={isSubmitting}
              />
              <FieldSuggestionCard
                fieldName="Tags"
                suggestion={review.suggestions.tags}
                onDecision={(d, v) => onFieldDecision('tags', d, v)}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Tab 2: Visual Side-by-Side Diff */}
          {activeTab === 'diff' && review && (
            <div>
              <DiffViewer
                fieldName="Title"
                original={review.suggestions.title.original}
                revised={review.suggestions.title.status === 'edited' && review.suggestions.title.user_edited_value !== undefined
                  ? review.suggestions.title.user_edited_value
                  : review.suggestions.title.suggested}
              />
              <DiffViewer
                fieldName="Description"
                original={review.suggestions.description.original}
                revised={review.suggestions.description.status === 'edited' && review.suggestions.description.user_edited_value !== undefined
                  ? review.suggestions.description.user_edited_value
                  : review.suggestions.description.suggested}
              />
              <DiffViewer
                fieldName="Attributes"
                original={review.suggestions.attributes.original}
                revised={review.suggestions.attributes.suggested}
              />
            </div>
          )}

          {/* Tab 3: Policy Findings & Citations */}
          {activeTab === 'findings' && review && (
            <div>
              {review.findings.length === 0 ? (
                <div className="empty-state">
                  <CheckCheck size={48} color="var(--emerald)" style={{ margin: '0 auto 12px auto' }} />
                  <h3>No Policy Violations Detected</h3>
                  <p>This listing complies with all marketplace and brand guide standards.</p>
                </div>
              ) : (
                review.findings.map(finding => (
                  <div key={finding.id} className={`finding-card ${finding.severity.toLowerCase()}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StatusBadge severity={finding.severity} />
                        <span className="finding-citation-pill">
                          {finding.policy_citation}
                        </span>
                      </div>
                      {onOpenPolicyExplorer && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                          onClick={() => onOpenPolicyExplorer(finding.policy_citation.split(':')[0])}
                        >
                          <ExternalLink size={12} /> View Policy Rule
                        </button>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>{finding.issue}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {finding.explanation}
                    </p>

                    {finding.relevant_text && (
                      <div style={{ 
                        background: 'rgba(0, 0, 0, 0.3)', 
                        padding: '6px 10px', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--rose)'
                      }}>
                        Violating excerpt: "{finding.relevant_text}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Unverifiable Claims */}
          {activeTab === 'claims' && review && (
            <div>
              {review.unverifiable_claims.length === 0 ? (
                <div className="empty-state">
                  <CheckCheck size={48} color="var(--emerald)" style={{ margin: '0 auto 12px auto' }} />
                  <h3>No Unverifiable Claims Detected</h3>
                  <p>Listing contains no unsubstantiated health, superlative, or financial claims.</p>
                </div>
              ) : (
                review.unverifiable_claims.map((claim, idx) => (
                  <div key={idx} className="finding-card high">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <StatusBadge severity="HIGH" />
                      <span className="finding-citation-pill">
                        Field: {claim.field}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', marginBottom: '6px', color: 'var(--amber)' }}>
                      Claim: "{claim.claim}"
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <strong>Audit Issue: </strong>{claim.reason}
                    </p>
                    <div style={{ 
                      background: 'rgba(16, 185, 129, 0.08)', 
                      padding: '8px 12px', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.825rem',
                      color: '#a7f3d0'
                    }}>
                      <strong>Compliant Guidance: </strong>{claim.recommendation}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 5: Preserved Audit & Approval History */}
          {activeTab === 'history' && (
            <div id="audit-history-timeline">
              {auditLogs.length === 0 ? (
                <div className="empty-state">
                  <p>No recorded audit events yet.</p>
                </div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} style={{ 
                    borderBottom: '1px solid var(--border-subtle)', 
                    padding: '14px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        {log.action}
                        {log.field_name && <span style={{ color: 'var(--primary)', marginLeft: '6px' }}>({log.field_name})</span>}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Reviewer: <strong style={{ color: 'var(--text-main)' }}>{log.reviewer}</strong>
                    </div>
                    {log.notes && (
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        "{log.notes}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} id="btn-done-review">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

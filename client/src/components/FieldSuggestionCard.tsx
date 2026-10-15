import React, { useState } from 'react';
import { FieldSuggestion, FieldDecisionStatus } from '../types/index.js';
import { Check, Edit3, X, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface FieldSuggestionCardProps {
  suggestion: FieldSuggestion;
  fieldName: string;
  onDecision: (decision: 'accepted' | 'edited' | 'rejected', editedValue?: any) => Promise<void>;
  isSubmitting?: boolean;
}

export const FieldSuggestionCard: React.FC<FieldSuggestionCardProps> = ({
  suggestion,
  fieldName,
  onDecision,
  isSubmitting = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(
    typeof suggestion.suggested === 'object'
      ? JSON.stringify(suggestion.suggested, null, 2)
      : String(suggestion.suggested)
  );

  const handleApprove = async () => {
    await onDecision('accepted');
    setIsEditing(false);
  };

  const handleReject = async () => {
    await onDecision('rejected');
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    let parsed: any = editValue;
    if (typeof suggestion.original === 'number') {
      parsed = Number(editValue);
    } else if (typeof suggestion.original === 'object' && Array.isArray(suggestion.original)) {
      try {
        parsed = JSON.parse(editValue);
      } catch {
        parsed = editValue.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (typeof suggestion.original === 'object') {
      try {
        parsed = JSON.parse(editValue);
      } catch {
        parsed = editValue;
      }
    }

    await onDecision('edited', parsed);
    setIsEditing(false);
  };

  const formatDisplay = (val: any) => {
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val, null, 2);
    }
    return String(val || '');
  };

  const currentDisplayValue = suggestion.status === 'edited' && suggestion.user_edited_value !== undefined
    ? suggestion.user_edited_value
    : suggestion.suggested;

  return (
    <div className="suggestion-card" id={`suggestion-card-${fieldName}`}>
      <div className="suggestion-header">
        <div className="field-name-title">
          <Sparkles size={16} color="var(--primary)" />
          <span>{fieldName}</span>
        </div>

        <div>
          {suggestion.status === 'accepted' && (
            <span className="badge badge-compliant" id={`status-${fieldName}-accepted`}>
              <CheckCircle2 size={12} /> Accepted
            </span>
          )}
          {suggestion.status === 'edited' && (
            <span className="badge badge-medium" id={`status-${fieldName}-edited`}>
              <Edit3 size={12} /> User Edited
            </span>
          )}
          {suggestion.status === 'rejected' && (
            <span className="badge badge-critical" id={`status-${fieldName}-rejected`}>
              <XCircle size={12} /> Rejected
            </span>
          )}
          {suggestion.status === 'pending' && (
            <span className="badge badge-low" id={`status-${fieldName}-pending`}>
              Pending Review
            </span>
          )}
        </div>
      </div>

      <div className="suggestion-grid">
        <div className="val-box">
          <div className="val-box-label">
            <span>Original Content</span>
          </div>
          <div className="val-content" style={{ color: 'var(--text-muted)' }}>
            {formatDisplay(suggestion.original)}
          </div>
        </div>

        <div className="val-box" style={{ borderColor: isEditing ? 'var(--primary)' : 'var(--border-subtle)' }}>
          <div className="val-box-label">
            <span>{isEditing ? 'Editing Suggestion' : 'AI Suggested Rewrite'}</span>
            {!isEditing && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting}
                id={`btn-edit-${fieldName}`}
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
              >
                <Edit3 size={12} /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div>
              <textarea
                className="search-input"
                id={`input-edit-${fieldName}`}
                style={{ width: '100%', minHeight: '90px', fontFamily: 'var(--font-sans)', padding: '10px' }}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  id={`btn-save-edit-${fieldName}`}
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                >
                  Save & Apply
                </button>
              </div>
            </div>
          ) : (
            <div className="val-content" style={{ color: '#86efac' }}>
              {formatDisplay(currentDisplayValue)}
            </div>
          )}
        </div>
      </div>

      <div className="suggestion-rationale">
        <strong>Policy Rationale: </strong> {suggestion.rationale}
      </div>

      {!isEditing && (
        <div className="suggestion-actions">
          <button
            className="btn btn-rose btn-sm"
            id={`btn-reject-${fieldName}`}
            onClick={handleReject}
            disabled={isSubmitting || suggestion.status === 'rejected'}
          >
            <X size={14} /> Reject
          </button>
          <button
            className="btn btn-emerald btn-sm"
            id={`btn-approve-${fieldName}`}
            onClick={handleApprove}
            disabled={isSubmitting || suggestion.status === 'accepted'}
          >
            <Check size={14} /> Approve Suggestion
          </button>
        </div>
      )}
    </div>
  );
};

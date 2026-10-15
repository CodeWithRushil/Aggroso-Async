import React, { useState, useEffect, useMemo } from 'react';
import { PolicySection } from '../types/index.js';
import { fetchPolicies } from '../services/api.js';
import { StatusBadge } from './StatusBadge.js';
import { X, Search, BookOpen, Check, AlertOctagon } from 'lucide-react';

interface PolicyExplorerModalProps {
  initialPolicyId?: string;
  onClose: () => void;
}

export const PolicyExplorerModal: React.FC<PolicyExplorerModalProps> = ({
  initialPolicyId,
  onClose
}) => {
  const [policies, setPolicies] = useState<PolicySection[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialPolicyId || '');
  const [selectedDoc, setSelectedDoc] = useState<'ALL' | 'Marketplace Policy' | 'Brand-Content Guide'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPolicies()
      .then(data => {
        setPolicies(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed loading policies:', err);
        setIsLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return policies.filter(p => {
      if (selectedDoc !== 'ALL' && p.doc !== selectedDoc) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.section.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.keywords.some(k => k.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [policies, selectedDoc, searchTerm]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} id="policy-explorer-modal">
      <div className="modal-content modal-content-large">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--primary)" /> Marketplace Policy & Brand Guide Explorer
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Comprehensive regulatory standards, brand voice rules, and citation references
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} id="btn-close-policy-modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Search & Document Selector */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: '260px' }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search policies by keyword (e.g. replica, MP-1.2, health, emoji)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                id="input-search-policies"
              />
            </div>

            <div className="filter-pills">
              <button
                className={`filter-pill ${selectedDoc === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedDoc('ALL')}
              >
                All Rules ({policies.length})
              </button>
              <button
                className={`filter-pill ${selectedDoc === 'Marketplace Policy' ? 'active' : ''}`}
                onClick={() => setSelectedDoc('Marketplace Policy')}
              >
                Marketplace Policies
              </button>
              <button
                className={`filter-pill ${selectedDoc === 'Brand-Content Guide' ? 'active' : ''}`}
                onClick={() => setSelectedDoc('Brand-Content Guide')}
              >
                Brand-Content Guides
              </button>
            </div>
          </div>

          {/* Policy Cards List */}
          {isLoading ? (
            <div className="empty-state">
              <div className="loading-spinner"></div>
              <p>Loading policy standards...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>No policy guidelines match your query "{searchTerm}".</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {filtered.map(policy => (
                <div 
                  key={policy.id} 
                  className={`finding-card ${policy.default_severity.toLowerCase()}`}
                  id={`policy-card-${policy.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="finding-citation-pill" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {policy.id}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {policy.section}
                      </span>
                    </div>
                    <StatusBadge severity={policy.default_severity} />
                  </div>

                  <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>{policy.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '12px' }}>
                    {policy.full_text}
                  </p>

                  {/* Examples Comparison Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                    <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid var(--rose-border)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <AlertOctagon size={14} /> NON-COMPLIANT EXAMPLES
                      </div>
                      <ul style={{ fontSize: '0.8rem', color: '#fca5a5', paddingLeft: '16px', lineHeight: 1.5 }}>
                        {policy.examples_bad.map((ex, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>"{ex}"</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--emerald-border)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Check size={14} /> COMPLIANT BEST PRACTICES
                      </div>
                      <ul style={{ fontSize: '0.8rem', color: '#86efac', paddingLeft: '16px', lineHeight: 1.5 }}>
                        {policy.examples_good.map((ex, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>"{ex}"</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

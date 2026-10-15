import React, { useState, useMemo } from 'react';
import { Listing, ListingStatus } from '../types/index.js';
import { StatusBadge } from './StatusBadge.js';
import { Search, Eye, RotateCw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ListingTableProps {
  listings: Listing[];
  isLoading: boolean;
  onSelectListing: (listing: Listing) => void;
  onRerunReview: (listingId: string) => Promise<void>;
}

export const ListingTable: React.FC<ListingTableProps> = ({
  listings,
  isLoading,
  onSelectListing,
  onRerunReview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ListingStatus>('ALL');
  const [rerunningId, setRerunningId] = useState<string | null>(null);

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSeller = item.seller.toLowerCase().includes(q);
        const inCategory = item.category.toLowerCase().includes(q);
        return inTitle || inSeller || inCategory;
      }

      return true;
    });
  }, [listings, statusFilter, searchTerm]);

  const handleRerun = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRerunningId(id);
    try {
      await onRerunReview(id);
    } finally {
      setRerunningId(null);
    }
  };

  return (
    <div>
      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, seller, or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            id="input-search-listings"
          />
        </div>

        <div className="filter-pills" id="filter-pills-container">
          <button
            className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
            id="filter-pill-all"
          >
            All ({listings.length})
          </button>
          <button
            className={`filter-pill ${statusFilter === 'FLAGGED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('FLAGGED')}
            id="filter-pill-flagged"
          >
            Flagged ({listings.filter(l => l.status === 'FLAGGED').length})
          </button>
          <button
            className={`filter-pill ${statusFilter === 'NEEDS_REVISION' ? 'active' : ''}`}
            onClick={() => setStatusFilter('NEEDS_REVISION')}
            id="filter-pill-revision"
          >
            Needs Revision ({listings.filter(l => l.status === 'NEEDS_REVISION').length})
          </button>
          <button
            className={`filter-pill ${statusFilter === 'COMPLIANT' ? 'active' : ''}`}
            onClick={() => setStatusFilter('COMPLIANT')}
            id="filter-pill-compliant"
          >
            Compliant ({listings.filter(l => l.status === 'COMPLIANT').length})
          </button>
          <button
            className={`filter-pill ${statusFilter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
            id="filter-pill-approved"
          >
            Approved ({listings.filter(l => l.status === 'APPROVED').length})
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        {isLoading ? (
          <div className="empty-state">
            <div className="loading-spinner" style={{ width: '36px', height: '36px', marginBottom: '14px' }}></div>
            <p>Loading marketplace listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={48} color="var(--amber)" style={{ margin: '0 auto 12px auto' }} />
            <h3>No Listings Found</h3>
            <p>No listings match your current search or status filter.</p>
            {(searchTerm || statusFilter !== 'ALL') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                style={{ marginTop: '14px' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <table className="listings-table" id="table-listings">
            <thead>
              <tr>
                <th>Listing Details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Quality Score</th>
                <th>Findings</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map(item => {
                const review = item.latest_review;
                return (
                  <tr 
                    key={item.id} 
                    onClick={() => onSelectListing(item)}
                    style={{ cursor: 'pointer' }}
                    id={`listing-row-${item.id}`}
                  >
                    <td className="table-title-cell">
                      <div className="listing-primary-title" title={item.title}>
                        {item.title}
                      </div>
                      <div className="listing-meta-row">
                        <span>Seller: <strong style={{ color: 'var(--text-main)' }}>{item.seller}</strong></span>
                        <span>•</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.category}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        ${Number(item.price).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td>
                      {review ? (
                        <StatusBadge score={review.overall_score} />
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Unreviewed</span>
                      )}
                    </td>

                    <td>
                      {review ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {review.critical_count > 0 && (
                            <span className="badge badge-critical" title="Critical Policy Violations">
                              <ShieldAlert size={11} /> {review.critical_count}
                            </span>
                          )}
                          {review.high_count > 0 && (
                            <span className="badge badge-high" title="High Severity Issues">
                              {review.high_count}
                            </span>
                          )}
                          {review.findings_count === 0 && (
                            <span className="badge badge-compliant">Clean</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>-</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => handleRerun(e, item.id)}
                          disabled={rerunningId === item.id}
                          title="Re-run AI Quality Assessment"
                          id={`btn-rerun-${item.id}`}
                        >
                          <RotateCw size={13} className={rerunningId === item.id ? 'loading-spinner' : ''} />
                        </button>

                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onSelectListing(item)}
                          id={`btn-review-${item.id}`}
                        >
                          <Eye size={13} /> Review
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

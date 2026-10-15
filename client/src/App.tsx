import React, { useState, useEffect } from 'react';
import { 
  Listing, 
  ReviewReport, 
  AuditLogEntry, 
  FieldDecisionStatus 
} from './types/index.js';
import { 
  fetchListings, 
  fetchListingDetails, 
  rerunReview, 
  submitFieldDecision, 
  finalizeListingReview 
} from './services/api.js';

import { Header } from './components/Header.js';
import { ListingTable } from './components/ListingTable.js';
import { ListingReviewModal } from './components/ListingReviewModal.js';
import { NewListingModal } from './components/NewListingModal.js';
import { BatchProcessorModal } from './components/BatchProcessorModal.js';
import { PolicyExplorerModal } from './components/PolicyExplorerModal.js';
import { LiveLogDrawer } from './components/LiveLogDrawer.js';

import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  ListFilter 
} from 'lucide-react';

export const App: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Review Workspace State
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Modal Visibility States
  const [isNewListingOpen, setIsNewListingOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyInitialId, setPolicyInitialId] = useState<string | undefined>(undefined);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const loadListings = async () => {
    try {
      const data = await fetchListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleSelectListing = async (item: Listing) => {
    try {
      const details = await fetchListingDetails(item.id);
      setSelectedListing(details.listing);
      setSelectedReview(details.review);
      setAuditLogs(details.auditLogs);
    } catch (err) {
      console.error('Failed to load listing details:', err);
    }
  };

  const handleFieldDecision = async (
    field: string, 
    decision: 'accepted' | 'edited' | 'rejected', 
    editedValue?: any
  ) => {
    if (!selectedListing || !selectedReview) return;

    try {
      const res = await submitFieldDecision(selectedReview.id, {
        listingId: selectedListing.id,
        field,
        decision,
        editedValue,
        reviewer: 'Quality Lead Analyst',
        notes: `User decided ${decision.toUpperCase()} on field "${field}"`
      });

      setSelectedListing(res.listing);
      setSelectedReview(res.review);
      setAuditLogs(res.auditLogs);
      await loadListings();
    } catch (err) {
      console.error('Failed updating field decision:', err);
    }
  };

  const handleFinalize = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedListing || !selectedReview) return;

    try {
      const res = await finalizeListingReview(selectedReview.id, {
        listingId: selectedListing.id,
        decision,
        reviewer: 'Quality Lead Analyst',
        notes: `Listing status finalized as ${decision}`
      });

      setSelectedListing(res.listing);
      setAuditLogs(res.auditLogs);
      await loadListings();
    } catch (err) {
      console.error('Failed finalizing review:', err);
    }
  };

  const handleRerunReview = async (listingId?: string) => {
    const targetId = listingId || selectedListing?.id;
    if (!targetId) return;

    try {
      const res = await rerunReview(targetId, 'Manual Quality Audit');
      if (selectedListing && selectedListing.id === targetId) {
        setSelectedListing(res.listing);
        setSelectedReview(res.review);
        const details = await fetchListingDetails(targetId);
        setAuditLogs(details.auditLogs);
      }
      await loadListings();
    } catch (err) {
      console.error('Failed rerunning review:', err);
    }
  };

  const handleListingCreated = async (newListing: Listing) => {
    setIsNewListingOpen(false);
    await loadListings();
    await handleSelectListing(newListing);
  };

  const handleOpenPolicyExplorer = (policyId?: string) => {
    setPolicyInitialId(policyId);
    setIsPolicyOpen(true);
  };

  // Metrics computation
  const totalCount = listings.length;
  const flaggedCount = listings.filter(l => l.status === 'FLAGGED').length;
  const revisionCount = listings.filter(l => l.status === 'NEEDS_REVISION').length;
  const compliantCount = listings.filter(l => l.status === 'COMPLIANT' || l.status === 'APPROVED').length;

  return (
    <div className="app-container">
      {/* Top Navigation & Brand Header */}
      <Header
        onNewListing={() => setIsNewListingOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        onOpenPolicies={() => handleOpenPolicyExplorer()}
        onOpenLogs={() => setIsLogsOpen(true)}
      />

      {/* KPI Metrics Dashboard Cards */}
      <section className="stats-grid" id="stats-overview">
        <div className="stat-card" id="card-stat-total">
          <div className="stat-card-top">
            <span className="stat-label">Total Listings</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <ListFilter size={18} />
            </div>
          </div>
          <div className="stat-value">{totalCount}</div>
          <div className="stat-subtext">Active catalog inventory items</div>
        </div>

        <div className="stat-card" id="card-stat-flagged">
          <div className="stat-card-top">
            <span className="stat-label" style={{ color: 'var(--rose)' }}>Policy Flagged</span>
            <div className="stat-icon" style={{ background: 'var(--rose-bg)', color: 'var(--rose)' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--rose)' }}>{flaggedCount}</div>
          <div className="stat-subtext">Critical policy & prohibited violations</div>
        </div>

        <div className="stat-card" id="card-stat-revision">
          <div className="stat-card-top">
            <span className="stat-label" style={{ color: 'var(--amber)' }}>Needs Revision</span>
            <div className="stat-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{revisionCount}</div>
          <div className="stat-subtext">Unverifiable claims or brand voice flaws</div>
        </div>

        <div className="stat-card" id="card-stat-compliant">
          <div className="stat-card-top">
            <span className="stat-label" style={{ color: 'var(--emerald)' }}>Compliant / Approved</span>
            <div className="stat-icon" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald)' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--emerald)' }}>{compliantCount}</div>
          <div className="stat-subtext">Verified marketplace ready standards</div>
        </div>
      </section>

      {/* Main Listings Catalog Workspace */}
      <main>
        <ListingTable
          listings={listings}
          isLoading={isLoading}
          onSelectListing={handleSelectListing}
          onRerunReview={handleRerunReview}
        />
      </main>

      {/* Detail Review Modal */}
      {selectedListing && (
        <ListingReviewModal
          listing={selectedListing}
          review={selectedReview}
          auditLogs={auditLogs}
          onClose={() => setSelectedListing(null)}
          onFieldDecision={handleFieldDecision}
          onFinalize={handleFinalize}
          onRerunReview={() => handleRerunReview(selectedListing.id)}
          onOpenPolicyExplorer={handleOpenPolicyExplorer}
        />
      )}

      {/* New Listing Modal */}
      {isNewListingOpen && (
        <NewListingModal
          onClose={() => setIsNewListingOpen(false)}
          onListingCreated={handleListingCreated}
        />
      )}

      {/* Batch Processing Modal */}
      {isBatchOpen && (
        <BatchProcessorModal
          onClose={() => setIsBatchOpen(false)}
          onBatchCompleted={loadListings}
        />
      )}

      {/* Policy Guide Modal */}
      {isPolicyOpen && (
        <PolicyExplorerModal
          initialPolicyId={policyInitialId}
          onClose={() => { setIsPolicyOpen(false); setPolicyInitialId(undefined); }}
        />
      )}

      {/* Live AI Logs Drawer */}
      {isLogsOpen && (
        <LiveLogDrawer
          onClose={() => setIsLogsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

import React from 'react';
import { 
  ShieldCheck, 
  PlusCircle, 
  Layers, 
  BookOpen, 
  Terminal 
} from 'lucide-react';

interface HeaderProps {
  onNewListing: () => void;
  onOpenBatch: () => void;
  onOpenPolicies: () => void;
  onOpenLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewListing,
  onOpenBatch,
  onOpenPolicies,
  onOpenLogs
}) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <ShieldCheck size={26} />
        </div>
        <div>
          <h1 className="brand-title">Aggroso Quality Guard</h1>
          <div className="brand-subtitle">Marketplace Policy & Brand Content Review System</div>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onOpenLogs}
          id="btn-live-logs"
          title="Inspect structured application & AI workflow logs"
        >
          <Terminal size={15} /> AI Logs
        </button>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onOpenPolicies}
          id="btn-policy-guide"
          title="Browse Marketplace Policy & Brand-Content Guide"
        >
          <BookOpen size={15} /> Policy Guide
        </button>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onOpenBatch}
          id="btn-batch-ops"
          title="Run review on small batch of listings"
        >
          <Layers size={15} /> Batch Review
        </button>

        <button 
          className="btn btn-primary btn-sm" 
          onClick={onNewListing}
          id="btn-new-listing"
          title="Submit new listing for policy verification"
        >
          <PlusCircle size={15} /> + New Listing
        </button>
      </div>
    </header>
  );
};

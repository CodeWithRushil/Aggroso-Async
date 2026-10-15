import React, { useState } from 'react';
import { BatchReviewSummary, BatchProcessingItem } from '../types/index.js';
import { processBatchReview } from '../services/api.js';
import { StatusBadge } from './StatusBadge.js';
import { X, Play, Upload, CheckCircle2, AlertOctagon } from 'lucide-react';

interface BatchProcessorModalProps {
  onClose: () => void;
  onBatchCompleted: () => void;
}

export const BatchProcessorModal: React.FC<BatchProcessorModalProps> = ({
  onClose,
  onBatchCompleted
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<BatchReviewSummary | null>(null);
  const [items, setItems] = useState<BatchProcessingItem[]>([]);
  const [customJson, setCustomJson] = useState('');
  const [inputMode, setInputMode] = useState<'all' | 'custom'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleBatchData = [
    {
      title: 'Bose QuietComfort 45 Bluetooth Headphones',
      description: 'Authentic noise cancelling headphones with awareness mode and 24 hour battery life.',
      category: 'Electronics',
      price: 229.00,
      seller: 'Premier Electronics',
      attributes: { 'Brand': 'Bose', 'Condition': 'Brand New' }
    },
    {
      title: 'Gucci Leather Belt 1:1 Mirror Copy AAA Rep',
      description: 'Super high quality fake replica gucci belt. Do not buy here, WhatsApp me at +1555-8888 for Western Union payment.',
      category: 'Apparel & Accessories',
      price: 65.00,
      seller: 'ReplicaWarehouse',
      attributes: { 'Type': 'Replica' }
    },
    {
      title: 'Organic Green Detox Tea - Instant 20lb Weight Loss',
      description: '100% cures metabolic syndrome and guarantees you lose 20 pounds in 4 days with zero diet.',
      category: 'Beauty & Health',
      price: 29.99,
      seller: 'SlimFast Remedies',
      attributes: { 'Flavor': 'Mint' }
    }
  ];

  const handleStartBatch = async () => {
    setIsProcessing(true);
    setProgress(15);
    setErrorMsg(null);

    try {
      let payload: any = {};
      if (inputMode === 'custom') {
        if (!customJson.trim()) {
          throw new Error('Please enter or paste listing JSON data.');
        }
        const parsed = JSON.parse(customJson);
        payload.newListings = Array.isArray(parsed) ? parsed : [parsed];
      }

      setProgress(45);
      const res = await processBatchReview(payload);
      setProgress(100);
      setSummary(res.summary);
      setItems(res.items);
      onBatchCompleted();
    } catch (err: any) {
      setErrorMsg(err.message || 'Batch review failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = () => {
    setInputMode('custom');
    setCustomJson(JSON.stringify(sampleBatchData, null, 2));
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} id="batch-processor-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem' }}>Batch Listing Quality Evaluation</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Evaluate multiple listings concurrently against marketplace policies and brand rules
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} id="btn-close-batch-modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{ 
              background: 'var(--rose-bg)', 
              border: '1px solid var(--rose-border)', 
              color: 'var(--rose)', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '0.85rem'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Mode Selector */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <button
              className={`btn btn-sm ${inputMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setInputMode('all')}
              id="btn-mode-all"
            >
              Process All Existing Listings
            </button>
            <button
              className={`btn btn-sm ${inputMode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setInputMode('custom')}
              id="btn-mode-custom"
            >
              Upload / Import Batch JSON
            </button>
            {inputMode === 'custom' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleLoadSample}
                id="btn-load-sample-batch"
              >
                Load Sample Test Batch
              </button>
            )}
          </div>

          {inputMode === 'custom' && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Paste JSON Array of Listings:
              </label>
              <textarea
                className="search-input"
                style={{ width: '100%', minHeight: '140px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                placeholder='[ { "title": "Product Title", "description": "...", "category": "Electronics", "price": 49.99, "seller": "Store" } ]'
                value={customJson}
                onChange={e => setCustomJson(e.target.value)}
                id="textarea-batch-json"
              />
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span>Running AI & Deterministic Policy Review Engine...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${progress}%`, 
                    background: 'linear-gradient(90deg, var(--primary), var(--cyan))',
                    transition: 'width 300ms ease'
                  }} 
                />
              </div>
            </div>
          )}

          {/* Results Summary */}
          {summary && (
            <div style={{ 
              background: 'var(--bg-elevated)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px', 
              marginBottom: '20px' 
            }} id="batch-results-summary">
              <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--emerald)" /> Batch Processing Completed
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>TOTAL</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{summary.total}</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>COMPLIANT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald)' }}>{summary.compliant}</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--amber)' }}>REVISION</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber)' }}>{summary.needsRevision}</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--rose)' }}>FLAGGED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--rose)' }}>{summary.flagged}</div>
                </div>
              </div>
            </div>
          )}

          {/* Processed Items List */}
          {items.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Processed Items:</h4>
              <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 14px', 
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{ maxWidth: '60%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {item.score !== undefined && <StatusBadge score={item.score} />}
                      {item.review_status && <StatusBadge status={item.review_status as any} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={handleStartBatch}
            disabled={isProcessing}
            id="btn-run-batch-review"
          >
            <Play size={15} /> {isProcessing ? 'Processing Batch...' : 'Run Batch Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

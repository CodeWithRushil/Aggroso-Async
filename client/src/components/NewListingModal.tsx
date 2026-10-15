import React, { useState } from 'react';
import { Listing } from '../types/index.js';
import { createListing } from '../services/api.js';
import { X, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';

interface NewListingModalProps {
  onClose: () => void;
  onListingCreated: (listing: Listing) => void;
}

const SUPPORTED_CATEGORIES = [
  'Electronics',
  'Apparel & Accessories',
  'Home & Living',
  'Beauty & Health',
  'Sports & Outdoors',
  'Books & Media',
  'Tools & Hardware',
  'Services & Digital'
];

export const NewListingModal: React.FC<NewListingModalProps> = ({
  onClose,
  onListingCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('49.99');
  const [seller, setSeller] = useState('MyStore Official');
  const [tagsInput, setTagsInput] = useState('wireless, audio');
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([
    { key: 'Brand', value: 'ProTech' },
    { key: 'Condition', value: 'Brand New' },
    { key: 'Warranty', value: '1-Year Limited Warranty' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const handleRemoveAttribute = (idx: number) => {
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  const handleAttributeChange = (idx: number, field: 'key' | 'value', val: string) => {
    const next = [...attributes];
    next[idx][field] = val;
    setAttributes(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick checks
    if (!title.trim() || !description.trim() || !seller.trim()) {
      setErrorMessage('Please fill in all required fields (Title, Description, Seller).');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Price must be a valid positive number.');
      return;
    }

    const attrRecord: Record<string, string> = {};
    for (const item of attributes) {
      if (item.key.trim() && item.value.trim()) {
        attrRecord[item.key.trim()] = item.value.trim();
      }
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      const res = await createListing({
        title,
        description,
        category,
        price: priceNum,
        attributes: attrRecord,
        seller,
        tags
      });

      onListingCreated(res.listing);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} id="new-listing-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--primary)" /> Submit New Listing for Quality Review
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Deterministic schema validation and AI policy checks run automatically upon creation
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} id="btn-close-new-modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMessage && (
              <div style={{ 
                background: 'var(--rose-bg)', 
                border: '1px solid var(--rose-border)', 
                color: 'var(--rose)', 
                padding: '10px 14px', 
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }} id="new-listing-error-banner">
                <AlertCircle size={16} /> {errorMessage}
              </div>
            )}

            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>Listing Title *</label>
                <span style={{ fontSize: '0.75rem', color: title.length < 10 ? 'var(--amber)' : title.length > 150 ? 'var(--rose)' : 'var(--text-dim)' }}>
                  {title.length}/150 chars (min 10)
                </span>
              </div>
              <input
                type="text"
                className="search-input"
                id="input-title"
                placeholder="e.g. Anker 100W USB-C GaN Fast Charger"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category & Price Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Marketplace Category *
                </label>
                <select
                  className="search-input"
                  id="select-category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ background: 'var(--bg-card)' }}
                >
                  {SUPPORTED_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Price (USD $) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  max="1000000"
                  className="search-input"
                  id="input-price"
                  placeholder="49.99"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Seller */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Seller Store Identifier *
              </label>
              <input
                type="text"
                className="search-input"
                id="input-seller"
                placeholder="Store / Vendor name"
                value={seller}
                onChange={e => setSeller(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>Description *</label>
                <span style={{ fontSize: '0.75rem', color: description.length < 30 ? 'var(--amber)' : description.length > 3000 ? 'var(--rose)' : 'var(--text-dim)' }}>
                  {description.length}/3000 chars (min 30)
                </span>
              </div>
              <textarea
                className="search-input"
                id="input-description"
                placeholder="Provide comprehensive details, key specifications, and materials..."
                style={{ width: '100%', minHeight: '100px', lineHeight: 1.5 }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Structured Attributes Builder */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>Product Attributes / Specifications</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={handleAddAttribute}
                  id="btn-add-attribute"
                >
                  <Plus size={12} /> Add Attribute
                </button>
              </div>

              {attributes.map((attr, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="search-input"
                    style={{ flex: 1 }}
                    placeholder="Key (e.g. Color, Battery)"
                    value={attr.key}
                    onChange={e => handleAttributeChange(idx, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="search-input"
                    style={{ flex: 1.5 }}
                    placeholder="Value (e.g. Matte Black, 5000 mAh)"
                    value={attr.value}
                    onChange={e => handleAttributeChange(idx, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-rose btn-sm"
                    onClick={() => handleRemoveAttribute(idx)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Optional Tags */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Optional Search Tags (comma separated)
              </label>
              <input
                type="text"
                className="search-input"
                id="input-tags"
                placeholder="charger, usb-c, 100w, travel"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="btn-submit-listing"
            >
              {isSubmitting ? 'Evaluating Policy...' : 'Submit & Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

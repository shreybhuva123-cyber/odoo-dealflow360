import React, { useState } from 'react';
import { showToast } from '@/stores/toast.store';

interface QuoteLine {
  product: string;
  badge?: string;
  qty: number;
  unitPrice: number;
  discount: number;
  total: number;
  comment?: string;
}

export function CustomerQuotePortalPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [counterDisc, setCounterDisc] = useState('');
  const [submittedRequests, setSubmittedRequests] = useState<string[]>([]);
  const [commentModalProduct, setCommentModalProduct] = useState<string | null>(null);
  const [lineComment, setLineComment] = useState('');

  const [lines, setLines] = useState<QuoteLine[]>([
    {
      product: 'ProLaptop X1',
      qty: 40,
      unitPrice: 1200,
      discount: 14,
      total: 41280,
    },
    {
      product: 'UltraDisplay 4K',
      qty: 40,
      unitPrice: 480,
      discount: 14,
      total: 16512,
    },
    {
      product: 'CloudBase Pro',
      badge: 'Monthly',
      qty: 40,
      unitPrice: 299,
      discount: 12,
      total: 10523,
    },
    {
      product: 'Extended Warranty',
      qty: 40,
      unitPrice: 60,
      discount: 10,
      total: 2160,
    },
  ]);

  const handleAddCommentClick = (prodName: string) => {
    setCommentModalProduct(prodName);
    setLineComment('');
  };

  const handleSaveLineComment = () => {
    if (!commentModalProduct) return;
    setLines((prev) =>
      prev.map((l) =>
        l.product === commentModalProduct
          ? { ...l, comment: lineComment || 'Customer feedback attached' }
          : l
      )
    );
    showToast(`Comment added for ${commentModalProduct} line`, 'blue');
    setCommentModalProduct(null);
  };

  const handleSubmitNegotiation = () => {
    if (!commentText.trim() && !counterDisc.trim()) {
      showToast('Please add a comment or counter discount', 'red');
      return;
    }

    const note = counterDisc.trim()
      ? `Counter discount requested: ${counterDisc}% · "${commentText.trim() || 'Volume pricing revision'}"`
      : `Comment: "${commentText.trim()}"`;

    setSubmittedRequests((prev) => [...prev, note]);
    showToast('Request submitted — quote re-entered approval flow', 'amber');
    setCommentText('');
    setCounterDisc('');
  };

  const handleConfirmQuote = () => {
    setIsConfirmed(true);
    showToast('Quotation confirmed by customer — moving to fulfillment', 'green');
  };

  return (
    <div className="py-8 px-4" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="portal-wrap">
        {/* Header */}
        <div className="portal-header">
          <div className="portal-co">
            Quotation from DealFlow360 on behalf of your Sales Rep (Alex Morgan)
          </div>
          <div className="portal-title">Q-1040 · Vertex LLC</div>
          <div className="portal-meta">
            <span>📅 Valid until Sep 30, 2026</span>
            <span>💰 Total: $91,000</span>
            <span>🏅 Gold Tier</span>
            <span>
              {isConfirmed ? (
                <span className="badge badge-green">Confirmed & Accepted ✓</span>
              ) : (
                <span className="badge badge-blue">Under Negotiation</span>
              )}
            </span>
          </div>
        </div>

        {/* Quote Lines Card */}
        <div className="card mb-4">
          <div className="card-header">
            <div className="card-title">Quote Lines</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {lines.length} Line Items
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.product}>
                    <td className="td-bold">
                      {l.product}{' '}
                      {l.badge && (
                        <span className="badge badge-blue" style={{ marginLeft: '4px' }}>
                          {l.badge}
                        </span>
                      )}
                      {l.comment && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: 'var(--amber)',
                            fontWeight: 400,
                            marginTop: '2px',
                          }}
                        >
                          💬 {l.comment}
                        </div>
                      )}
                    </td>
                    <td>{l.qty}</td>
                    <td>${l.unitPrice.toLocaleString()}</td>
                    <td>{l.discount}%</td>
                    <td>${l.total.toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleAddCommentClick(l.product)}
                      >
                        💬 Comment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Previous Requests if any */}
        {submittedRequests.length > 0 && (
          <div className="card mb-4" style={{ background: 'var(--surface2)' }}>
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '12px' }}>
                Your Submitted Requests
              </div>
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {submittedRequests.map((req, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '11px',
                    color: 'var(--text)',
                    padding: '6px 0',
                    borderBottom:
                      i < submittedRequests.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  ⏳ {req}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Negotiation Box */}
        <div className="negotiation-box">
          <div className="neg-title">Request a Change or Counter Offer</div>
          <textarea
            className="neg-input"
            id="negComment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isConfirmed}
            placeholder="Describe your request — e.g. 'We need 18% discount on hardware given our volume' or ask a question about a specific line..."
          />
          <div className="neg-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <label
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                Counter discount:
              </label>
              <input
                style={{
                  width: '70px',
                  background: 'var(--surface3)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text)',
                  padding: '5px 8px',
                  fontSize: '12px',
                }}
                placeholder="18%"
                id="counterDisc"
                value={counterDisc}
                onChange={(e) => setCounterDisc(e.target.value)}
                disabled={isConfirmed}
              />
            </div>
            <button
              className="btn btn-warning"
              onClick={handleSubmitNegotiation}
              disabled={isConfirmed}
            >
              Submit Request
            </button>
            <button
              className="btn btn-success"
              onClick={handleConfirmQuote}
              disabled={isConfirmed}
            >
              {isConfirmed ? 'Quotation Confirmed ✓' : 'Confirm Quotation ✓'}
            </button>
          </div>
        </div>
      </div>

      {/* Line Comment Modal */}
      {commentModalProduct && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">Add Note for {commentModalProduct}</div>
              <button className="modal-close" onClick={() => setCommentModalProduct(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="field-group">
                <label className="field-label">Note / Question for Sales Rep</label>
                <textarea
                  className="field-input"
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                  value={lineComment}
                  onChange={(e) => setLineComment(e.target.value)}
                  placeholder="e.g. Can this be delivered in 2 batches? Or can payment be net-45?"
                />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setCommentModalProduct(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveLineComment}>
                Save Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

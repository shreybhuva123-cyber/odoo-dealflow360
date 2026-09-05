import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Customer, QuotationLine, Quotation } from '@/types';
import { CustomerSelector } from '@/components/dealflow/CustomerSelector';
import { ProductSelector } from '@/components/dealflow/ProductSelector';
import { QuotationLineTable } from '@/components/dealflow/QuotationLineTable';
import { PricingSummary } from '@/components/dealflow/PricingSummary';
import { RiskIndicator } from '@/components/dealflow/RiskIndicator';
import { RecommendationPanel } from '@/components/dealflow/RecommendationPanel';
import { useRecommendations, useCreateQuotation } from '@/hooks/useQuotations';
import { DealRecommendation } from '@/services/api/recommendations.api';
import { showToast } from '@/stores/toast.store';
import { ROUTES } from '@/constants/routes';

export function QuotationCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateQuotation();

  // Active Wizard Step: 1 = Customer, 2 = Products, 3 = Pricing, 4 = Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Quote Data
  const [quoteNumber] = useState(`Q-${Math.floor(1043 + Math.random() * 900)}`);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [lines, setLines] = useState<QuotationLine[]>([]);

  // Recommendations
  const { data: rawRecs = [] } = useRecommendations('new');
  const [recommendations, setRecommendations] = useState<DealRecommendation[]>([]);

  useEffect(() => {
    if (rawRecs.length > 0 && recommendations.length === 0) {
      setRecommendations(rawRecs);
    }
  }, [rawRecs]);

  // Economic summary state
  const [summary, setSummary] = useState({
    subtotal: 0,
    discountTotal: 0,
    taxTotal: 0,
    grandTotal: 0,
    overallMarginPct: 25,
    currency: 'USD',
  });

  const [riskScore, setRiskScore] = useState(15);
  const [approvalRequired, setApprovalRequired] = useState(false);

  const customerTier =
    customer?.companyName.includes('Acme') || customer?.companyName.includes('Vertex')
      ? 'GOLD'
      : customer?.companyName.includes('Beta') || customer?.companyName.includes('TechCorp')
      ? 'SILVER'
      : 'BRONZE';

  // Recalculate economics
  useEffect(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let totalCost = 0;
    let maxOver = 0;
    let breachCount = 0;

    lines.forEach((line) => {
      const lineSub = line.quantity * line.unitPrice;
      const lineDisc = lineSub * (line.discountPct / 100);
      subtotal += lineSub;
      discountTotal += lineDisc;
      totalCost += line.quantity * (line.costPrice || line.unitPrice * 0.7);

      const cat = (line.category || 'Hardware').toLowerCase();
      let catCeil = 15;
      if (cat.includes('service')) catCeil = 10;
      if (cat.includes('sub') || cat.includes('saas')) catCeil = 15;

      let tierCeil = 15;
      if (customerTier === 'SILVER') tierCeil = 10;
      if (customerTier === 'BRONZE') tierCeil = 5;

      const allowed = Math.min(catCeil, tierCeil);
      if (line.discountPct > allowed) {
        maxOver = Math.max(maxOver, line.discountPct - allowed);
        breachCount++;
      }
    });

    const netAfterDiscount = subtotal - discountTotal;
    const taxTotal = Math.round(netAfterDiscount * 0.18 * 100) / 100;
    const grandTotal = Math.round((netAfterDiscount + taxTotal) * 100) / 100;
    const grossProfit = netAfterDiscount - totalCost;
    const overallMarginPct =
      netAfterDiscount > 0
        ? Math.max(0, Math.min(100, Math.round((grossProfit / netAfterDiscount) * 1000) / 10))
        : 25;

    setSummary({
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      taxTotal,
      grandTotal,
      overallMarginPct,
      currency: customer?.currency || 'USD',
    });

    let score = 12;
    if (breachCount > 0) {
      score = Math.min(100, Math.round(maxOver * 4.5 + breachCount * 10 + 25));
    }
    if (overallMarginPct < 20 && netAfterDiscount > 0) {
      score = Math.min(100, score + Math.round((20 - overallMarginPct) * 1.5));
    }

    setRiskScore(score);
    setApprovalRequired(score > 25 || breachCount > 0 || overallMarginPct < 20);
  }, [lines, customerTier, customer?.currency]);

  // Line Handlers
  const handleAddProduct = (product: Product) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          id: `ql_${Date.now()}_${Math.random()}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          category: product.category,
          quantity: 1,
          unitPrice: product.basePrice,
          costPrice: product.costPrice || product.basePrice * 0.7,
          discountPct: 0,
          lineTotal: product.basePrice,
          grossMarginPct: product.minGrossMarginPct || 25,
        },
      ];
    });
    showToast(`${product.name} added to quote`, 'blue');
  };

  const handleUpdateQuantity = (lineId: string, newQty: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, quantity: Math.max(1, newQty) } : l))
    );
  };

  const handleUpdateDiscount = (lineId: string, newDiscountPct: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, discountPct: newDiscountPct } : l))
    );
  };

  const handleRemoveLine = (lineId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId));
    showToast('Product removed', 'blue');
  };

  // Recommendation Handlers
  const handleAddRecommendation = (rec: DealRecommendation) => {
    setLines((prev) => [
      ...prev,
      {
        id: `ql_rec_${Date.now()}`,
        productId: rec.productId,
        productName: rec.name,
        sku: `DF-REC-${rec.productId.toUpperCase()}`,
        category: rec.category,
        quantity: 1,
        unitPrice: rec.price,
        costPrice: rec.costPrice,
        discountPct: 0,
        lineTotal: rec.price,
        grossMarginPct: Math.round(((rec.price - rec.costPrice) / rec.price) * 100),
      },
    ]);
    setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
    showToast(`✨ ${rec.name} attached! Deal margin & revenue updated.`, 'green');
  };

  const handleDismissRecommendation = (recId: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    showToast('Recommendation dismissed', 'blue');
  };

  // Action Handlers
  const handleSaveDraft = () => {
    const payload: Partial<Quotation> = {
      quoteNumber,
      title: `${customer?.companyName || 'New'} Deal Quotation`,
      customerId: customer?.id || 'cust_acme',
      customerName: customer?.companyName || 'Acme Corporation',
      customerTier,
      status: 'DRAFT',
      lines,
      summary,
      riskScore,
      riskCategory: riskScore > 60 ? 'HIGH' : riskScore > 25 ? 'MEDIUM' : 'LOW',
      approvalRequired,
    };

    createMutation.mutate(payload, {
      onSuccess: (newQ) => {
        navigate(ROUTES.APP.QUOTATION_DETAIL(newQ.id));
      },
    });
  };

  const handleSubmitForApproval = () => {
    const payload: Partial<Quotation> = {
      quoteNumber,
      title: `${customer?.companyName || 'New'} Deal Quotation`,
      customerId: customer?.id || 'cust_acme',
      customerName: customer?.companyName || 'Acme Corporation',
      customerTier,
      status: 'PENDING_APPROVAL',
      lines,
      summary,
      riskScore,
      riskCategory: riskScore > 60 ? 'HIGH' : riskScore > 25 ? 'MEDIUM' : 'LOW',
      approvalRequired: true,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        showToast(`Quotation ${quoteNumber} submitted — routed for approval`, 'amber');
        setTimeout(() => {
          navigate(ROUTES.APP.APPROVALS);
        }, 1200);
      },
    });
  };

  const steps = [
    { num: 1, label: 'Customer', desc: 'Select buyer & tier' },
    { num: 2, label: 'Products', desc: 'Add catalog items' },
    { num: 3, label: 'Pricing & Discounts', desc: 'Quantities & margins' },
    { num: 4, label: 'Review & Submit', desc: 'AI risk & approval' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(ROUTES.APP.QUOTATIONS)}
          >
            ← Quotations
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Create New Quotation</h1>
            <p className="text-xs text-muted-foreground">
              Structured DealFlow360 Quotation Creation Wizard · Assigned: Alex Morgan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleSaveDraft}
            disabled={createMutation.isPending}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSubmitForApproval}
            disabled={createMutation.isPending || lines.length === 0}
          >
            Submit for Approval
          </button>
        </div>
      </div>

      {/* Step Indicator Header: ① Customer ── ② Products ── ③ Pricing ── ④ Review */}
      <div
        className="card p-4"
        style={{
          background: 'var(--surface)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {steps.map((s, idx) => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;

          return (
            <React.Fragment key={s.num}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  opacity: isActive ? 1 : isDone ? 0.85 : 0.5,
                }}
                onClick={() => setCurrentStep(s.num as any)}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isActive ? 'var(--accent)' : isDone ? 'var(--green-dim)' : 'var(--surface3)',
                    color: isActive ? '#fff' : isDone ? 'var(--green)' : 'var(--text-muted)',
                    border: `1px solid ${isActive ? 'var(--accent)' : isDone ? 'var(--green)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  {isDone ? '✓' : s.num}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {s.desc}
                  </div>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className="hidden md:block"
                  style={{
                    flex: 1,
                    height: '2px',
                    background: isDone ? 'var(--green)' : 'var(--border)',
                    margin: '0 8px',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP 1: CUSTOMER */}
      {currentStep === 1 && (
        <div className="card p-6 space-y-6" style={{ background: 'var(--surface)' }}>
          <div>
            <h2 className="text-sm font-bold text-foreground">Step 1: Choose or Search Account</h2>
            <p className="text-xs text-muted-foreground">
              Customer commercial tier governs allowable discount ceilings and payment terms.
            </p>
          </div>

          <CustomerSelector
            selectedCustomerId={customer?.id}
            onSelectCustomer={(c) => setCustomer(c)}
          />

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setCurrentStep(2)}
            >
              Next: Select Products →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PRODUCTS */}
      {currentStep === 2 && (
        <div className="card p-6 space-y-6" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Step 2: Add Products to Quotation</h2>
              <p className="text-xs text-muted-foreground">
                Search hardware, subscription plans, and deployment services to attach.
              </p>
            </div>
            <span className="badge badge-blue">
              {lines.length} {lines.length === 1 ? 'item selected' : 'items selected'}
            </span>
          </div>

          <ProductSelector onAddProduct={handleAddProduct} />

          {/* Quick Line Preview */}
          {lines.length > 0 && (
            <div className="p-3 rounded-lg border border-border bg-surface2 text-xs space-y-1">
              <div className="font-bold text-text-dim text-[11px] uppercase">
                Selected Lines ({lines.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {lines.map((l) => (
                  <span key={l.id} className="badge badge-gray">
                    {l.productName} × {l.quantity}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentStep(1)}
            >
              ← Back: Customer
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setCurrentStep(3)}
              disabled={lines.length === 0}
            >
              Next: Quantities & Pricing →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PRICING & DISCOUNTS */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="card p-6 space-y-6" style={{ background: 'var(--surface)' }}>
            <div>
              <h2 className="text-sm font-bold text-foreground">Step 3: Line Quantities & Discount Governance</h2>
              <p className="text-xs text-muted-foreground">
                Apply line discounts. Exceeding category or {customerTier} tier ceilings will elevate deal risk.
              </p>
            </div>

            <QuotationLineTable
              lines={lines}
              customerTier={customerTier}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateDiscount={handleUpdateDiscount}
              onRemoveLine={handleRemoveLine}
            />

            <div className="flex justify-between pt-4 border-t border-border">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentStep(2)}
              >
                ← Back: Products
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentStep(4)}
              >
                Next: Review Deal Economics →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 cols: Customer summary & Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="card p-4" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Quotation Prepared For
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text)' }}>
                    {customer?.companyName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {customerTier} Tier · {customer?.industry} · Currency: {customer?.currency}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setCurrentStep(1)}
                >
                  Change Customer
                </button>
              </div>
            </div>

            {/* Table */}
            <QuotationLineTable
              lines={lines}
              customerTier={customerTier}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateDiscount={handleUpdateDiscount}
              onRemoveLine={handleRemoveLine}
            />

            <div className="flex justify-between">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentStep(3)}
              >
                ← Back: Edit Discounts
              </button>
            </div>
          </div>

          {/* Right 4 cols: Risk, AI Recommendations, Sticky Summary */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
            <RiskIndicator
              score={riskScore}
              discountTotal={summary.discountTotal}
              overallMarginPct={summary.overallMarginPct}
            />

            <RecommendationPanel
              recommendations={recommendations}
              onAddRecommendation={handleAddRecommendation}
              onDismissRecommendation={handleDismissRecommendation}
            />

            <PricingSummary
              quoteNumber={quoteNumber}
              summary={summary}
              riskScore={riskScore}
              approvalRequired={approvalRequired}
              onSaveDraft={handleSaveDraft}
              onSubmitForApproval={handleSubmitForApproval}
              isSaving={createMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}

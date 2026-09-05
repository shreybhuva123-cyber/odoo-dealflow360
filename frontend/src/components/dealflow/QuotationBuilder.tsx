import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quotation, QuotationLine, Product, Customer } from '@/types';
import { CustomerSelector } from './CustomerSelector';
import { ProductSelector } from './ProductSelector';
import { QuotationLineTable } from './QuotationLineTable';
import { PricingSummary } from './PricingSummary';
import { RiskIndicator, RiskFactor } from './RiskIndicator';
import { RecommendationPanel } from './RecommendationPanel';
import { QuotationStatus } from './QuotationStatus';
import { useRecommendations, useUpdateQuotation, useSubmitQuotation } from '@/hooks/useQuotations';
import { useCreateFulfillment } from '@/hooks/useFulfillment';
import { DealRecommendation } from '@/services/api/recommendations.api';
import { showToast } from '@/stores/toast.store';
import { ROUTES } from '@/constants/routes';

interface QuotationBuilderProps {
  initialQuotation?: Quotation | null;
  onSaved?: (quote: Quotation) => void;
  className?: string;
}

export function QuotationBuilder({
  initialQuotation,
  onSaved,
  className = '',
}: QuotationBuilderProps) {
  const navigate = useNavigate();
  const updateMutation = useUpdateQuotation();
  const submitMutation = useSubmitQuotation();

  // Quote metadata state
  const [quoteId, setQuoteId] = useState(initialQuotation?.id || 'quote_1042');
  const [quoteNumber, setQuoteNumber] = useState(initialQuotation?.quoteNumber || 'Q-1042');
  const [status, setStatus] = useState<Quotation['status']>(initialQuotation?.status || 'DRAFT');
  const [customer, setCustomer] = useState<Customer>({
    id: initialQuotation?.customerId || 'cust_acme',
    companyName: initialQuotation?.customerName || 'Acme Corporation',
    industry: 'Enterprise Technology',
    tier: (initialQuotation?.customerTier || 'ENTERPRISE') as any,
    country: 'United States',
    currency: initialQuotation?.summary?.currency || 'USD',
    accountManagerId: 'usr_rep_1',
    isActive: true,
    contacts: [],
    creditProfile: {
      creditLimit: 250000,
      availableCredit: 195000,
      paymentTerms: 'NET30',
      riskRating: 'LOW',
      overdueBalance: 0,
    },
    createdAt: '',
    updatedAt: '',
  });

  const customerTier =
    customer.companyName.includes('Acme') || customer.companyName.includes('Vertex')
      ? 'GOLD'
      : customer.companyName.includes('Beta') || customer.companyName.includes('TechCorp')
      ? 'SILVER'
      : 'BRONZE';

  // Quotation lines state
  const [lines, setLines] = useState<QuotationLine[]>(
    initialQuotation?.lines || [
      {
        id: 'ql_1',
        productId: 'prod_laptop',
        productName: 'ProLaptop X1',
        sku: 'DF-LAPTOP-X1',
        category: 'Hardware',
        quantity: 10,
        unitPrice: 1200,
        costPrice: 850,
        discountPct: 15.0,
        lineTotal: 10200,
        grossMarginPct: 16.7,
      },
      {
        id: 'ql_2',
        productId: 'prod_cloud',
        productName: 'CloudBase Pro',
        sku: 'DF-CLOUD-PRO',
        category: 'Subscription',
        quantity: 1,
        unitPrice: 299,
        costPrice: 80,
        discountPct: 30.0,
        lineTotal: 209.3,
        grossMarginPct: 61.8,
      },
      {
        id: 'ql_3',
        productId: 'prod_deploy',
        productName: 'Setup & Deploy',
        sku: 'DF-SVC-SETUP',
        category: 'Service',
        quantity: 1,
        unitPrice: 1800,
        costPrice: 1300,
        discountPct: 18.0,
        lineTotal: 1476,
        grossMarginPct: 11.9,
      },
    ]
  );

  // Recommendations state
  const { data: rawRecs = [] } = useRecommendations(quoteId);
  const [recommendations, setRecommendations] = useState<DealRecommendation[]>([]);

  useEffect(() => {
    if (rawRecs.length > 0 && recommendations.length === 0) {
      setRecommendations(rawRecs);
    }
  }, [rawRecs]);

  // Calculations
  const [summary, setSummary] = useState(
    initialQuotation?.summary || {
      subtotal: 13899,
      discountTotal: 2013.7,
      taxTotal: 2139.35,
      grandTotal: 14024.65,
      overallMarginPct: 24.2,
      currency: 'USD',
    }
  );

  const [riskScore, setRiskScore] = useState(initialQuotation?.riskScore || 68);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [approvalRequired, setApprovalRequired] = useState(initialQuotation?.approvalRequired ?? true);

  // Recalculate economics & risk on every change
  useEffect(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let totalCost = 0;
    const violations: RiskFactor[] = [];
    let maxOverLimit = 0;

    lines.forEach((line) => {
      const lineSub = line.quantity * line.unitPrice;
      const lineDisc = lineSub * (line.discountPct / 100);
      subtotal += lineSub;
      discountTotal += lineDisc;
      totalCost += line.quantity * (line.costPrice || line.unitPrice * 0.7);

      // Check category ceilings
      const cat = (line.category || 'Hardware').toLowerCase();
      let catCeiling = 15;
      if (cat.includes('service')) catCeiling = 10;
      if (cat.includes('sub') || cat.includes('saas')) catCeiling = 15;

      // Check tier ceilings
      let tierCeiling = 15;
      if (customerTier === 'SILVER') tierCeiling = 10;
      if (customerTier === 'BRONZE') tierCeiling = 5;

      const allowed = Math.min(catCeiling, tierCeiling);

      if (line.discountPct > allowed) {
        const over = line.discountPct - allowed;
        maxOverLimit = Math.max(maxOverLimit, over);
        violations.push({
          title: `${line.productName} (${line.category || 'Hardware'})`,
          detail: `Discount ${line.discountPct}% exceeds ceiling of ${allowed}% by +${over.toFixed(1)}%`,
          allowed: `${allowed}%`,
          current: `${line.discountPct}%`,
        });
      }
    });

    const netAfterDiscount = subtotal - discountTotal;
    const taxTotal = Math.round(netAfterDiscount * 0.18 * 100) / 100;
    const grandTotal = Math.round((netAfterDiscount + taxTotal) * 100) / 100;
    const grossProfit = netAfterDiscount - totalCost;
    const overallMarginPct =
      netAfterDiscount > 0
        ? Math.max(0, Math.min(100, Math.round((grossProfit / netAfterDiscount) * 1000) / 10))
        : 0;

    setSummary({
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      taxTotal,
      grandTotal,
      overallMarginPct,
      currency: customer.currency || 'USD',
    });

    // Score calculation
    let calculatedRisk = 10;
    if (violations.length > 0) {
      calculatedRisk = Math.min(100, Math.round(maxOverLimit * 4 + violations.length * 8 + 25));
    }
    if (overallMarginPct < 20) {
      calculatedRisk = Math.min(100, calculatedRisk + Math.round((20 - overallMarginPct) * 1.5));
    }

    setRiskScore(calculatedRisk);
    setRiskFactors(violations);
    setApprovalRequired(calculatedRisk > 25 || violations.length > 0 || overallMarginPct < 20);
  }, [lines, customerTier, customer.currency]);

  // Handlers for Lines
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
    showToast(`${product.name} added to quotation lines`, 'blue');
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
    showToast('Product line removed', 'blue');
  };

  // Handlers for Recommendations
  const handleAddRecommendation = (rec: DealRecommendation) => {
    // Add product to lines
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

    // Mark dismissed/added
    setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
    showToast(`✨ ${rec.name} attached! Deal margin & revenue updated.`, 'green');
  };

  const handleDismissRecommendation = (recId: string) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    showToast('Recommendation dismissed', 'blue');
  };

  // Handlers for Actions
  const handleSaveDraft = () => {
    const quotePayload: Partial<Quotation> = {
      id: quoteId,
      quoteNumber,
      customerName: customer.companyName,
      customerId: customer.id,
      customerTier,
      status: 'DRAFT',
      lines,
      summary,
      riskScore,
      riskCategory: riskScore > 60 ? 'HIGH' : riskScore > 25 ? 'MEDIUM' : 'LOW',
      approvalRequired,
    };

    updateMutation.mutate({ id: quoteId, data: quotePayload });
    setStatus('DRAFT');
  };

  const handleSubmitForApproval = () => {
    const quotePayload: Partial<Quotation> = {
      id: quoteId,
      quoteNumber,
      customerName: customer.companyName,
      customerId: customer.id,
      customerTier,
      status: 'PENDING_APPROVAL',
      lines,
      summary,
      riskScore,
      riskCategory: riskScore > 60 ? 'HIGH' : riskScore > 25 ? 'MEDIUM' : 'LOW',
      approvalRequired: true,
    };

    updateMutation.mutate(
      { id: quoteId, data: quotePayload },
      {
        onSuccess: () => {
          setStatus('PENDING_APPROVAL');
          showToast(`Quotation ${quoteNumber} submitted — routed for approval`, 'amber');
          setTimeout(() => {
            navigate(ROUTES.APP.APPROVALS);
          }, 1200);
        },
      }
    );
  };

  const createFulfillmentMutation = useCreateFulfillment();

  const handleProceedToFulfillment = () => {
    createFulfillmentMutation.mutate(
      {
        quotationId: quoteId,
        quotationNumber: quoteNumber,
        dealId: initialQuotation?.dealId || 'deal-101',
        dealName: initialQuotation?.dealName || `${customer.companyName} Commercial Supply`,
        customerId: customer.id,
        customerName: customer.companyName,
        priority: 'high',
        items: lines.map((l) => ({
          productId: l.productId,
          productName: l.productName,
          sku: l.sku,
          quantity: l.quantity,
        })),
      },
      {
        onSuccess: (newOrder) => {
          navigate(ROUTES.APP.FULFILLMENT_DETAIL(newOrder.id));
        },
      }
    );
  };

  const isApprovedOrConfirmed =
    status === 'APPROVED' || status === 'CONFIRMED' || status === 'ACCEPTED';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Bar */}
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{quoteNumber}</h1>
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold text-foreground">{customer.companyName}</span>
              <QuotationStatus status={status} size="md" />
            </div>
            <p className="text-xs text-muted-foreground">
              Smart Quote Builder · Rep: Alex Morgan · Currency: {customer.currency}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isApprovedOrConfirmed && (
            <button
              type="button"
              className="btn btn-success btn-sm text-xs font-semibold"
              onClick={handleProceedToFulfillment}
              disabled={createFulfillmentMutation.isPending}
            >
              {createFulfillmentMutation.isPending ? 'Routing...' : 'Proceed to Fulfillment 📦'}
            </button>
          )}
          {status === 'PENDING_APPROVAL' && (
            <button
              type="button"
              className="btn btn-warning btn-sm text-xs"
              onClick={() => navigate(ROUTES.APP.APPROVAL_DETAIL(quoteId))}
            >
              View In Approval Center ↗
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleSaveDraft}
            disabled={updateMutation.isPending}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSubmitForApproval}
            disabled={updateMutation.isPending}
          >
            Submit for Approval
          </button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Catalog & Line Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Selection Card */}
          <div className="card p-4" style={{ background: 'var(--surface)' }}>
            <CustomerSelector
              selectedCustomerId={customer.id}
              onSelectCustomer={(c) => setCustomer(c)}
            />
          </div>

          {/* Product Catalog Card */}
          <div className="card p-4" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="card-title">Add Products to Quotation</h2>
              <span className="text-xs text-muted-foreground">Click to add SKU</span>
            </div>
            <ProductSelector onAddProduct={handleAddProduct} />
          </div>

          {/* Quotation Lines Table */}
          <QuotationLineTable
            lines={lines}
            customerTier={customerTier}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateDiscount={handleUpdateDiscount}
            onRemoveLine={handleRemoveLine}
          />
        </div>

        {/* Right Column (4 cols): Risk, Recommendations, Live Summary */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
          {/* Deal Risk Indicator */}
          <RiskIndicator
            score={riskScore}
            factors={riskFactors}
            discountTotal={summary.discountTotal}
            overallMarginPct={summary.overallMarginPct}
          />

          {/* AI Recommendation Panel */}
          <RecommendationPanel
            recommendations={recommendations}
            onAddRecommendation={handleAddRecommendation}
            onDismissRecommendation={handleDismissRecommendation}
          />

          {/* Live Pricing Summary */}
          <PricingSummary
            quoteNumber={quoteNumber}
            summary={summary}
            riskScore={riskScore}
            approvalRequired={approvalRequired}
            onSaveDraft={handleSaveDraft}
            onSubmitForApproval={handleSubmitForApproval}
            isSaving={updateMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}

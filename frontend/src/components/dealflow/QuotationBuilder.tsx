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
import { useApproval, useApproveApproval, useRejectApproval, useReturnApproval } from '@/hooks/useApprovals';
import { negotiationsApi } from '@/services/api/negotiations.api';
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

  // Approval hooks
  const { data: approvalData, refetch: refetchApproval } = useApproval(initialQuotation?.id || 'quote_1042');
  const approveMutation = useApproveApproval();
  const rejectMutation = useRejectApproval();
  const returnMutation = useReturnApproval();

  // Quote metadata state
  const [quoteId, setQuoteId] = useState(initialQuotation?.id || 'quote_1042');
  const [quoteNumber, setQuoteNumber] = useState(initialQuotation?.quoteNumber || 'Q-1042');
  const [status, setStatus] = useState<Quotation['status']>(initialQuotation?.status || 'DRAFT');

  // Customer negotiation counter-offer state
  const portalToken = initialQuotation?.portalToken || initialQuotation?.id || quoteId;
  const portalUrl = `/portal/quote/${portalToken}`;

  const [customerProposedItems, setCustomerProposedItems] = useState<any[]>(
    (initialQuotation as any)?.customerProposedItems || []
  );
  const [customerProposalMessage, setCustomerProposalMessage] = useState<string>(
    (initialQuotation as any)?.customerProposedMessage ||
      initialQuotation?.negotiationThread?.slice(-1)[0]?.content ||
      ''
  );
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

  // Auto-load negotiation proposal when status is NEGOTIATION
  useEffect(() => {
    if (status === 'NEGOTIATION' && customerProposedItems.length === 0) {
      negotiationsApi.getNegotiation(portalToken).then((neg) => {
        if (neg && neg.items) {
          setCustomerProposedItems(neg.items);
          setCustomerProposalMessage(neg.message);
        } else if (initialQuotation?.id === 'quote_1040' || quoteNumber === 'Q-1040') {
          setCustomerProposalMessage('We would like to order 45 units of laptops & displays if you can give us 18% discount across hardware.');
          setCustomerProposedItems([
            { productName: 'ProLaptop X1', requestedQuantity: 45, requestedPrice: 984, discountPct: 18 },
            { productName: 'UltraDisplay 4K', requestedQuantity: 45, requestedPrice: 393, discountPct: 18 },
          ]);
        }
      });
    }
  }, [status, portalToken, customerProposedItems.length, initialQuotation?.id, quoteNumber]);

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
          showToast(`Quotation ${quoteNumber} submitted — routed for executive review`, 'amber');
          refetchApproval();
        },
      }
    );
  };

  const handleManagerApprove = () => {
    approveMutation.mutate(
      {
        id: approvalData?.id || quoteId,
        comment: 'Sales Manager approved proposal terms.',
        approverName: 'Maria Chen',
        role: 'SALES_MANAGER',
      },
      {
        onSuccess: (updated) => {
          if (updated.status === 'APPROVED') {
            setStatus('APPROVED');
            showToast(`Quotation ${quoteNumber} fully approved by Sales Manager!`, 'green');
          } else {
            showToast(`Quotation ${quoteNumber} approved by Sales Manager — routed to Finance Review!`, 'green');
            refetchApproval();
          }
        },
      }
    );
  };

  const handleFinanceApprove = () => {
    approveMutation.mutate(
      {
        id: approvalData?.id || quoteId,
        comment: 'Finance Manager commercial clearance approved.',
        approverName: 'David Park',
        role: 'FINANCE',
      },
      {
        onSuccess: () => {
          setStatus('APPROVED');
          showToast(`Quotation ${quoteNumber} approved by Finance Manager — deal released!`, 'green');
          refetchApproval();
        },
      }
    );
  };

  const handleAdminApprove = () => {
    approveMutation.mutate(
      {
        id: approvalData?.id || quoteId,
        comment: 'Executive administrator override approval.',
        approverName: 'System Admin',
        role: 'ADMIN',
      },
      {
        onSuccess: () => {
          setStatus('APPROVED');
          showToast(`Quotation ${quoteNumber} fully approved by Administrator!`, 'green');
          refetchApproval();
        },
      }
    );
  };

  const handleReturnClick = () => {
    returnMutation.mutate(
      {
        id: approvalData?.id || quoteId,
        feedback: 'Margin below target. Please revise line discounts and resubmit.',
        approverName: 'Maria Chen',
        role: 'SALES_MANAGER',
      },
      {
        onSuccess: () => {
          setStatus('DRAFT');
          showToast(`Quotation returned to Sales Rep for revision`, 'amber');
          refetchApproval();
        },
      }
    );
  };

  const handleRejectClick = () => {
    rejectMutation.mutate(
      {
        id: approvalData?.id || quoteId,
        reason: 'Commercial terms breached policy guidelines.',
        approverName: 'Maria Chen',
        role: 'SALES_MANAGER',
      },
      {
        onSuccess: () => {
          setStatus('REJECTED');
          showToast(`Quotation rejected by management`, 'red');
          refetchApproval();
        },
      }
    );
  };

  const handleApplyCustomerTerms = () => {
    const proposed =
      customerProposedItems.length > 0
        ? customerProposedItems
        : [
            { productName: 'ProLaptop X1', requestedQuantity: 45, requestedPrice: 984, discountPct: 18 },
            { productName: 'UltraDisplay 4K', requestedQuantity: 45, requestedPrice: 393, discountPct: 18 },
          ];

    setLines((prev) =>
      prev.map((line) => {
        const match = proposed.find(
          (p: any) =>
            p.productName?.toLowerCase().includes(line.productName.toLowerCase()) ||
            line.productName.toLowerCase().includes(p.productName?.toLowerCase())
        );
        if (match) {
          const newQty = match.requestedQuantity || line.quantity;
          const newDisc = match.discountPct !== undefined ? match.discountPct : line.discountPct;
          const unitPrice = match.requestedPrice || line.unitPrice;
          const lineSub = newQty * unitPrice;
          const lineDisc = lineSub * (newDisc / 100);
          return {
            ...line,
            quantity: newQty,
            discountPct: newDisc,
            lineTotal: Math.round((lineSub - lineDisc) * 100) / 100,
          };
        }
        return line;
      })
    );
    showToast("Customer counter-offer terms applied to lines! Review summary & resubmit.", 'green');
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

  const isHighRisk =
    riskScore >= 50 ||
    summary.overallMarginPct < 20 ||
    summary.discountTotal / (summary.subtotal || 1) > 0.15;

  const currentStageName =
    approvalData?.approvalStage ||
    (status === 'PENDING_APPROVAL'
      ? isHighRisk
        ? 'Sales Manager Review'
        : 'Sales Manager Review'
      : status);

  const isFinanceStep =
    currentStageName === 'Finance Review' ||
    currentStageName === 'Finance' ||
    approvalData?.currentStepIndex === 2;

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

        <div className="flex flex-wrap items-center gap-2">
          {/* Customer Portal Link (when Approved, Confirmed, or in Negotiation) */}
          {(isApprovedOrConfirmed || status === 'NEGOTIATION') && (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm text-xs font-semibold flex items-center gap-1.5"
                onClick={() => window.open(portalUrl, '_blank')}
              >
                <span>🌐</span>
                <span>Open Customer Portal</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + portalUrl);
                  showToast('Customer portal link copied to clipboard!', 'green');
                }}
              >
                <span>📋 Copy Link</span>
              </button>
            </>
          )}

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
              onClick={() => navigate(ROUTES.APP.APPROVAL_DETAIL(approvalData?.id || quoteId))}
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
            {status === 'NEGOTIATION' ? 'Resubmit Revised Quote' : 'Submit for Approval'}
          </button>
        </div>
      </div>

      {/* Executive Multi-Tier Approval Action Banner */}
      {status === 'PENDING_APPROVAL' && (
        <div
          className="p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <strong className="text-sm font-bold text-amber-500">
                Awaiting Executive Sign-Off: {isFinanceStep ? 'Finance Manager Review' : 'Sales Manager Review'}
              </strong>
              <span className={`badge ${isHighRisk ? 'badge-red' : 'badge-green'} text-xs`}>
                {isHighRisk ? 'High Commercial Risk (2-Tier Approval)' : 'Standard Risk (1-Tier Approval)'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isFinanceStep
                ? 'Sales Manager approval completed. High risk / discount ceiling breach requires Finance clearance to release.'
                : isHighRisk
                ? 'High risk trigger: discount > 15% or margin < 20%. Sales Manager approval will advance deal to Finance.'
                : 'Standard deal metrics. Sales Manager approval will immediately finalize and release quotation.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isFinanceStep ? (
              <button
                type="button"
                className="btn btn-success btn-sm text-xs font-semibold"
                onClick={handleManagerApprove}
                disabled={approveMutation.isPending}
              >
                <span>✓</span>
                <span>{isHighRisk ? 'Approve as Sales Manager (Forward to Finance)' : 'Approve as Sales Manager (Release)'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success btn-sm text-xs font-semibold"
                onClick={handleFinanceApprove}
                disabled={approveMutation.isPending}
              >
                <span>✓</span>
                <span>Approve as Finance Manager (Release)</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm text-xs"
              onClick={handleAdminApprove}
              disabled={approveMutation.isPending}
              title="Fast-track administrative sign-off"
            >
              <span>⚡</span>
              <span>Admin Override</span>
            </button>

            <button
              type="button"
              className="btn btn-warning btn-sm text-xs"
              onClick={handleReturnClick}
              disabled={returnMutation.isPending}
            >
              <span>↩</span>
              <span>Return to Rep</span>
            </button>

            <button
              type="button"
              className="btn btn-danger btn-sm text-xs"
              onClick={handleRejectClick}
              disabled={rejectMutation.isPending}
            >
              <span>✕</span>
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Customer Counter-Offer Negotiation Alert Banner (Loopback to Sales Rep) */}
      {status === 'NEGOTIATION' && (
        <div
          className="p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          style={{
            background: 'rgba(59, 130, 246, 0.08)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
          }}
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-base">💬</span>
              <strong className="text-sm font-bold text-accent">
                Customer Counter-Offer Received
              </strong>
              <span className="badge badge-blue text-xs">Awaiting Rep Revision</span>
            </div>
            <p className="text-xs text-foreground">
              <strong>Customer Note:</strong> "{customerProposalMessage || 'Customer proposed revised quantities and rate terms via the Customer Portal.'}"
            </p>
            {customerProposedItems && customerProposedItems.length > 0 && (
              <div className="text-xs text-muted-foreground flex flex-wrap gap-2 pt-0.5">
                <span className="font-semibold text-foreground">Proposed:</span>
                {customerProposedItems.map((it: any, i: number) => (
                  <span key={i} className="inline-block bg-accent/10 px-2 py-0.5 rounded text-accent font-mono text-xs font-semibold">
                    {it.productName}: Qty {it.requestedQuantity} @ ${it.requestedPrice?.toLocaleString() || it.currentPrice}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              className="btn btn-success btn-sm text-xs font-semibold"
              onClick={handleApplyCustomerTerms}
            >
              <span>✓</span>
              <span>Apply Customer's Terms to Lines</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm text-xs font-semibold"
              onClick={handleSubmitForApproval}
              disabled={updateMutation.isPending}
            >
              <span>🚀</span>
              <span>Submit Revised Quote for Approval</span>
            </button>
          </div>
        </div>
      )}

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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface TourStep {
  stepNumber: number;
  title: string;
  category: string;
  route: string;
  what: string;
  why: string;
  whatNext: string;
  recommendedRole?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    title: 'Authentication & Role-Based Workspaces',
    category: 'Security & Access',
    route: '/login',
    what: 'Role-based login with 1-click persona switching (Sales Rep, Manager, Finance, Admin, Customer).',
    why: 'Enforces strict enterprise separation of duties and dynamic navigation visibility.',
    whatNext: 'Login as Alex Morgan (Sales Rep) and proceed to the operational Dashboard.',
    recommendedRole: 'SALES_REP',
  },
  {
    stepNumber: 2,
    title: 'Executive Dashboard & Attention Center',
    category: 'Operations Overview',
    route: '/app/dashboard',
    what: 'Unified command center featuring 4 KPI metric cards and the Attention Center triage queue.',
    why: 'Surfaces urgent bottlenecks across approvals, stalled deals, negotiations, and overdue receivables.',
    whatNext: 'Click on Pipeline in the sidebar or from the top navbar to inspect active opportunities.',
  },
  {
    stepNumber: 3,
    title: 'Visual Deal Pipeline & Kanban Drag-and-Drop',
    category: 'Pipeline Management',
    route: '/app/pipeline',
    what: 'Kanban board tracking opportunities through Lead, Qualified, Proposal, Negotiation, and Won stages.',
    why: 'Provides real-time deal health indicators, win probability weighting, and velocity monitoring.',
    whatNext: 'Click on deal "OmniCorp Global Enterprise Suite" (deal-104) to review its workspace.',
  },
  {
    stepNumber: 4,
    title: 'Deep Opportunity Workspace & Activity Telemetry',
    category: 'Deal Intelligence',
    route: '/app/pipeline/deal-104',
    what: 'Detailed deal telemetry with commercial summary, health scorecards, notes, and activity audit.',
    why: 'Maintains complete context between sales reps and management during deal progression.',
    whatNext: 'Click "View Quotation (Q-1042)" or navigate to Quotation Builder to craft commercial terms.',
  },
  {
    stepNumber: 5,
    title: 'Smart Quotation Builder & Pricing Rules',
    category: 'Commercial Drafting',
    route: '/app/quotations/new',
    what: 'Live quote drafting with customer tiers (Gold), multi-SKU selection, and volume schedules.',
    why: 'Automatically evaluates pricing policy ceilings and margin thresholds as quantities and discounts change.',
    whatNext: 'Adjust the discount on ProLaptop X1 to 25% to trigger automated policy protection.',
  },
  {
    stepNumber: 6,
    title: 'Real-Time Margin Guard & Risk Detection',
    category: 'AI Risk Engine',
    route: '/app/quotations/quote_1001',
    what: 'System detects margin erosion below 15% threshold and flags HIGH RISK policy violation.',
    why: 'Prevents unauthorized gross margin loss before quotes can be transmitted to customers.',
    whatNext: 'Click "Submit for Approval" to dispatch the quotation to the multi-tier approval queue.',
  },
  {
    stepNumber: 7,
    title: 'Approval Center & Multi-Tier Governance',
    category: 'Management Governance',
    route: '/app/approvals/appr_1001',
    what: 'Sales Manager and Finance review workspace with Before vs. After financial impact and risk breakdown.',
    why: 'Provides governance signoff auditability with Approve, Reject, or Return for Revisions actions.',
    whatNext: 'Click "Approve Quote" with an approval note, then transition to the Customer Deal Portal.',
    recommendedRole: 'SALES_MANAGER',
  },
  {
    stepNumber: 8,
    title: 'Secure Customer Deal Portal',
    category: 'Customer Experience',
    route: '/portal/quote/portal_acme_1042',
    what: 'Encrypted, customer-facing quotation review portal with clean line items, taxes, and validity timer.',
    why: 'STRICT SECURITY RULE: Completely isolates internal margins, cost prices, and risk scores from customers.',
    whatNext: 'Click "Negotiate Terms" to simulate a customer counter-offer.',
  },
  {
    stepNumber: 9,
    title: 'Customer Negotiation & Counter-Proposals',
    category: 'Digital Negotiation',
    route: '/portal/quote/portal_acme_1042/negotiate',
    what: 'Interactive negotiation thread allowing customers to counter pricing, terms, and add discussion notes.',
    why: 'Replaces messy email chains with an authoritative, tracked digital negotiation workspace.',
    whatNext: 'Switch to the internal Operations workspace to fulfill the accepted agreement.',
  },
  {
    stepNumber: 10,
    title: 'Physical Fulfillment & Multi-Warehouse Allocation',
    category: 'Supply Chain & Stock',
    route: '/app/fulfillment/ful-104',
    what: 'Multi-hub stock routing across Mumbai Main Hub, Kolkata East Depot, and Ahmedabad West Hub.',
    why: 'Manages split shipments, stock reservations, backorders, and carrier tracking integration.',
    whatNext: 'Click "Generate Commercial Invoice" to initiate customer billing and revenue recognition.',
  },
  {
    stepNumber: 11,
    title: 'Commercial Invoicing, Billing & Subscriptions',
    category: 'Finance & Receivables',
    route: '/app/invoices/inv-001',
    what: 'Automated invoice generation from fulfilled quotes, payment terms (Net 30), and payment reconciliation.',
    why: 'Connects the sales lifecycle directly to accounts receivable with 1-click payment recording.',
    whatNext: 'Click on Deal Health in the sidebar to review organizational deal health metrics.',
  },
  {
    stepNumber: 12,
    title: 'Deal Health & Risk Intelligence Analytics',
    category: 'Revenue Operations',
    route: '/app/deal-health',
    what: 'Predictive deal health scoring (Healthy 🟢, At Risk 🟡, Critical 🔴) with anomaly alerts.',
    why: 'Identifies stalled pipelines, margin shrinkage, and approval bottlenecks before quarter end.',
    whatNext: 'Click the Bell icon in the top navbar or navigate to Notifications.',
  },
  {
    stepNumber: 13,
    title: 'Notification Center & Live Event Simulator',
    category: 'Collaboration & Alerts',
    route: '/app/notifications',
    what: 'Real-time alert dispatching across email and in-app feeds with category tabs and live simulator.',
    why: 'Ensures reps and managers never miss high-value approvals or customer portal negotiations.',
    whatNext: 'Click "Simulate Incoming Alert" or navigate to Compliance Audit Logs.',
  },
  {
    stepNumber: 14,
    title: 'Immutable Compliance Audit Trail',
    category: 'Enterprise Governance',
    route: '/app/audit-logs',
    what: 'SOC2 / ISO 27001 ready tamper-evident ledger tracking actor IP, timestamps, and mutation diffs.',
    why: 'Guarantees complete legal and governance accountability with 1-click JSON ledger export.',
    whatNext: 'Congratulations! You have completed the full 360° DealFlow360 platform journey.',
  },
];

interface HackathonDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HackathonDemoTour({ isOpen, onClose }: HackathonDemoTourProps) {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [viewAllSteps, setViewAllSteps] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const progressPct = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  const handleJumpToScreen = () => {
    navigate(currentStep.route);
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      navigate(TOUR_STEPS[nextIdx].route);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      navigate(TOUR_STEPS[prevIdx].route);
    }
  };

  const handleSelectStep = (idx: number) => {
    setCurrentStepIndex(idx);
    setViewAllSteps(false);
    navigate(TOUR_STEPS[idx].route);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-border/70 bg-surface2/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground text-xs font-black shadow-md">
              🏆
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                DealFlow360 Hackathon Golden Path Tour
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Step {currentStep.stepNumber} of {TOUR_STEPS.length} · {currentStep.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewAllSteps(!viewAllSteps)}
              className="btn btn-ghost btn-xs text-xs text-accent hover:underline"
            >
              {viewAllSteps ? 'Show Current Step' : 'All 14 Steps'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xs p-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface3 h-1">
          <div
            className="bg-accent h-1 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {viewAllSteps ? (
            /* All 14 Steps Menu */
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Click any stage to instantly navigate to that part of the demo:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOUR_STEPS.map((s, idx) => (
                  <button
                    key={s.stepNumber}
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-start gap-2.5 ${
                      idx === currentStepIndex
                        ? 'border-accent bg-accent/10 font-semibold text-foreground'
                        : 'border-border/60 bg-surface2/30 hover:bg-surface2 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="font-mono text-[11px] font-bold text-accent shrink-0 pt-0.5">
                      {String(s.stepNumber).padStart(2, '0')}.
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{s.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{s.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Step Detailed Card */
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/25">
                    STAGE {String(currentStep.stepNumber).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {currentStep.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground">{currentStep.title}</h2>
              </div>

              {/* 3 Core Questions: WHAT / WHY / WHAT NEXT */}
              <div className="space-y-3 pt-1">
                {/* WHAT */}
                <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                    What happens here?
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">{currentStep.what}</p>
                </div>

                {/* WHY */}
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Why does this matter?
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">{currentStep.why}</p>
                </div>

                {/* WHAT NEXT */}
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    What should you do next?
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">{currentStep.whatNext}</p>
                </div>
              </div>

              {currentStep.recommendedRole && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                  <span>💡 Recommended Persona:</span>
                  <span className="font-semibold text-foreground">
                    {currentStep.recommendedRole.replace('_', ' ')}
                  </span>
                  <span>(Switch via Top Navbar menu if testing role guards)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-border/70 bg-surface2/40 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="btn btn-ghost btn-sm text-xs"
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={handleJumpToScreen}
            className="btn btn-secondary btn-sm text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Open Current Screen</span>
            <span>↗</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentStepIndex === TOUR_STEPS.length - 1}
            className="btn btn-primary btn-sm text-xs font-semibold"
          >
            Next Stage →
          </button>
        </div>
      </div>
    </div>
  );
}

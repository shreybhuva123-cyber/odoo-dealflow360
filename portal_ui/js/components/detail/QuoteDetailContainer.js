/**
 * DealFlow360 - QuoteDetailContainer Component
 * Master orchestrator managing loading skeletons, error boundaries,
 * and the 2-column responsive quotation detail layout.
 */
(function(root) {
  'use strict';

  function QuoteDetailContainer(props) {
    const isLoading = props && props.isLoading;
    const error = props && props.error;
    const quote = (props && props.quote) || null;
    const negotiation = (props && props.negotiation) || null;
    const user = (props && props.user) || {};

    // Primitives from registry
    let components = (root && root.DFComponents) || {};
    if (typeof require !== 'undefined' && (!components.QuoteDetailHeader || !components.QuotePricingSummary)) {
      try {
        const idx = require('../index');
        components = Object.assign({}, idx, components);
      } catch (e) {
        try {
          components.QuoteDetailHeader = components.QuoteDetailHeader || require('./QuoteDetailHeader').QuoteDetailHeader;
          components.QuoteNegotiationBanner = components.QuoteNegotiationBanner || require('./QuoteNegotiationBanner').QuoteNegotiationBanner;
          components.QuoteLineItemsTable = components.QuoteLineItemsTable || require('./QuoteLineItemsTable').QuoteLineItemsTable;
          components.QuotePricingSummary = components.QuotePricingSummary || require('./QuotePricingSummary').QuotePricingSummary;
          components.QuoteCommercialTerms = components.QuoteCommercialTerms || require('./QuoteCommercialTerms').QuoteCommercialTerms;
          components.QuoteSalesRepCard = components.QuoteSalesRepCard || require('./QuoteSalesRepCard').QuoteSalesRepCard;
          components.LoadingSkeleton = components.LoadingSkeleton || require('../feedback/LoadingSkeleton');
          components.ErrorView = components.ErrorView || require('../feedback/ErrorView').ErrorView;
        } catch (e2) {}
      }
    }

    const QuoteDetailHeader = (props && props.QuoteDetailHeader) || components.QuoteDetailHeader;
    const QuoteNegotiationBanner = (props && props.QuoteNegotiationBanner) || components.QuoteNegotiationBanner;
    const QuoteLineItemsTable = (props && props.QuoteLineItemsTable) || components.QuoteLineItemsTable;
    const QuotePricingSummary = (props && props.QuotePricingSummary) || components.QuotePricingSummary;
    const QuoteCommercialTerms = (props && props.QuoteCommercialTerms) || components.QuoteCommercialTerms;
    const QuoteSalesRepCard = (props && props.QuoteSalesRepCard) || components.QuoteSalesRepCard;
    const LoadingSkeleton = (props && props.LoadingSkeleton) || components.LoadingSkeleton;
    const ErrorView = (props && props.ErrorView) || components.ErrorView;

    // 1. ERROR STATE
    if (error) {
      const is404 = error.status === 404 || error.code === 'QUOTE_NOT_FOUND';
      const errorHtml = ErrorView
        ? ErrorView({
            title: error.title || (is404 ? 'Quotation Not Found' : 'Unable to load proposal'),
            errorCode: error.code || (is404 ? 'QUOTE_NOT_FOUND' : 'QUOTE_DETAIL_ERROR'),
            message: error.message || (is404
              ? 'This quotation does not exist or your organization is not authorized to access it.'
              : 'An error occurred while retrieving quotation details.'),
            illustration: is404 ? '404' : 'server_error',
            primaryActionLabel: 'Return to My Quotations',
            secondaryActionLabel: 'Contact Account Team'
          })
        : `<div class="p-8 bg-red-50 text-red-700 rounded-2xl text-center font-medium">${error.message || 'Quotation error'}</div>`;

      return `
        <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-component="QuoteDetailContainer" data-state="error">
          <nav class="mb-4">
            <a href="#/quotes" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Back to Quotations
            </a>
          </nav>
          ${errorHtml}
        </div>
      `.trim();
    }

    // 2. LOADING STATE (Enterprise Skeletons)
    if (isLoading || !quote) {
      const headerSkeleton = (LoadingSkeleton && LoadingSkeleton.SkeletonCard)
        ? LoadingSkeleton.SkeletonCard({ lines: 3 })
        : '<div class="h-24 bg-slate-200 rounded-2xl animate-pulse mb-6"></div>';

      const tableSkeleton = (LoadingSkeleton && LoadingSkeleton.SkeletonTable)
        ? LoadingSkeleton.SkeletonTable({ rows: 3 })
        : '<div class="h-64 bg-slate-200 rounded-2xl animate-pulse mb-6"></div>';

      const summarySkeleton = (LoadingSkeleton && LoadingSkeleton.SkeletonCard)
        ? LoadingSkeleton.SkeletonCard({ lines: 6 })
        : '<div class="h-80 bg-slate-200 rounded-2xl animate-pulse mb-6"></div>';

      return `
        <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-component="QuoteDetailContainer" data-state="loading">
          <div class="mb-6">${headerSkeleton}</div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
              ${tableSkeleton}
              ${headerSkeleton}
            </div>
            <div class="space-y-6">
              ${summarySkeleton}
            </div>
          </div>
        </div>
      `.trim();
    }

    // 3. READY STATE (2-Column Grid)
    const headerHtml = QuoteDetailHeader
      ? QuoteDetailHeader({ quote, user })
      : '';

    const bannerHtml = QuoteNegotiationBanner
      ? QuoteNegotiationBanner({ quote, negotiation })
      : '';

    const lineItemsHtml = QuoteLineItemsTable
      ? QuoteLineItemsTable({ lines: quote.line_items, currency: quote.currency, canNegotiate: quote.can_negotiate })
      : '';

    const commercialTermsHtml = QuoteCommercialTerms
      ? QuoteCommercialTerms({ quote })
      : '';

    const pricingSummaryHtml = QuotePricingSummary
      ? QuotePricingSummary({ quote, user })
      : '';

    const salesRepCardHtml = QuoteSalesRepCard
      ? QuoteSalesRepCard({ quote })
      : '';

    return `
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-component="QuoteDetailContainer" data-state="ready" data-quote-id="${quote.quote_id || ''}">
        <!-- Top Hero Header -->
        ${headerHtml}

        <!-- Contextual Negotiation / Status Banner -->
        ${bannerHtml}

        <!-- 2-Column Responsive Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <!-- Left Column: Line Items, Deliverables, Commercial & SLA Terms (67%) -->
          <div class="lg:col-span-2 space-y-6">
            ${lineItemsHtml}
            ${commercialTermsHtml}
          </div>

          <!-- Right Column: Sticky Pricing Summary & Dedicated Account Rep (33%) -->
          <div class="space-y-6">
            ${pricingSummaryHtml}
            ${salesRepCardHtml}
          </div>
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteDetailContainer };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteDetailContainer = QuoteDetailContainer;
  }
})(typeof window !== 'undefined' ? window : this);

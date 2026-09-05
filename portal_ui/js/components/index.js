/**
 * DealFlow360 - Customer Portal Reusable Component Library Index
 * Consolidates all presentational foundation primitives into a single entry point.
 */
(function(root) {
  'use strict';

  // In Node environment, require all component modules
  let components = {};
  if (typeof module !== 'undefined' && module.exports) {
    const { QuoteStatusBadge } = require('./badges/QuoteStatusBadge');
    const { NegotiationStatusBadge } = require('./badges/NegotiationStatusBadge');
    const { CustomerIdentity } = require('./layout/CustomerIdentity');
    const { PortalHeader } = require('./layout/PortalHeader');
    const { MainContentArea } = require('./layout/MainContentArea');
    const { PortalLayout } = require('./layout/PortalLayout');
    const { BreadcrumbTrail } = require('./navigation/BreadcrumbTrail');
    const { ModalDialog } = require('./overlays/ModalDialog');
    const { SlideOverDrawer } = require('./overlays/SlideOverDrawer');
    const { ConfirmationDialog } = require('./overlays/ConfirmationDialog');
    const { ToastItem } = require('./feedback/ToastSystem');
    const LoadingSkeleton = require('./feedback/LoadingSkeleton');
    const { ErrorView } = require('./feedback/ErrorView');
    const { EmptyStateView } = require('./feedback/EmptyStateView');
    const { QuoteFilterBar } = require('./quotes/QuoteFilterBar');
    const { QuoteTable } = require('./quotes/QuoteTable');
    const { QuoteCard } = require('./quotes/QuoteCard');
    const { QuotePagination } = require('./quotes/QuotePagination');
    const { QuoteListContainer } = require('./quotes/QuoteListContainer');
    const { QuoteDetailHeader } = require('./detail/QuoteDetailHeader');
    const { QuoteNegotiationBanner } = require('./detail/QuoteNegotiationBanner');
    const { QuoteLineItemsTable } = require('./detail/QuoteLineItemsTable');
    const { QuotePricingSummary } = require('./detail/QuotePricingSummary');
    const { QuoteCommercialTerms } = require('./detail/QuoteCommercialTerms');
    const { QuoteSalesRepCard } = require('./detail/QuoteSalesRepCard');
    const { QuoteDetailContainer } = require('./detail/QuoteDetailContainer');
    const { LineCommentBadge } = require('./comments/LineCommentBadge');
    const { CommentMessageBubble } = require('./comments/CommentMessageBubble');
    const { CommentComposer } = require('./comments/CommentComposer');
    const { LineDiscussionDrawer } = require('./comments/LineDiscussionDrawer');

    components = {
      QuoteStatusBadge,
      NegotiationStatusBadge,
      CustomerIdentity,
      PortalHeader,
      MainContentArea,
      PortalLayout,
      BreadcrumbTrail,
      ModalDialog,
      SlideOverDrawer,
      ConfirmationDialog,
      ToastItem,
      LoadingSkeleton,
      ErrorView,
      EmptyStateView,
      QuoteFilterBar,
      QuoteTable,
      QuoteCard,
      QuotePagination,
      QuoteListContainer,
      QuoteDetailHeader,
      QuoteNegotiationBanner,
      QuoteLineItemsTable,
      QuotePricingSummary,
      QuoteCommercialTerms,
      QuoteSalesRepCard,
      QuoteDetailContainer,
      LineCommentBadge,
      CommentMessageBubble,
      CommentComposer,
      LineDiscussionDrawer
    };

    module.exports = components;
  } else {
    // In Browser, attach to window.DFComponents
    root.DFComponents = root.DFComponents || {};
  }
})(typeof window !== 'undefined' ? window : this);

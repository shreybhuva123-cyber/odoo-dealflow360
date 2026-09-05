/**
 * DealFlow360 - LineDiscussionDrawer Component
 * Slide-over drawer coordinating deliverable context, message history stream,
 * read-receipt actions, and message composer.
 */
(function(root) {
  'use strict';

  function formatCurrency(amount, currency) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
    } catch (e) {
      return `$${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
  }

  function LineDiscussionDrawer(props) {
    const isOpen = (props && props.isOpen) !== false;
    const isLoading = (props && props.isLoading) || false;
    const line = (props && props.line) || {};
    const comments = (props && Array.isArray(props.comments)) ? props.comments : [];
    const currentRevision = (props && props.currentRevision) || 1;
    const currency = (props && props.currency) || 'USD';
    const unreadCount = (props && props.unreadCount) || 0;

    // Primitives from registry
    let components = (root && root.DFComponents) || {};
    if (typeof require !== 'undefined' && (!components.CommentMessageBubble || !components.CommentComposer)) {
      try {
        const idx = require('../index');
        components = Object.assign({}, idx, components);
      } catch (e) {
        try {
          components.CommentMessageBubble = components.CommentMessageBubble || require('./CommentMessageBubble').CommentMessageBubble;
          components.CommentComposer = components.CommentComposer || require('./CommentComposer').CommentComposer;
        } catch (e2) {}
      }
    }

    const CommentMessageBubble = (props && props.CommentMessageBubble) || components.CommentMessageBubble;
    const CommentComposer = (props && props.CommentComposer) || components.CommentComposer;

    const lineId = line.line_id || '';
    const lineName = line.name || 'Deliverable Item';
    const quantity = line.quantity || 1;
    const uom = line.uom || 'Units';
    const unitPrice = line.unit_price || 0;
    const lineTotal = line.total_amount || 0;

    // 1. Thread Stream Content
    let streamHtml = '';
    if (isLoading) {
      streamHtml = `
        <div class="py-12 px-6 text-center space-y-3" data-state="loading">
          <div class="w-8 h-8 mx-auto border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs text-slate-500">Loading line conversation...</p>
        </div>
      `;
    } else if (comments.length === 0) {
      streamHtml = `
        <div class="py-16 px-6 text-center" data-state="empty">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          </div>
          <h4 class="text-sm font-bold text-slate-800">No questions yet</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Have questions about specifications, licensing, or delivery schedule? Ask your account executive below.</p>
        </div>
      `;
    } else {
      streamHtml = `
        <div class="p-6 space-y-4" data-component="CommentThreadStream">
          ${comments.map(c => CommentMessageBubble ? CommentMessageBubble({ comment: c, currentRevision }) : '').join('')}
        </div>
      `;
    }

    // 2. Composer
    const composerHtml = CommentComposer
      ? CommentComposer({ lineId })
      : '';

    return `
      <div class="fixed inset-0 z-50 overflow-hidden ${isOpen ? '' : 'hidden'}" data-component="LineDiscussionDrawer" data-line-id="${lineId}" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" data-action="close-line-drawer"></div>

        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
            <!-- Top Drawer Header -->
            <div class="p-6 bg-slate-50 border-b border-slate-200 shrink-0">
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-[10px] font-bold font-mono uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Line Discussion
                  </span>
                  <h3 class="text-base font-bold text-slate-900 mt-1.5 line-clamp-1" title="${lineName}">${lineName}</h3>
                  <div class="flex items-center space-x-2 text-xs text-slate-500 mt-1 font-mono">
                    <span>${quantity} ${uom}</span>
                    <span>•</span>
                    <span>${formatCurrency(unitPrice, currency)} / unit</span>
                    <span>•</span>
                    <strong class="text-slate-900 font-semibold">${formatCurrency(lineTotal, currency)}</strong>
                  </div>
                </div>

                <button type="button" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors" data-action="close-line-drawer" aria-label="Close discussion drawer">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              ${unreadCount > 0 ? `
                <div class="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
                  <span class="text-amber-700 font-medium">${unreadCount} unread message(s)</span>
                  <button type="button" class="text-indigo-600 hover:underline font-medium text-[11px]" data-action="mark-line-read" data-line-id="${lineId}">
                    Mark all read
                  </button>
                </div>
              ` : ''}
            </div>

            <!-- Scrollable Message Stream -->
            <div class="flex-1 overflow-y-auto" data-container="discussion-stream">
              ${streamHtml}
            </div>

            <!-- Bottom Composer -->
            ${composerHtml}
          </div>
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LineDiscussionDrawer };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.LineDiscussionDrawer = LineDiscussionDrawer;
  }
})(typeof window !== 'undefined' ? window : this);

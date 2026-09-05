/**
 * DealFlow360 - QuoteDetailHeader Component
 * Hero header for quotation workspace with breadcrumb context, title,
 * status badge, revision indicators, and primary document actions.
 */
(function(root) {
  'use strict';

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return isoStr.substring(0, 10);
    }
  }

  function QuoteDetailHeader(props) {
    const quote = (props && props.quote) || {};
    const user = (props && props.user) || {};
    const QuoteStatusBadge = (props && props.QuoteStatusBadge) ||
      (root.DFComponents && root.DFComponents.QuoteStatusBadge);

    const quoteId = quote.quote_id || '';
    const quoteNumber = quote.quote_number || 'QUO-0000-0000';
    const title = quote.title || 'Commercial Quotation';
    const status = quote.status || 'sent';
    const revNum = quote.revision_number || 1;
    const commentsCount = quote.unread_comments_count !== undefined ? quote.unread_comments_count : 0;
    const isSignatory = user.can_sign_quotes !== false;

    const badgeHtml = QuoteStatusBadge
      ? QuoteStatusBadge({ status: status, size: 'md', showIcon: true })
      : `<span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">${status}</span>`;

    const revisionHtml = `
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200" data-component="RevisionBadge">
        <svg class="w-3 h-3 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Rev ${revNum}
      </span>
    `.trim();

    const signatoryBadge = !isSignatory
      ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200" title="You have review and commentary authority. Organization signatory required for execution.">
          <svg class="w-3 h-3 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Reviewer (Non-Signatory)
        </span>`
      : '';

    return `
      <header class="w-full bg-white border-b border-slate-200 pb-6 mb-6" data-component="QuoteDetailHeader" data-quote-id="${quoteId}">
        <!-- Breadcrumb Navigation -->
        <nav class="flex items-center space-x-2 text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
          <a href="#/quotes" class="hover:text-indigo-600 font-medium flex items-center transition-colors">
            <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            My Quotations
          </a>
          <span class="text-slate-300">/</span>
          <span class="font-mono text-slate-700 font-semibold">${quoteNumber}</span>
        </nav>

        <!-- Main Title & Action Bar -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Left: Identifiers & Metadata -->
          <div class="space-y-1.5">
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">${quoteNumber}</h1>
              ${badgeHtml}
              ${revisionHtml}
              ${signatoryBadge}
            </div>
            <p class="text-sm font-medium text-slate-600 max-w-2xl">${title}</p>
            <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
              <span>Issued: <strong class="text-slate-700 font-semibold">${formatDate(quote.created_at)}</strong></span>
              <span>•</span>
              <span>Expires: <strong class="text-slate-700 font-semibold">${formatDate(quote.expiration_date)}</strong></span>
            </div>
          </div>

          <!-- Right: Document Actions Cluster -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- PDF Download -->
            <button type="button" class="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-colors" data-action="download-pdf" data-quote-id="${quoteId}">
              <svg class="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Export PDF
            </button>

            <!-- Revision History -->
            <button type="button" class="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-colors" data-action="open-revisions" data-quote-id="${quoteId}">
              <svg class="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Revisions
            </button>

            <!-- Line Discussion / Comments -->
            <button type="button" class="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-colors relative" data-action="open-discussion" data-quote-id="${quoteId}">
              <svg class="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              Discussion
              ${commentsCount > 0 ? `<span class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white font-mono tabular-nums">${commentsCount}</span>` : ''}
            </button>
          </div>
        </div>
      </header>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuoteDetailHeader };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.QuoteDetailHeader = QuoteDetailHeader;
  }
})(typeof window !== 'undefined' ? window : this);

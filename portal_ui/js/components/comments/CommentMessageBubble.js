/**
 * DealFlow360 - CommentMessageBubble Component
 * Renders individual threaded comment bubble with author distinction,
 * revision indicators, verified seller badge, and timestamp.
 */
(function(root) {
  'use strict';

  function formatDateTime(isoStr) {
    if (!isoStr) return 'Just now';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoStr;
    }
  }

  function CommentMessageBubble(props) {
    const comment = (props && props.comment) || {};
    const currentRevision = (props && props.currentRevision) || 1;

    const author = comment.author || {};
    const authorType = author.type || 'customer';
    const isCustomer = authorType === 'customer';
    const authorName = author.name || (isCustomer ? 'You' : 'Sales Representative');
    const authorTitle = author.title || (isCustomer ? 'Client Organization' : 'DealFlow360 Team');
    const message = comment.message || '';
    const timeStr = formatDateTime(comment.created_at);
    const revNum = comment.revision_number || 1;
    const isEarlierRev = comment.is_from_earlier_revision || (revNum < currentRevision);
    const isUnread = comment.is_read === false;

    const initials = authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || (isCustomer ? 'CU' : 'DF');

    const bubbleStyle = isCustomer
      ? 'bg-indigo-50/80 border border-indigo-100 text-slate-800 ml-4'
      : 'bg-white border border-slate-200 text-slate-800 mr-4';

    const avatarBg = isCustomer
      ? 'bg-indigo-600 text-white'
      : 'bg-slate-800 text-white';

    const revisionTag = isEarlierRev
      ? `<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200" title="Authored during quote revision #${revNum}">
          Quote Rev #${revNum}
        </span>`
      : '';

    const sellerBadge = !isCustomer
      ? `<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
          <svg class="w-2.5 h-2.5 mr-0.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          ${author.title || 'Account Rep'}
        </span>`
      : '';

    const unreadDot = isUnread
      ? `<span class="w-2 h-2 rounded-full bg-indigo-600 shrink-0" title="Unread message"></span>`
      : '';

    return `
      <div class="flex items-start space-x-3 text-xs mb-4" data-component="CommentMessageBubble" data-comment-id="${comment.comment_id || ''}" data-author-type="${authorType}">
        <!-- Author Avatar -->
        <div class="w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          ${initials}
        </div>

        <!-- Message Body & Metadata -->
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-1.5 mb-1">
            <div class="flex items-center space-x-1.5">
              <span class="font-semibold text-slate-900">${authorName}</span>
              ${sellerBadge}
              ${revisionTag}
            </div>
            <div class="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
              ${unreadDot}
              <span>${timeStr}</span>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl shadow-2xs ${bubbleStyle}">
            <p class="leading-relaxed whitespace-pre-line text-xs">${message}</p>
          </div>
        </div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommentMessageBubble };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.CommentMessageBubble = CommentMessageBubble;
  }
})(typeof window !== 'undefined' ? window : this);

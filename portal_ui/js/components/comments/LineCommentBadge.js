/**
 * DealFlow360 - LineCommentBadge Component
 * Renders row-level comment trigger button with count and unread pill.
 */
(function(root) {
  'use strict';

  function LineCommentBadge(props) {
    const lineId = (props && props.lineId) || '';
    const lineName = (props && props.lineName) || '';
    const totalComments = (props && props.totalComments) || 0;
    const unreadCount = (props && props.unreadCount) || 0;

    const hasComments = totalComments > 0;
    const hasUnread = unreadCount > 0;

    const badgeColorClass = hasUnread
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : (hasComments ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50');

    return `
      <button type="button" class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${badgeColorClass}" data-component="LineCommentBadge" data-action="comment-line" data-line-id="${lineId}" data-line-name="${lineName}" title="${hasUnread ? `${unreadCount} unread comment(s)` : 'Discuss this line deliverable'}">
        <svg class="w-3.5 h-3.5 ${hasComments ? 'text-indigo-600' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        <span class="font-mono text-[11px] tabular-nums">${totalComments}</span>
        ${hasUnread ? `<span class="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-white font-mono tabular-nums">${unreadCount}</span>` : ''}
      </button>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LineCommentBadge };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.LineCommentBadge = LineCommentBadge;
  }
})(typeof window !== 'undefined' ? window : this);

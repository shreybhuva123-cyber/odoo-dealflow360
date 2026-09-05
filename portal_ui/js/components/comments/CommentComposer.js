/**
 * DealFlow360 - CommentComposer Component
 * Rich message composition area with prompt chips, attachment action,
 * and keyboard shortcut submission.
 */
(function(root) {
  'use strict';

  function CommentComposer(props) {
    const lineId = (props && props.lineId) || '';
    const placeholder = (props && props.placeholder) || 'Ask a question about this deliverable (pricing, SLA, timeline)...';
    const isSubmitting = (props && props.isSubmitting) || false;

    return `
      <div class="w-full bg-white border-t border-slate-200 p-4 shrink-0" data-component="CommentComposer" data-line-id="${lineId}">
        <!-- Quick Question Prompts -->
        <div class="flex items-center space-x-1.5 overflow-x-auto pb-2 mb-2 text-[11px]">
          <span class="text-slate-400 font-medium whitespace-nowrap">Suggested:</span>
          <button type="button" class="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors" data-action="quick-prompt" data-prompt="Could you clarify the SLA emergency response commitments for this line?">
            Clarify SLA
          </button>
          <button type="button" class="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors" data-action="quick-prompt" data-prompt="Are volume tier discounts available if we scale licenses in year two?">
            Volume Discount
          </button>
          <button type="button" class="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors" data-action="quick-prompt" data-prompt="What is the estimated deployment timeline after signature?">
            Deployment Timeline
          </button>
        </div>

        <!-- Input Area Form -->
        <form class="space-y-2.5" onsubmit="return false;" data-action="submit-comment-form">
          <textarea
            rows="3"
            name="comment_message"
            class="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none transition"
            placeholder="${placeholder}"
            data-input="comment-message"
            data-line-id="${lineId}"
            ${isSubmitting ? 'disabled' : ''}
          ></textarea>

          <div class="flex items-center justify-between">
            <span class="text-[10px] text-slate-400">Press <kbd class="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Ctrl+Enter</kbd> to send</span>

            <div class="flex items-center space-x-2">
              <button type="button" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors" title="Attach file (PDF, spec doc)" data-action="attach-deliverable-file">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
              </button>

              <button
                type="submit"
                class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}"
                data-action="submit-line-comment"
                data-line-id="${lineId}"
                ${isSubmitting ? 'disabled' : ''}
              >
                <span>${isSubmitting ? 'Sending...' : 'Send Message'}</span>
                <svg class="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommentComposer };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.CommentComposer = CommentComposer;
  }
})(typeof window !== 'undefined' ? window : this);

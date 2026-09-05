import React from 'react';

/**
 * DealFlowDoodleBackground
 *
 * Renders an authentic WhatsApp-style subtle wallpaper pattern behind tabs and workspaces,
 * populated exclusively with DealFlow360 business, deal, and logistics iconography:
 * - Quotations / Contracts / Documents
 * - Handshake / Deal Closing
 * - Currency (₹, $, Coins)
 * - Warehouses / Pallets / Boxes
 * - Delivery Trucks / Cargo Vessels
 * - Bar Charts / Upward Trends / Analytics
 * - Invoices / Receipts
 * - Approvals / Shields / Checkmarks
 * - Sparkles / AI Indicators / Badges
 */
export function DealFlowDoodleBackground({
  className = '',
  opacity = 0.04,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      style={{ opacity }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-foreground dark:text-slate-100"
      >
        <defs>
          <pattern
            id="dealflow-wallpaper-pattern"
            width="320"
            height="320"
            patternUnits="userSpaceOnUse"
          >
            {/* === 1. Quotation Document (Top-Left) === */}
            <g transform="translate(20, 20) scale(0.9)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2h10l6 6v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="6" y1="13" x2="14" y2="13" />
              <line x1="6" y1="17" x2="11" y2="17" />
            </g>

            {/* === 2. Handshake / Deal Win (Top-Center) === */}
            <g transform="translate(140, 25) scale(0.85)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2-2" />
              <path d="m14 14 2.5 2.5a1 1 0 0 0 1.4 0l2.3-2.3a1 1 0 0 0 0-1.4l-1.5-1.5" />
              <path d="M18 11l-1.5-1.5a1 1 0 0 0-1.4 0L10.5 14" />
              <path d="m3 7 3-3a1 1 0 0 1 1.4 0L12 8.5" />
              <path d="M2 13l4.5 4.5a1 1 0 0 0 1.4 0L12 13.4" />
              <path d="m22 7-3-3a1 1 0 0 0-1.4 0L14 7.5" />
            </g>

            {/* === 3. Rupee / Currency Coin (Top-Right) === */}
            <g transform="translate(255, 20) scale(0.9)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M7 6h9" />
              <path d="M7 10h6" />
              <path d="M7 10a4 4 0 0 0 4 4h1" />
              <path d="m10 14 5 6" />
            </g>

            {/* === 4. Growth Chart (Mid-Left) === */}
            <g transform="translate(30, 110) scale(0.9)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </g>

            {/* === 5. Warehouse / Factory (Center) === */}
            <g transform="translate(135, 105) scale(0.95)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21V9l9-6 9 6v12H3z" />
              <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
              <line x1="3" y1="11" x2="21" y2="11" />
            </g>

            {/* === 6. Shipping Truck (Mid-Right) === */}
            <g transform="translate(245, 115) scale(0.9)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </g>

            {/* === 7. Security Shield / Approval (Lower-Left) === */}
            <g transform="translate(35, 205) scale(0.9)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </g>

            {/* === 8. Inventory Package / Carton (Lower-Center) === */}
            <g transform="translate(145, 210) scale(0.9)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 9.4 7.55 4.24a1.8 1.8 0 0 0-1.8 0L2.1 6.34a1.8 1.8 0 0 0-.9 1.56v7.4a1.8 1.8 0 0 0 .9 1.56l7.65 4.4a1.8 1.8 0 0 0 1.8 0l7.65-4.4a1.8 1.8 0 0 0 .9-1.56V7.9a1.8 1.8 0 0 0-.9-1.56z" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <line x1="12" y1="22" x2="12" y2="12" />
            </g>

            {/* === 9. Invoice / Receipt (Lower-Right) === */}
            <g transform="translate(250, 200) scale(0.88)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2v20l3-1.5 3 1.5 3-1.5 3 1.5 3-1.5 3 1.5V2l-3 1.5-3-1.5-3 1.5-3-1.5-3 1.5L4 2z" />
              <line x1="8" y1="8" x2="16" y2="8" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="16" x2="12" y2="16" />
            </g>

            {/* === 10. AI Sparkle (Doodle filler 1) === */}
            <g transform="translate(90, 65) scale(0.75)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
            </g>

            {/* === 11. Credit Card (Doodle filler 2) === */}
            <g transform="translate(205, 60) scale(0.75)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </g>

            {/* === 12. Percentage / Discount Tag (Doodle filler 3) === */}
            <g transform="translate(85, 160) scale(0.75)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8-8z" />
              <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
            </g>

            {/* === 13. Kanban Columns (Doodle filler 4) === */}
            <g transform="translate(200, 165) scale(0.75)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="5" height="18" rx="1" />
              <rect x="10" y="3" width="5" height="11" rx="1" />
              <rect x="17" y="3" width="5" height="15" rx="1" />
            </g>

            {/* === 14. Subscription Recycle Loop (Doodle filler 5) === */}
            <g transform="translate(90, 260) scale(0.75)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </g>

            {/* === 15. Barcode / Dispatch Label (Doodle filler 6) === */}
            <g transform="translate(205, 265) scale(0.75)" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5v14" />
              <path d="M8 5v14" />
              <path d="M12 5v14" />
              <path d="M17 5v14" />
              <path d="M21 5v14" />
            </g>

            {/* Tiny accent stars/dots */}
            <circle cx="15" cy="80" r="1.5" fill="currentColor" />
            <circle cx="305" cy="70" r="1.5" fill="currentColor" />
            <circle cx="160" cy="180" r="1.5" fill="currentColor" />
            <circle cx="20" cy="280" r="1.5" fill="currentColor" />
            <circle cx="300" cy="285" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dealflow-wallpaper-pattern)" />
      </svg>
    </div>
  );
}

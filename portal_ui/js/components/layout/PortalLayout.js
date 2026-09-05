/**
 * DealFlow360 - PortalLayout Component
 * Root application shell rendering header, optional banner, navigation breadcrumbs, main content slot, and overlay portal roots.
 */
(function(root) {
  'use strict';

  function PortalLayout(props) {
    const headerHtml = (props && props.headerHtml) || '';
    const bannerHtml = (props && props.bannerHtml) || '';
    const navHtml = (props && props.navHtml) || '';
    const contentHtml = (props && props.contentHtml) || '';

    return `
      <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased" data-component="PortalLayout">
        <!-- Header Slot -->
        <div id="df-portal-header-slot">
          ${headerHtml}
        </div>

        <!-- Banner / Alert Slot -->
        ${bannerHtml ? `<div id="df-portal-banner-slot">${bannerHtml}</div>` : '<div id="df-portal-banner-slot" class="hidden"></div>'}

        <!-- Breadcrumb / Nav Slot -->
        ${navHtml ? `<div id="df-portal-nav-slot">${navHtml}</div>` : '<div id="df-portal-nav-slot" class="hidden"></div>'}

        <!-- Main Viewport Slot -->
        <main id="df-portal-main-slot" class="flex-1 flex flex-col">
          ${contentHtml}
        </main>

        <!-- Overlay Portals Root -->
        <div id="df-modal-portal" class="relative z-50"></div>
        <div id="df-drawer-portal" class="relative z-50"></div>
        <div id="df-toast-portal" class="df-toast-viewport"></div>
      </div>
    `.trim();
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortalLayout };
  } else {
    root.DFComponents = root.DFComponents || {};
    root.DFComponents.PortalLayout = PortalLayout;
  }
})(typeof window !== 'undefined' ? window : this);

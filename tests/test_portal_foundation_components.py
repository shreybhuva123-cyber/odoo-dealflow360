"""
DealFlow360 - Customer Portal Foundation Component Unit Test Suite
Phase 4: Automated verification of reusable, zero-business-logic UI component primitives,
layout containers, overlay portals, RFC 7807 error/toast visualizers, and static delivery.
"""

import os
import json
import socket
import threading
import unittest
import urllib.request
import urllib.error
import subprocess
from http.server import HTTPServer

from mock_server.portal_mock_api import PortalMockHandler, PORT


def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


class TestPortalFoundationComponents(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_port = get_free_port()
        cls.server = HTTPServer(('127.0.0.1', cls.test_port), PortalMockHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.test_port}"
        cls.project_root = os.path.dirname(os.path.dirname(__file__))

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def _exec_node_component(self, js_code: str):
        """Helper to evaluate component output in Node.js"""
        full_code = f"""
        const c = require('./portal_ui/js/components');
        {js_code}
        """
        proc = subprocess.run(
            ['node', '-e', full_code],
            cwd=self.project_root,
            capture_output=True,
            text=True,
            timeout=5
        )
        if proc.returncode != 0:
            raise RuntimeError(f"Node execution failed: {proc.stderr}")
        return proc.stdout.strip()

    # 1. Quote Status Badges
    def test_01_quote_status_badges(self):
        statuses = ['draft', 'sent', 'in_negotiation', 'approved', 'rejected', 'expired']
        for s in statuses:
            html = self._exec_node_component(f"console.log(c.QuoteStatusBadge({{ status: '{s}' }}));")
            self.assertIn('data-component="QuoteStatusBadge"', html)
            self.assertIn(f'data-status="{s}"', html)
            if s == 'in_negotiation':
                self.assertIn('data-pulse="true"', html)
                self.assertIn('animate-ping', html)
                self.assertIn('In Negotiation', html)
            elif s == 'approved':
                self.assertIn('Approved & Signed', html)
                self.assertIn('bg-emerald-50', html)
            elif s == 'rejected':
                self.assertIn('Declined', html)
                self.assertIn('bg-rose-50', html)

    # 2. Negotiation Status Badges
    def test_02_negotiation_status_badges(self):
        neg_statuses = [
            'pending_seller_review',
            'pending_buyer_review',
            'approved_by_seller',
            'declined_by_seller'
        ]
        for ns in neg_statuses:
            html = self._exec_node_component(f"console.log(c.NegotiationStatusBadge({{ status: '{ns}' }}));")
            self.assertIn('data-component="NegotiationStatusBadge"', html)
            self.assertIn(f'data-status="{ns}"', html)
            if ns == 'pending_buyer_review':
                self.assertIn('animate-ping', html)
                self.assertIn('Action Required: Your Review', html)
            elif ns == 'approved_by_seller':
                self.assertIn('Revised Terms Approved', html)

    # 3. Customer Identity & Signatory Privileges
    def test_03_customer_identity_signatory(self):
        # Signatory User
        signatory_html = self._exec_node_component("""
        console.log(c.CustomerIdentity({
            user: {
                name: 'Sarah Connor',
                email: 'sarah@cyberdyne.com',
                commercialPartnerName: 'Cyberdyne Systems',
                canSignQuotes: true,
                partnerId: 1042
            }
        }));
        """)
        self.assertIn('Sarah Connor', signatory_html)
        self.assertIn('Cyberdyne Systems', signatory_html)
        self.assertIn('data-partner-id="1042"', signatory_html)
        self.assertIn('Signatory', signatory_html)
        self.assertIn('SC', signatory_html)  # Initials

        # Viewer User
        viewer_html = self._exec_node_component("""
        console.log(c.CustomerIdentity({
            user: {
                name: 'David Kim',
                email: 'david@cyberdyne.com',
                commercialPartnerName: 'Cyberdyne Systems',
                canSignQuotes: false,
                partnerId: 1042
            }
        }));
        """)
        self.assertIn('David Kim', viewer_html)
        self.assertIn('Viewer', viewer_html)
        self.assertNotIn('bg-emerald-100 text-emerald-800', viewer_html)

    # 4. Portal Header
    def test_04_portal_header(self):
        header_html = self._exec_node_component("""
        console.log(c.PortalHeader({
            tenantName: 'Cyberdyne Defense Systems',
            portalEnvironment: 'staging',
            unreadNotificationCount: 3,
            identityHtml: '<div id="test-identity">Identity</div>'
        }));
        """)
        self.assertIn('data-component="PortalHeader"', header_html)
        self.assertIn('DealFlow<span class="text-indigo-600">360</span>', header_html)
        self.assertIn('Customer Portal', header_html)
        self.assertIn('staging', header_html)
        self.assertIn('Cyberdyne Defense Systems', header_html)
        self.assertIn('data-action="toggle-notifications"', header_html)
        self.assertIn('data-action="logout"', header_html)
        self.assertIn('id="test-identity"', header_html)

    # 5. Main Content Area
    def test_05_main_content_area(self):
        area_html = self._exec_node_component("""
        console.log(c.MainContentArea({
            title: 'Quotation QUO-2026-0819',
            subtitle: 'Enterprise AI Modernization Suite',
            statusBadgeHtml: '<span id="badge">Approved</span>',
            actionsHtml: '<button id="btn-sign">Accept & Sign</button>',
            contentHtml: '<div id="quote-body">Quote Content</div>'
        }));
        """)
        self.assertIn('data-component="MainContentArea"', area_html)
        self.assertIn('Quotation QUO-2026-0819', area_html)
        self.assertIn('Enterprise AI Modernization Suite', area_html)
        self.assertIn('id="badge"', area_html)
        self.assertIn('id="btn-sign"', area_html)
        self.assertIn('id="quote-body"', area_html)

    # 6. Portal Layout & Overlay Mountpoints
    def test_06_portal_layout_overlay_portals(self):
        layout_html = self._exec_node_component("""
        console.log(c.PortalLayout({
            headerHtml: '<header id="h">Header</header>',
            bannerHtml: '<div id="b">Banner</div>',
            navHtml: '<nav id="n">Nav</nav>',
            contentHtml: '<section id="c">Content</section>'
        }));
        """)
        self.assertIn('data-component="PortalLayout"', layout_html)
        self.assertIn('id="df-portal-header-slot"', layout_html)
        self.assertIn('id="df-portal-banner-slot"', layout_html)
        self.assertIn('id="df-portal-nav-slot"', layout_html)
        self.assertIn('id="df-portal-main-slot"', layout_html)
        # Verify overlay portals
        self.assertIn('id="df-modal-portal"', layout_html)
        self.assertIn('id="df-drawer-portal"', layout_html)
        self.assertIn('id="df-toast-portal"', layout_html)

    # 7. Breadcrumb Trail
    def test_07_breadcrumb_trail(self):
        bc_html = self._exec_node_component("""
        console.log(c.BreadcrumbTrail({
            items: [
                { label: 'Home', href: '#/dashboard' },
                { label: 'My Quotations', href: '#/quotes' },
                { label: 'QUO-2026-0819', active: true }
            ]
        }));
        """)
        self.assertIn('data-component="BreadcrumbTrail"', bc_html)
        self.assertIn('aria-label="Breadcrumb"', bc_html)
        self.assertIn('href="#/dashboard"', bc_html)
        self.assertIn('href="#/quotes"', bc_html)
        self.assertIn('aria-current="page"', bc_html)
        self.assertIn('QUO-2026-0819', bc_html)

    # 8. Modal Dialog Primitive
    def test_08_modal_dialog(self):
        modal_html = self._exec_node_component("""
        console.log(c.ModalDialog({
            id: 'esign-modal',
            isOpen: true,
            title: 'Accept & Sign Quotation',
            description: 'Enter your legal signature below',
            size: 'xl',
            bodyHtml: '<div id="canvas-pad">Pad</div>',
            footerHtml: '<button id="btn-submit">Confirm Signature</button>'
        }));
        """)
        self.assertIn('id="esign-modal"', modal_html)
        self.assertIn('role="dialog"', modal_html)
        self.assertIn('aria-modal="true"', modal_html)
        self.assertIn('aria-labelledby="esign-modal-title"', modal_html)
        self.assertIn('Accept & Sign Quotation', modal_html)
        self.assertIn('max-w-4xl', modal_html)
        self.assertIn('id="canvas-pad"', modal_html)
        self.assertIn('id="btn-submit"', modal_html)
        self.assertIn('data-action="close-modal"', modal_html)

    # 9. Slide-Over Drawer
    def test_09_slide_over_drawer(self):
        drawer_html = self._exec_node_component("""
        console.log(c.SlideOverDrawer({
            id: 'comments-drawer',
            isOpen: true,
            title: 'Line Item Discussion',
            subtitle: 'Implementation & Training Workshop',
            width: 'xl',
            bodyHtml: '<div id="chat-stream">Chat Stream</div>',
            footerHtml: '<input id="chat-input" placeholder="Type message...">'
        }));
        """)
        self.assertIn('id="comments-drawer"', drawer_html)
        self.assertIn('role="dialog"', drawer_html)
        self.assertIn('Line Item Discussion', drawer_html)
        self.assertIn('Implementation & Training Workshop', drawer_html)
        self.assertIn('max-w-xl', drawer_html)
        self.assertIn('data-action="close-drawer"', drawer_html)
        self.assertIn('id="chat-stream"', drawer_html)

    # 10. Confirmation Dialog (Destructive & Primary)
    def test_10_confirmation_dialog(self):
        confirm_html = self._exec_node_component("""
        console.log(c.ConfirmationDialog({
            id: 'decline-quote-dialog',
            isOpen: true,
            variant: 'danger',
            title: 'Decline Quotation QUO-2026-0819',
            message: 'Are you sure you want to decline this quote? This action cannot be undone.',
            confirmLabel: 'Decline Quote',
            cancelLabel: 'Keep Quote Active',
            requireCheckbox: true,
            checkboxLabel: 'I confirm that Cyberdyne Systems is formally declining this proposal.'
        }));
        """)
        self.assertIn('id="decline-quote-dialog"', confirm_html)
        self.assertIn('role="alertdialog"', confirm_html)
        self.assertIn('data-variant="danger"', confirm_html)
        self.assertIn('Decline Quotation QUO-2026-0819', confirm_html)
        self.assertIn('Decline Quote', confirm_html)
        self.assertIn('Keep Quote Active', confirm_html)
        self.assertIn('data-role="confirm-check"', confirm_html)
        self.assertIn('data-action="execute-confirm"', confirm_html)

    # 11. Toast Notifications & RFC 7807 Error Integration
    def test_11_toast_item_rfc7807(self):
        toast_html = self._exec_node_component("""
        console.log(c.ToastItem({
            id: 'toast-404',
            type: 'error',
            title: 'Quote Not Found',
            message: 'The requested quotation does not exist or access has expired.',
            errorCode: 'QUOTE_NOT_FOUND',
            actionLabel: 'Contact Sales',
            duration: 6000
        }));
        """)
        self.assertIn('id="toast-404"', toast_html)
        self.assertIn('data-component="ToastItem"', toast_html)
        self.assertIn('data-type="error"', toast_html)
        self.assertIn('Quote Not Found', toast_html)
        self.assertIn('QUOTE_NOT_FOUND', toast_html)
        self.assertIn('Contact Sales', toast_html)
        self.assertIn('data-action="dismiss-toast"', toast_html)

    # 12. Loading Skeletons
    def test_12_loading_skeletons(self):
        shimmer_html = self._exec_node_component("""
        const t = c.LoadingSkeleton.SkeletonText({ lines: 4 });
        const c_card = c.LoadingSkeleton.SkeletonCard();
        const tbl = c.LoadingSkeleton.SkeletonTable({ rows: 3 });
        const qh = c.LoadingSkeleton.SkeletonQuoteHeader();
        console.log(t + c_card + tbl + qh);
        """)
        self.assertIn('data-component="SkeletonText"', shimmer_html)
        self.assertIn('data-component="SkeletonCard"', shimmer_html)
        self.assertIn('data-component="SkeletonTable"', shimmer_html)
        self.assertIn('data-component="SkeletonQuoteHeader"', shimmer_html)
        self.assertIn('df-shimmer', shimmer_html)

    # 13. Standardized Error View (RFC 7807)
    def test_13_error_view(self):
        err_html = self._exec_node_component("""
        console.log(c.ErrorView({
            title: 'Access Denied',
            errorCode: 'FORBIDDEN_SIGNATORY_REQUIRED',
            message: 'Your account is authorized as a Viewer and cannot execute legal contracts.',
            illustration: '403',
            primaryActionLabel: 'Request Signatory Access',
            secondaryActionLabel: 'Back to Overview'
        }));
        """)
        self.assertIn('data-component="ErrorView"', err_html)
        self.assertIn('FORBIDDEN_SIGNATORY_REQUIRED', err_html)
        self.assertIn('Access Denied', err_html)
        self.assertIn('Request Signatory Access', err_html)
        self.assertIn('Back to Overview', err_html)

    # 14. Empty State View
    def test_14_empty_state_view(self):
        empty_html = self._exec_node_component("""
        console.log(c.EmptyStateView({
            title: 'No Active Negotiations',
            description: 'All proposals are currently finalized or under standard terms.',
            iconType: 'quotes',
            actionLabel: 'Browse All Quotations'
        }));
        """)
        self.assertIn('data-component="EmptyStateView"', empty_html)
        self.assertIn('No Active Negotiations', empty_html)
        self.assertIn('All proposals are currently finalized', empty_html)
        self.assertIn('Browse All Quotations', empty_html)

    # 15. Server Static Asset Delivery
    def test_15_server_static_asset_delivery(self):
        # 1. Test CSS delivery
        css_url = f"{self.base_url}/css/portal-foundation.css"
        req = urllib.request.Request(css_url)
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn('text/css', resp.headers.get('Content-Type', ''))
            css_body = resp.read().decode('utf-8')
            self.assertIn('--df-bg-primary', css_body)
            self.assertIn('df-shimmer', css_body)
            self.assertIn('tabular-nums', css_body)

        # 2. Test JS component delivery
        js_url = f"{self.base_url}/js/components/badges/QuoteStatusBadge.js"
        req_js = urllib.request.Request(js_url)
        with urllib.request.urlopen(req_js) as resp_js:
            self.assertEqual(resp_js.status, 200)
            self.assertIn('application/javascript', resp_js.headers.get('Content-Type', ''))
            js_body = resp_js.read().decode('utf-8')
            self.assertIn('QuoteStatusBadge', js_body)

    # 16. Portal SPA Integration Checks
    def test_16_portal_spa_script_integration(self):
        portal_url = f"{self.base_url}/portal"
        req = urllib.request.Request(portal_url)
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode('utf-8')
            self.assertIn('/css/portal-foundation.css', html)
            self.assertIn('/js/components/badges/QuoteStatusBadge.js', html)
            self.assertIn('/js/components/overlays/ModalDialog.js', html)
            self.assertIn('/js/components/feedback/ToastSystem.js', html)
            self.assertIn('/js/components/index.js', html)


if __name__ == '__main__':
    unittest.main()

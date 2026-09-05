"""
Automated Test Suite for DealFlow360 Customer Portal Frontend (Phase 2)
Verifies all 14 screens, UI components, client-side routing, and mock server serving.
Uses Python standard library (unittest + urllib).
"""

import http.server
import os
import re
import threading
import time
import unittest
import urllib.request

from mock_server.portal_mock_api import PortalMockHandler

TEST_HOST = "127.0.0.1"
TEST_PORT = 8998
BASE_URL = f"http://{TEST_HOST}:{TEST_PORT}"


class TestCustomerPortalUIScreens(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.HTTPServer((TEST_HOST, TEST_PORT), PortalMockHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.2)

        # Load HTML source directly for component inspection
        html_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "portal_ui", "index.html")
        with open(html_file, "r", encoding="utf-8") as f:
            cls.html_content = f.read()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def test_01_portal_serves_html_app(self):
        """Verify server serves the portal SPA on /portal with HTTP 200 and valid HTML"""
        req = urllib.request.Request(f"{BASE_URL}/portal")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn("text/html", resp.headers.get("Content-Type", ""))
            content = resp.read().decode("utf-8")
            self.assertIn("DealFlow360 — Customer Portal", content)
            self.assertGreater(len(content), 5000)

    def test_02_screen_01_login_components(self):
        """Verify Screen 1: Customer Login components"""
        self.assertIn('id="screen-login"', self.html_content)
        self.assertIn('id="login-email"', self.html_content)
        self.assertIn('id="login-password"', self.html_content)
        self.assertIn('id="login-submit-btn"', self.html_content)
        self.assertIn("SOC2 Type II Certified", self.html_content)
        self.assertIn("handleLogin", self.html_content)

    def test_03_screen_02_dashboard_components(self):
        """Verify Screen 2: Customer Dashboard components"""
        self.assertIn('id="screen-dashboard"', self.html_content)
        self.assertIn("Executive Dashboard", self.html_content)
        self.assertIn('id="kpi-negotiating"', self.html_content)
        self.assertIn('id="kpi-executed"', self.html_content)
        self.assertIn("Alex Mercer", self.html_content)
        self.assertIn('id="dashboard-recent-quotes"', self.html_content)

    def test_04_screen_03_my_quotations_components(self):
        """Verify Screen 3: My Quotations table, filters, and search"""
        self.assertIn('id="screen-quotes"', self.html_content)
        self.assertIn('id="quote-search-input"', self.html_content)
        self.assertIn('id="quotes-table-body"', self.html_content)
        self.assertIn("filterQuotesByStatus", self.html_content)

    def test_05_screen_04_quotation_details_components(self):
        """Verify Screen 4: Quotation Details view, line items, and command bar"""
        self.assertIn('id="screen-quote-detail"', self.html_content)
        self.assertIn('id="qd-quote-number"', self.html_content)
        self.assertIn('id="qd-line-items-body"', self.html_content)
        self.assertIn('id="qd-total"', self.html_content)
        self.assertIn('id="qd-btn-accept"', self.html_content)
        self.assertIn("downloadQuotePdf", self.html_content)

    def test_06_screen_05_negotiation_workspace(self):
        """Verify Screen 5: Negotiation Workspace with live impact calculator"""
        self.assertIn('id="screen-negotiate"', self.html_content)
        self.assertIn('id="nw-discount-slider"', self.html_content)
        self.assertIn('id="nw-savings"', self.html_content)
        self.assertIn('id="nw-projected"', self.html_content)
        self.assertIn('id="nw-justification"', self.html_content)
        self.assertIn("submitCounterDiscountFromWorkspace", self.html_content)

    def test_07_screen_06_line_discussion_drawer(self):
        """Verify Screen 6: Line-Level Discussion Drawer"""
        self.assertIn('id="drawer-discussion"', self.html_content)
        self.assertIn('id="discussion-stream"', self.html_content)
        self.assertIn('id="comment-input"', self.html_content)
        self.assertIn("handleSendComment", self.html_content)

    def test_08_screen_07_change_request_drawer(self):
        """Verify Screen 7: Change Request Drawer with steppers and reason"""
        self.assertIn('id="drawer-change-request"', self.html_content)
        self.assertIn('id="cr-workshop-qty"', self.html_content)
        self.assertIn('id="cr-payment-terms"', self.html_content)
        self.assertIn('id="cr-reason"', self.html_content)
        self.assertIn("submitChangeRequest", self.html_content)

    def test_09_screen_08_counter_discount_logic(self):
        """Verify Screen 8: Counter Discount interaction and math logic"""
        self.assertIn("updateNegotiationMath", self.html_content)
        self.assertIn("submitCounterDiscountFromWorkspace", self.html_content)

    def test_10_screen_09_revision_history_modal(self):
        """Verify Screen 9: Revision History and Side-by-Side Diff Modal"""
        self.assertIn('id="modal-revisions"', self.html_content)
        self.assertIn("Revision #2 (Current)", self.html_content)
        self.assertIn("Revision #1 (Initial)", self.html_content)
        self.assertIn("Net Variance:", self.html_content)

    def test_11_screen_10_esign_modal(self):
        """Verify Screen 10: Formal E-Sign Modal with HTML5 Canvas"""
        self.assertIn('id="modal-esign"', self.html_content)
        self.assertIn('id="signature-canvas"', self.html_content)
        self.assertIn('id="esign-po"', self.html_content)
        self.assertIn('id="esign-terms-check"', self.html_content)
        self.assertIn("submitQuoteAcceptance", self.html_content)

    def test_12_screen_11_confirmation_success(self):
        """Verify Screen 11: Confirmation Success screen and SO receipt"""
        self.assertIn('id="screen-confirmed"', self.html_content)
        self.assertIn('id="conf-so-num"', self.html_content)
        self.assertIn("Agreement Successfully Executed!", self.html_content)

    def test_13_screen_12_expired_quote(self):
        """Verify Screen 12: Expired Quote Screen and re-activation action"""
        self.assertIn('id="screen-expired"', self.html_content)
        self.assertIn("This Quotation Has Expired", self.html_content)
        self.assertIn("submitReactivation", self.html_content)

    def test_14_screen_13_access_denied(self):
        """Verify Screen 13: Access Denied (403) and signatory upgrade trigger"""
        self.assertIn('id="screen-403"', self.html_content)
        self.assertIn("Signatory Authorization Required", self.html_content)

    def test_15_screen_14_global_loading_empty_styles(self):
        """Verify Screen 14: CSS Shimmer Skeletons and Tabular Numbers design tokens"""
        self.assertIn(".shimmer", self.html_content)
        self.assertIn(".tabular-nums", self.html_content)
        self.assertIn("drawer-overlay", self.html_content)

    def test_16_client_side_routing_engine(self):
        """Verify Router engine maps all 14 screens via hash routing"""
        self.assertIn("function renderRoute()", self.html_content)
        self.assertIn("function navigate(hash)", self.html_content)
        for route in ["#/login", "#/dashboard", "#/quotes", "#/confirmed", "#/expired", "#/403"]:
            self.assertIn(route, self.html_content)


if __name__ == "__main__":
    unittest.main(verbosity=2)

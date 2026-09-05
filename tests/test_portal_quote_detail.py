"""
DealFlow360 - Customer Portal Quotation Detail Unit Test Suite
Phase 6: Automated verification of quotation detail data completeness, zero-leak redaction,
anti-IDOR access control, signatory permission rules, negotiation tracking,
and demo-quality presentation components.
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

from mock_server.portal_mock_api import PortalMockHandler, MOCK_USERS, MOCK_QUOTES


def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


class TestPortalQuoteDetail(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_port = get_free_port()
        cls.server = HTTPServer(('127.0.0.1', cls.test_port), PortalMockHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.test_port}/api/v1/portal"
        cls.project_root = os.path.dirname(os.path.dirname(__file__))

        # Customer A: Cyberdyne (commercial_partner_id: 1205)
        cls.token_signatory = MOCK_USERS["usr_c91f0e4b81"]["token"]  # can_sign_quotes: True
        cls.token_viewer = MOCK_USERS["usr_john_connor"]["token"]     # can_sign_quotes: False

        # Customer B: Wayne Enterprises (commercial_partner_id: 7701)
        cls.token_customer_b = MOCK_USERS["usr_bruce_wayne"]["token"]

        cls.auth_signatory = {"Authorization": f"Bearer {cls.token_signatory}"}
        cls.auth_viewer = {"Authorization": f"Bearer {cls.token_viewer}"}
        cls.auth_b = {"Authorization": f"Bearer {cls.token_customer_b}"}

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        MOCK_QUOTES["quo_8819ab2"]["status"] = "sent"
        MOCK_QUOTES["quo_8819ab2"]["negotiation_status"] = "none"

    def tearDown(self):
        MOCK_QUOTES["quo_8819ab2"]["status"] = "sent"
        MOCK_QUOTES["quo_8819ab2"]["negotiation_status"] = "none"

    def _get(self, endpoint: str, headers: dict):
        req = urllib.request.Request(f"{self.base_url}{endpoint}", headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return resp.status, data

    def _post(self, endpoint: str, payload: dict, headers: dict):
        body = json.dumps(payload).encode("utf-8")
        req_headers = {"Content-Type": "application/json", **headers}
        req = urllib.request.Request(f"{self.base_url}{endpoint}", data=body, headers=req_headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return resp.status, data
        except urllib.error.HTTPError as e:
            data = json.loads(e.read().decode("utf-8"))
            return e.code, data

    def _exec_node_component(self, js_code: str):
        full_code = f"""
        const c = require('./portal_ui/js/components');
        {js_code}
        """
        proc = subprocess.run(
            ['node', '-e', full_code],
            cwd=self.project_root,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=5
        )
        if proc.returncode != 0:
            raise RuntimeError(f"Node execution failed: {proc.stderr}")
        return (proc.stdout or '').strip()

    # 1. Detail Data Completeness
    def test_01_quote_detail_data_completeness(self):
        status, body = self._get("/quotes/quo_8819ab2", self.auth_signatory)
        self.assertEqual(status, 200)

        # Core quote metadata
        self.assertEqual(body["quote_id"], "quo_8819ab2")
        self.assertEqual(body["quote_number"], "QUO-2026-0048")
        self.assertEqual(body["status"], "sent")
        self.assertIn("created_at", body)
        self.assertIn("expiration_date", body)
        self.assertEqual(body["currency"], "USD")
        self.assertEqual(body["revision_number"], 1)

        # Pricing Summary & recurring/one-time breakdown
        pricing = body["pricing_summary"]
        self.assertEqual(pricing["subtotal"], 100000.00)
        self.assertEqual(pricing["discount_total"], 0.00)
        self.assertEqual(pricing["tax_total"], 7400.00)
        self.assertEqual(pricing["total_amount"], 107400.00)
        self.assertEqual(pricing["one_time_total"], 13425.00)
        self.assertEqual(pricing["recurring_total"], 93975.00)
        self.assertEqual(pricing["recurring_interval"], "annual")

        # Line Items itemization
        self.assertIn("line_items", body)
        self.assertEqual(len(body["line_items"]), 2)
        line1 = body["line_items"][0]
        self.assertEqual(line1["name"], "Core Security Infrastructure License")
        self.assertEqual(line1["charge_type"], "recurring")
        self.assertEqual(line1["recurring_interval"], "annual")
        self.assertEqual(line1["unit_price"], 87500.00)
        self.assertEqual(line1["tax_amount"], 6475.00)
        self.assertEqual(line1["total_amount"], 93975.00)

        line2 = body["line_items"][1]
        self.assertEqual(line2["name"], "On-Site Implementation & Training Workshop")
        self.assertEqual(line2["charge_type"], "one_time")
        self.assertEqual(line2["unit_price"], 2500.00)
        self.assertEqual(line2["quantity"], 5.0)

        # Billing and commercial terms
        self.assertIn("customer", body)
        self.assertEqual(body["customer"]["company_name"], "Cyberdyne Defense Systems")
        self.assertIn("800 Cyberdyne Blvd", body["customer"]["billing_address"])
        self.assertEqual(body["payment_terms"], "Net 30")
        self.assertIn("Level-2 SLA", body["terms_and_conditions"])

        # Sales Rep
        self.assertEqual(body["sales_rep"]["name"], "Alex Mercer")
        self.assertEqual(body["sales_rep"]["email"], "alex.mercer@dealflow360.com")

    # 2. Zero-Leak Redaction Boundary: No internal margin/cost/commission exposed
    def test_02_zero_leak_redaction_boundary_on_detail(self):
        status, body = self._get("/quotes/quo_8819ab2", self.auth_signatory)
        self.assertEqual(status, 200)

        # Assert no internal keys at root
        for k in body.keys():
            self.assertFalse(k.startswith("_internal"), f"Internal field leaked at root: {k}")
            self.assertNotIn("margin", k.lower())
            self.assertNotIn("commission", k.lower())

        # Assert no internal keys in line items
        for item in body.get("line_items", []):
            for k in item.keys():
                self.assertFalse(k.startswith("_internal"), f"Internal field leaked in line item: {k}")

    # 3. Anti-IDOR Access Control: Customer A cannot view Customer B's quote (404 masked)
    def test_03_anti_idor_access_control_cross_tenant_404(self):
        # Customer A tries to fetch Customer B's quote
        req = urllib.request.Request(
            f"{self.base_url}/quotes/quo_wayne_991",
            headers=self.auth_signatory
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
        self.assertEqual(ctx.exception.code, 404)

        # Customer B tries to fetch Customer A's quote
        req_b = urllib.request.Request(
            f"{self.base_url}/quotes/quo_8819ab2",
            headers=self.auth_b
        )
        with self.assertRaises(urllib.error.HTTPError) as ctx_b:
            urllib.request.urlopen(req_b)
        self.assertEqual(ctx_b.exception.code, 404)

    # 4. Signatory Privilege Enforcement on Execution
    def test_04_signatory_privilege_enforcement(self):
        # Viewer (non-signatory) attempts to accept quote -> 403 Forbidden
        status, body = self._post(
            "/quotes/quo_8819ab2/accept",
            {"accepted_terms": True, "signer_name": "John Connor"},
            headers=self.auth_viewer
        )
        self.assertEqual(status, 403)
        self.assertEqual(body["code"], "FORBIDDEN_SIGNATORY_REQUIRED")

    # 5. Negotiation Status Retrieval
    def test_05_negotiation_status_retrieval(self):
        status, body = self._get("/quotes/quo_8819ab2/negotiation/status", self.auth_signatory)
        self.assertEqual(status, 200)
        self.assertEqual(body["quote_id"], "quo_8819ab2")
        self.assertIn("approval_status", body)
        self.assertEqual(body["approval_status"]["public_stage_name"], "Commercial Management Review")
        self.assertEqual(body["approval_status"]["stage_number"], 1)
        self.assertEqual(body["approval_status"]["total_stages"], 2)

    # 6. Component: QuoteDetailHeader rendering
    def test_06_component_quote_detail_header(self):
        quote_json = json.dumps({
            "quote_id": "quo_8819ab2",
            "quote_number": "QUO-2026-0048",
            "title": "Enterprise Cloud Migration & Threat Defense Suite",
            "status": "sent",
            "revision_number": 2,
            "created_at": "2026-09-01T08:00:00Z",
            "expiration_date": "2026-09-30T23:59:59Z",
            "unread_comments_count": 3
        })
        user_json = json.dumps({"can_sign_quotes": False})

        out = self._exec_node_component(f"""
            const q = {quote_json};
            const u = {user_json};
            const html = c.QuoteDetailHeader({{ quote: q, user: u }});
            console.log(html);
        """)
        self.assertIn('data-component="QuoteDetailHeader"', out)
        self.assertIn("QUO-2026-0048", out)
        self.assertIn("Rev 2", out)
        self.assertIn('data-action="download-pdf"', out)
        self.assertIn('data-action="open-revisions"', out)
        self.assertIn('data-action="open-discussion"', out)
        self.assertIn("Reviewer (Non-Signatory)", out)

    # 7. Component: QuoteNegotiationBanner (In Negotiation)
    def test_07_component_negotiation_banner_in_negotiation(self):
        quote_json = json.dumps({"quote_id": "quo_8819ab2", "status": "in_negotiation", "negotiation_status": "pending_seller_review"})
        neg_json = json.dumps({
            "active_negotiation_type": "counter_discount",
            "approval_status": {
                "public_stage_name": "Commercial Management Review",
                "stage_number": 1,
                "total_stages": 2,
                "estimated_resolution": "2026-09-06T12:00:00Z"
            }
        })

        out = self._exec_node_component(f"""
            const q = {quote_json};
            const n = {neg_json};
            const html = c.QuoteNegotiationBanner({{ quote: q, negotiation: n }});
            console.log(html);
        """)
        self.assertIn('data-banner-type="negotiating"', out)
        self.assertIn("Negotiation In Progress", out)
        self.assertIn("Commercial Management Review", out)
        self.assertIn('data-component="ApprovalStageTracker"', out)
        self.assertIn('data-action="view-negotiation"', out)

    # 8. Component: QuoteNegotiationBanner (Approved & Expired)
    def test_08_component_negotiation_banner_approved_and_expired(self):
        # Approved
        quote_app = json.dumps({"status": "approved", "reference_order_number": "SO-2026-1184", "confirmed_at": "2026-08-28T14:30:00Z"})
        out_app = self._exec_node_component(f"""
            console.log(c.QuoteNegotiationBanner({{ quote: {quote_app} }}));
        """)
        self.assertIn('data-banner-type="approved"', out_app)
        self.assertIn("SO-2026-1184", out_app)
        self.assertIn('data-action="download-executed-contract"', out_app)

        # Expired
        quote_exp = json.dumps({"status": "expired", "expiration_date": "2026-08-01T23:59:59Z"})
        out_exp = self._exec_node_component(f"""
            console.log(c.QuoteNegotiationBanner({{ quote: {quote_exp} }}));
        """)
        self.assertIn('data-banner-type="expired"', out_exp)
        self.assertIn("Quotation Expired", out_exp)
        self.assertIn('data-action="request-extension"', out_exp)

    # 9. Component: QuoteLineItemsTable
    def test_09_component_line_items_table(self):
        lines_json = json.dumps([
            {
                "line_id": "line_4020",
                "name": "Core Security Infrastructure License",
                "description": "Annual enterprise tier license.",
                "charge_type": "recurring",
                "recurring_interval": "annual",
                "quantity": 1.0,
                "uom": "Units",
                "unit_price": 87500.00,
                "discount_percent": 5.0,
                "tax_amount": 6475.00,
                "total_amount": 89600.00
            },
            {
                "line_id": "line_4021",
                "name": "Implementation Workshop",
                "charge_type": "one_time",
                "quantity": 5.0,
                "uom": "Days",
                "unit_price": 2500.00,
                "discount_percent": 0.0,
                "tax_amount": 925.00,
                "total_amount": 13425.00
            }
        ])

        out = self._exec_node_component(f"""
            const lines = {lines_json};
            console.log(c.QuoteLineItemsTable({{ lines, currency: 'USD', canNegotiate: true }}));
        """)
        self.assertIn('data-component="QuoteLineItemsTable"', out)
        self.assertIn("Core Security Infrastructure License", out)
        self.assertIn("Recurring (annual)", out)
        self.assertIn("One-Time", out)
        self.assertIn("-5%", out)
        self.assertIn('data-action="comment-line"', out)
        self.assertIn('data-action="request-scope-change"', out)

    # 10. Component: QuotePricingSummary (Signatory vs Viewer)
    def test_10_component_pricing_summary_permissions(self):
        quote_json = json.dumps({
            "quote_id": "quo_8819ab2",
            "status": "sent",
            "can_accept": True,
            "can_negotiate": True,
            "pricing_summary": {
                "subtotal": 100000.00,
                "discount_total": 5000.00,
                "tax_total": 7000.00,
                "total_amount": 102000.00,
                "one_time_total": 12000.00,
                "recurring_total": 90000.00,
                "recurring_interval": "annual"
            }
        })

        # Signatory User
        out_sig = self._exec_node_component(f"""
            const q = {quote_json};
            console.log(c.QuotePricingSummary({{ quote: q, user: {{ can_sign_quotes: true }} }}));
        """)
        self.assertIn('data-component="QuotePricingSummary"', out_sig)
        self.assertIn("$102,000.00", out_sig)
        self.assertIn("-$5,000.00", out_sig)
        self.assertIn('data-action="accept-quote"', out_sig)
        self.assertIn('data-action="open-negotiate"', out_sig)

        # Viewer User (Non-Signatory)
        out_view = self._exec_node_component(f"""
            const q = {quote_json};
            console.log(c.QuotePricingSummary({{ quote: q, user: {{ can_sign_quotes: false }} }}));
        """)
        self.assertIn('data-action="accept-quote-disabled"', out_view)
        self.assertIn("Viewer Role:", out_view)

    # 11. Component: QuoteCommercialTerms & QuoteSalesRepCard
    def test_11_component_commercial_terms_and_rep_card(self):
        quote_json = json.dumps({
            "currency": "USD",
            "payment_terms": "Net 30",
            "terms_and_conditions": "Enterprise SLA Level-2 included. California jurisdiction.",
            "customer": {
                "company_name": "Cyberdyne Defense Systems",
                "contact_name": "Sarah Connor",
                "billing_address": "800 Cyberdyne Blvd, Sunnyvale, CA",
                "shipping_address": "800 Cyberdyne Blvd, Sunnyvale, CA"
            },
            "sales_rep": {
                "name": "Alex Mercer",
                "email": "alex.mercer@dealflow360.com",
                "phone": "+1 (555) 302-8811"
            }
        })

        # Terms
        out_terms = self._exec_node_component(f"""
            console.log(c.QuoteCommercialTerms({{ quote: {quote_json} }}));
        """)
        self.assertIn('data-component="QuoteCommercialTerms"', out_terms)
        self.assertIn("Cyberdyne Defense Systems", out_terms)
        self.assertIn("Net 30", out_terms)
        self.assertIn("Enterprise SLA Level-2", out_terms)

        # Rep Card
        out_rep = self._exec_node_component(f"""
            console.log(c.QuoteSalesRepCard({{ quote: {quote_json} }}));
        """)
        self.assertIn('data-component="QuoteSalesRepCard"', out_rep)
        self.assertIn("Alex Mercer", out_rep)
        self.assertIn("alex.mercer@dealflow360.com", out_rep)
        self.assertIn("Typically responds within 1 hour", out_rep)

    # 12. Component: QuoteDetailContainer (Ready, Loading, Error states)
    def test_12_component_quote_detail_container_states(self):
        # Loading State
        out_loading = self._exec_node_component("""
            console.log(c.QuoteDetailContainer({ isLoading: true }));
        """)
        self.assertIn('data-component="QuoteDetailContainer"', out_loading)
        self.assertIn('data-state="loading"', out_loading)

        # Error State
        out_error = self._exec_node_component("""
            console.log(c.QuoteDetailContainer({
                isLoading: false,
                error: { status: 404, code: 'QUOTE_NOT_FOUND', title: 'Quotation Not Found' }
            }));
        """)
        self.assertIn('data-state="error"', out_error)
        self.assertIn("Quotation Not Found", out_error)

        # Ready State
        quote_json = json.dumps({
            "quote_id": "quo_8819ab2",
            "quote_number": "QUO-2026-0048",
            "title": "Enterprise Cloud Migration",
            "status": "sent",
            "revision_number": 1,
            "created_at": "2026-09-01T08:00:00Z",
            "expiration_date": "2026-09-30T23:59:59Z",
            "currency": "USD",
            "pricing_summary": {
                "subtotal": 100000.00,
                "discount_total": 0.00,
                "tax_total": 7400.00,
                "total_amount": 107400.00,
                "one_time_total": 13425.00,
                "recurring_total": 93975.00
            },
            "customer": {"company_name": "Cyberdyne"},
            "sales_rep": {"name": "Alex Mercer"},
            "line_items": []
        })
        out_ready = self._exec_node_component(f"""
            console.log(c.QuoteDetailContainer({{
                isLoading: false,
                quote: {quote_json},
                user: {{ can_sign_quotes: true }}
            }}));
        """)
        self.assertIn('data-state="ready"', out_ready)
        self.assertIn("QUO-2026-0048", out_ready)
        self.assertIn('data-component="QuotePricingSummary"', out_ready)


if __name__ == "__main__":
    unittest.main()

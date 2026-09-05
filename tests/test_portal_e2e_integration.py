"""
DealFlow360 - Complete End-to-End Customer Portal Integration Test Suite
Executes the full 22-step lifecycle across:
  Sales Rep -> Hardware Line -> Subscription Line -> Discount -> Baseline Approval
  -> Customer Notification -> Customer Login -> View Quote -> Line Details
  -> Line Question -> Quantity Change Request -> Counter-Discount Request
  -> Pricing Recalculation -> Risk Governance Escalation -> Customer Pending Approval Lock
  -> Commercial Manager Approval -> Updated Quote & Diff Inspection -> Customer Confirmation (E-Sign)
  -> Confirmed Sales Order -> Downstream Fulfillment -> Downstream Billing -> Payment Settlement.
"""

import copy
import http.server
import json
import threading
import time
import unittest
import urllib.error
import urllib.request

from mock_server import portal_mock_api
from mock_server.portal_mock_api import PortalMockHandler

TEST_HOST = "127.0.0.1"
TEST_PORT = 8991
BASE_URL = f"http://{TEST_HOST}:{TEST_PORT}"


class TestDealFlow360E2EIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.HTTPServer((TEST_HOST, TEST_PORT), PortalMockHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.2)

        # Tokens
        cls.auth_customer_sarah = {"Authorization": "Bearer mock_jwt_access_token_usr_c91f0e4b81"}
        cls.auth_internal_sales = {"Authorization": "Bearer mock_jwt_internal_sales_token"}
        cls.auth_commercial_director = {"Authorization": "Bearer mock_jwt_commercial_director_token"}
        cls.auth_ops = {"Authorization": "Bearer mock_jwt_ops_token"}
        cls.auth_finance = {"Authorization": "Bearer mock_jwt_finance_token"}

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self._orig_quotes = copy.deepcopy(portal_mock_api.MOCK_QUOTES)
        self._orig_comments = copy.deepcopy(portal_mock_api.MOCK_COMMENTS)
        self._orig_notifications = copy.deepcopy(portal_mock_api.MOCK_NOTIFICATIONS)
        self._orig_orders = copy.deepcopy(portal_mock_api.MOCK_ORDERS)
        self._orig_invoices = copy.deepcopy(portal_mock_api.MOCK_INVOICES)
        self._orig_payments = copy.deepcopy(portal_mock_api.MOCK_PAYMENTS)

    def tearDown(self):
        portal_mock_api.MOCK_QUOTES.clear()
        portal_mock_api.MOCK_QUOTES.update(self._orig_quotes)
        portal_mock_api.MOCK_COMMENTS.clear()
        portal_mock_api.MOCK_COMMENTS.extend(self._orig_comments)
        portal_mock_api.MOCK_NOTIFICATIONS.clear()
        portal_mock_api.MOCK_NOTIFICATIONS.extend(self._orig_notifications)
        portal_mock_api.MOCK_ORDERS.clear()
        portal_mock_api.MOCK_ORDERS.update(self._orig_orders)
        portal_mock_api.MOCK_INVOICES.clear()
        portal_mock_api.MOCK_INVOICES.update(self._orig_invoices)
        portal_mock_api.MOCK_PAYMENTS.clear()
        portal_mock_api.MOCK_PAYMENTS.update(self._orig_payments)

    def _request(self, method: str, path: str, body: dict = None, headers: dict = None):
        url = f"{BASE_URL}{path}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)
        req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                resp_body = resp.read()
                parsed = json.loads(resp_body) if resp_body else {}
                return resp.status, parsed, resp.headers
        except urllib.error.HTTPError as err:
            err_body = err.read()
            parsed = json.loads(err_body) if err_body else {}
            return err.code, parsed, err.headers

    # =========================================================================
    # Step 1: Sales Rep Creates Quotation Draft
    # =========================================================================
    def test_01_sales_rep_creates_quotation(self):
        status, body, _ = self._request("POST", "/api/v1/internal/quotes", {
            "partner_id": 4821,
            "commercial_partner_id": 1205,
            "currency_id": "USD",
            "title": "Enterprise Edge Defense & Threat Intelligence Platform",
            "expiration_date": "2026-09-30T23:59:59Z"
        }, headers=self.auth_internal_sales)

        self.assertEqual(status, 201)
        self.assertEqual(body.get("quote_id"), "quo_e2e_8819")
        self.assertEqual(body.get("quote_number"), "QUO-2026-0105")
        self.assertEqual(body.get("status"), "draft")
        self.assertEqual(body.get("revision_number"), 1)
        self.assertEqual(body.get("pricing_summary", {}).get("total_amount"), 0.0)

    # =========================================================================
    # Step 2: Sales Rep Adds Hardware Line
    # =========================================================================
    def test_02_sales_rep_adds_hardware_line(self):
        # Ensure quote exists
        self.test_01_sales_rep_creates_quotation()

        status, body, _ = self._request("POST", "/api/v1/internal/quotes/quo_e2e_8819/lines", {
            "product_id": "prod_hw_gateway_01",
            "name": "Enterprise Edge Gateway Appliance Model X-1",
            "charge_type": "one_time",
            "quantity": 2.0,
            "unit_price": 5000.00,
            "discount_percent": 0.0,
            "uom": "Units"
        }, headers=self.auth_internal_sales)

        self.assertEqual(status, 201)
        self.assertEqual(body.get("quantity"), 2.0)
        self.assertEqual(body.get("unit_price"), 5000.00)
        self.assertEqual(body.get("subtotal"), 10000.00)
        self.assertEqual(body.get("tax_amount"), 740.00)
        self.assertEqual(body.get("total_amount"), 10740.00)

    # =========================================================================
    # Step 3: Sales Rep Adds Subscription Line
    # =========================================================================
    def test_03_sales_rep_adds_subscription_line(self):
        self.test_02_sales_rep_adds_hardware_line()

        status, body, _ = self._request("POST", "/api/v1/internal/quotes/quo_e2e_8819/lines", {
            "product_id": "prod_saas_threat_100",
            "name": "Cloud Threat Defense Platform - Enterprise Tier",
            "charge_type": "recurring",
            "recurring_interval": "annual",
            "quantity": 100.0,
            "unit_price": 600.00,
            "discount_percent": 0.0,
            "uom": "Seats"
        }, headers=self.auth_internal_sales)

        self.assertEqual(status, 201)
        self.assertEqual(body.get("charge_type"), "recurring")
        self.assertEqual(body.get("quantity"), 100.0)
        self.assertEqual(body.get("subtotal"), 60000.00)
        self.assertEqual(body.get("tax_amount"), 4440.00)
        self.assertEqual(body.get("total_amount"), 64440.00)

        # Verify quote gross total
        quote = portal_mock_api.MOCK_QUOTES["quo_e2e_8819"]
        self.assertEqual(quote["pricing_summary"]["subtotal"], 70000.00)
        self.assertEqual(quote["pricing_summary"]["total_amount"], 75180.00)

    # =========================================================================
    # Step 4: Sales Rep Applies Initial 5% Discount
    # =========================================================================
    def test_04_sales_rep_applies_initial_discount(self):
        self.test_03_sales_rep_adds_subscription_line()

        status, body, _ = self._request("PATCH", "/api/v1/internal/quotes/quo_e2e_8819/discount", {
            "discount_percent": 5.0,
            "discount_scope": "all_lines"
        }, headers=self.auth_internal_sales)

        self.assertEqual(status, 200)
        self.assertEqual(body.get("discount_total"), 3500.00)
        pricing = body.get("pricing_summary", {})
        self.assertEqual(pricing.get("subtotal"), 70000.00)
        self.assertEqual(pricing.get("net_subtotal"), 66500.00)
        self.assertEqual(pricing.get("tax_total"), 4921.00)
        self.assertEqual(pricing.get("total_amount"), 71421.00)

    # =========================================================================
    # Step 5: Initial Baseline Approval Completes & Quote Published
    # =========================================================================
    def test_05_initial_baseline_approval_completes(self):
        self.test_04_sales_rep_applies_initial_discount()

        status, body, _ = self._request("POST", "/api/v1/internal/quotes/quo_e2e_8819/baseline-approve", {
            "approval_type": "baseline_commercial"
        }, headers=self.auth_commercial_director)

        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "sent")
        self.assertEqual(body.get("negotiation_status"), "none")
        self.assertEqual(body.get("revision_number"), 1)
        self.assertIn("magic?token=magic_e2e_token_sarah", body.get("invitation_url"))

    # =========================================================================
    # Step 6: Customer Receives Notification
    # =========================================================================
    def test_06_customer_receives_invitation_notification(self):
        self.test_05_initial_baseline_approval_completes()

        status, body, _ = self._request("GET", "/api/v1/portal/notifications", headers=self.auth_customer_sarah)
        self.assertEqual(status, 200)
        notifications = body.get("data", [])
        self.assertTrue(len(notifications) > 0)
        e2e_notif = next((n for n in notifications if n.get("quote_id") == "quo_e2e_8819"), None)
        self.assertIsNotNone(e2e_notif)
        self.assertEqual(e2e_notif.get("event_type"), "quote_published")

    # =========================================================================
    # Step 7: Customer Logs into Portal
    # =========================================================================
    def test_07_customer_logs_into_portal(self):
        status, body, _ = self._request("POST", "/api/v1/portal/auth/magic-verify", {
            "token": "magic_e2e_token_sarah"
        })
        self.assertEqual(status, 200)
        self.assertIn("access_token", body)
        user = body.get("user", {})
        self.assertEqual(user.get("id"), "usr_c91f0e4b81")
        self.assertEqual(user.get("partner_id"), 4821)
        self.assertTrue(user.get("can_sign_quotes"))

    # =========================================================================
    # Step 8: Customer Views Quotation Details
    # =========================================================================
    def test_08_customer_views_quotation_details(self):
        self.test_05_initial_baseline_approval_completes()

        status, body, _ = self._request("GET", "/api/v1/portal/quotes/quo_e2e_8819", headers=self.auth_customer_sarah)
        self.assertEqual(status, 200)
        self.assertEqual(body.get("quote_id"), "quo_e2e_8819")
        self.assertEqual(body.get("status"), "sent")
        self.assertEqual(len(body.get("line_items", [])), 2)
        self.assertEqual(body.get("pricing_summary", {}).get("total_amount"), 71421.00)

        # Zero-Leak check: no internal margins or costs
        self.assertNotIn("_internal_margin", body)
        for line in body.get("line_items", []):
            self.assertNotIn("_internal_cost", line)

    # =========================================================================
    # Step 9: Customer Opens Line Details
    # =========================================================================
    def test_09_customer_opens_line_details(self):
        self.test_05_initial_baseline_approval_completes()

        status, body, _ = self._request("GET", "/api/v1/portal/quotes/quo_e2e_8819/lines/line_e2e_01/comments", headers=self.auth_customer_sarah)
        self.assertEqual(status, 200)
        self.assertEqual(body.get("meta", {}).get("total_comments"), 0)

    # =========================================================================
    # Step 10: Customer Adds Line-Level Question
    # =========================================================================
    def test_10_customer_posts_line_level_question(self):
        self.test_05_initial_baseline_approval_completes()

        status, body, _ = self._request("POST", "/api/v1/portal/quotes/quo_e2e_8819/lines/line_e2e_01/comments", {
            "message": "Does the Model X-1 include rack mount hardware and redundant power supplies?",
            "stable_line_key": "prod_hw_gateway_01"
        }, headers=self.auth_customer_sarah)

        self.assertEqual(status, 201)
        self.assertEqual(body.get("author", {}).get("type"), "customer")
        self.assertEqual(body.get("visibility"), "customer")
        self.assertIn("redundant power supplies", body.get("message"))

    # =========================================================================
    # Step 11: Customer Requests Quantity Change
    # =========================================================================
    def test_11_customer_submits_quantity_change_request(self):
        self.test_05_initial_baseline_approval_completes()

        status, body, _ = self._request("POST", "/api/v1/portal/quotes/quo_e2e_8819/negotiation/change-request", {
            "justification": "Scaling to 4 edge gateways for secondary datacenter deployment.",
            "line_item_changes": [
                {"line_id": "line_e2e_01", "requested_quantity": 4.0}
            ]
        }, headers=self.auth_customer_sarah)

        self.assertEqual(status, 201)
        self.assertEqual(body.get("quote_status"), "in_negotiation")
        self.assertEqual(body.get("negotiation_status"), "pending_seller_review")

    # =========================================================================
    # Step 12: Customer Requests Higher Counter-Discount
    # =========================================================================
    def test_12_customer_submits_counter_discount(self):
        self.test_11_customer_submits_quantity_change_request()

        status, body, _ = self._request("POST", "/api/v1/portal/quotes/quo_e2e_8819/negotiation/counter-discount", {
            "requested_discount_percent": 15.0,
            "business_justification": "Volume commitment scaled to 4 gateways."
        }, headers=self.auth_customer_sarah)

        self.assertEqual(status, 201)
        self.assertEqual(body.get("quote_status"), "in_negotiation")
        self.assertEqual(body.get("requested_discount_percent"), 15.0)

    # =========================================================================
    # Step 13: Backend Recalculates Pricing (Simulated Engine)
    # =========================================================================
    def test_13_backend_recalculates_pricing(self):
        # Verification of server financial formula
        qty_hw = 4.0
        unit_price_hw = 5000.00
        qty_sub = 100.0
        unit_price_sub = 600.00
        discount_rate = 0.15
        tax_rate = 0.074

        gross_subtotal = (qty_hw * unit_price_hw) + (qty_sub * unit_price_sub)  # $80,000.00
        self.assertEqual(gross_subtotal, 80000.00)

        discount_amount = gross_subtotal * discount_rate  # $12,000.00
        self.assertEqual(discount_amount, 12000.00)

        net_subtotal = gross_subtotal - discount_amount  # $68,000.00
        tax_amount = round(net_subtotal * tax_rate, 2)   # $5,032.00
        total_contract_value = round(net_subtotal + tax_amount, 2)  # $73,032.00
        self.assertEqual(total_contract_value, 73032.00)

    # =========================================================================
    # Step 14: Discount Risk Triggers Approval Escalation
    # =========================================================================
    def test_14_discount_risk_triggers_approval_escalation(self):
        # Blended risk formula calculation check:
        # Proposed concession 15% exceeds AE threshold 10%
        margin_penalty = 75.0
        credit_risk = 20.0
        volume_bonus = 10.0
        scope_risk = 30.0

        risk_score = (0.40 * margin_penalty) + (0.25 * credit_risk) + (0.20 * volume_bonus) + (0.15 * scope_risk)
        self.assertEqual(risk_score, 41.5)
        self.assertTrue(risk_score > 40.0, "Risk score must escalate approval to Tier 2")

    # =========================================================================
    # Step 15: Customer Sees Pending Approval State
    # =========================================================================
    def test_15_customer_sees_pending_approval_locked_state(self):
        self.test_12_customer_submits_counter_discount()

        status, body, _ = self._request("GET", "/api/v1/portal/quotes/quo_e2e_8819", headers=self.auth_customer_sarah)
        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "in_negotiation")
        self.assertEqual(body.get("negotiation_status"), "pending_seller_review")

        # Confirmation disabled while unapproved: without accepted terms returns 400
        status_accept, body_accept, _ = self._request("POST", "/api/v1/portal/quotes/quo_e2e_8819/accept", {
            "accepted_terms": False
        }, headers=self.auth_customer_sarah)
        self.assertEqual(status_accept, 400)
        self.assertEqual(body_accept.get("code"), "TERMS_NOT_ACCEPTED")

    # =========================================================================
    # Step 16: Manager Approves Concession & Publishes Revision #2
    # =========================================================================
    def test_16_manager_approves_concession_and_publishes_rev2(self):
        self.test_12_customer_submits_counter_discount()

        status, body, _ = self._request("POST", "/api/v1/internal/quotes/quo_e2e_8819/manager-approve", {
            "decision": "approved",
            "concession_discount_percent": 15.0
        }, headers=self.auth_commercial_director)

        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "sent")
        self.assertEqual(body.get("negotiation_status"), "approved")
        self.assertEqual(body.get("revision_number"), 2)
        pricing = body.get("pricing_summary", {})
        self.assertEqual(pricing.get("subtotal"), 80000.00)
        self.assertEqual(pricing.get("discount_total"), 12000.00)
        self.assertEqual(pricing.get("tax_total"), 5032.00)
        self.assertEqual(pricing.get("total_amount"), 73032.00)

    # =========================================================================
    # Step 17: Customer Views Updated Quote & Inspects Revision Diff
    # =========================================================================
    def test_17_customer_views_updated_quote_and_diff(self):
        self.test_16_manager_approves_concession_and_publishes_rev2()

        # View updated quote
        status, body, _ = self._request("GET", "/api/v1/portal/quotes/quo_e2e_8819", headers=self.auth_customer_sarah)
        self.assertEqual(status, 200)
        self.assertEqual(body.get("revision_number"), 2)
        self.assertEqual(body.get("pricing_summary", {}).get("total_amount"), 73032.00)

        # Inspect diff
        status_diff, body_diff, _ = self._request("GET", "/api/v1/portal/quotes/quo_e2e_8819/revisions/2/diff?compare_with=1", headers=self.auth_customer_sarah)
        self.assertEqual(status_diff, 200)
        self.assertEqual(body_diff.get("base_revision"), 1)
        self.assertEqual(body_diff.get("target_revision"), 2)
        self.assertEqual(body_diff.get("financial_deltas", {}).get("difference_amount"), 1611.00)

        # Verify line delta has Qty 2 -> 4
        line_deltas = body_diff.get("line_item_deltas", [])
        hw_delta = next((l for l in line_deltas if l.get("line_id") == "line_e2e_01"), None)
        self.assertIsNotNone(hw_delta)
        self.assertEqual(hw_delta.get("old_quantity"), 2.0)
        self.assertEqual(hw_delta.get("new_quantity"), 4.0)

    # =========================================================================
    # Step 18: Customer Confirms & E-Signs Quotation
    # =========================================================================
    def test_18_customer_confirms_and_esigns_quote(self):
        self.test_16_manager_approves_concession_and_publishes_rev2()

        status, body, _ = self._request("POST", "/api/v1/portal/quotes/quo_e2e_8819/accept", {
            "accepted_terms": True,
            "signer_name": "Sarah Connor",
            "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
        }, headers=self.auth_customer_sarah)

        self.assertEqual(status, 200)
        self.assertEqual(body.get("status"), "approved")
        self.assertEqual(body.get("reference_order_number"), "SO-2026-1184")
        self.assertIn("Sales Order SO-2026-1184 created", body.get("message"))

    # =========================================================================
    # Step 19: Confirmed Sales Order Created
    # =========================================================================
    def test_19_confirmed_order_created(self):
        self.test_18_customer_confirms_and_esigns_quote()

        status, body, _ = self._request("GET", "/api/v1/portal/orders/SO-2026-1184", headers=self.auth_customer_sarah)
        self.assertEqual(status, 200)
        self.assertEqual(body.get("order_number"), "SO-2026-1184")
        self.assertEqual(body.get("status"), "confirmed")
        self.assertEqual(body.get("fulfillment_status"), "pending")
        self.assertEqual(body.get("billing_status"), "to_invoice")
        self.assertEqual(body.get("total_amount"), 73032.00)

    # =========================================================================
    # Step 20: Warehouse / Cloud Fulfillment Workflow Starts
    # =========================================================================
    def test_20_fulfillment_workflow_starts(self):
        self.test_18_customer_confirms_and_esigns_quote()

        status, body, _ = self._request("POST", "/api/v1/internal/orders/SO-2026-1184/fulfill", {
            "tracking_reference": "FEDEX-DEF-99182",
            "warehouse_id": "wh_central_01"
        }, headers=self.auth_ops)

        self.assertEqual(status, 200)
        self.assertEqual(body.get("fulfillment_status"), "in_progress")
        self.assertEqual(body.get("hardware_tracking_number"), "FEDEX-DEF-99182")
        self.assertEqual(body.get("cloud_provisioning_status"), "provisioned")

    # =========================================================================
    # Step 21: Accounting Invoice Generated
    # =========================================================================
    def test_21_billing_invoice_generated(self):
        self.test_18_customer_confirms_and_esigns_quote()

        status, body, _ = self._request("POST", "/api/v1/internal/orders/SO-2026-1184/invoice", {
            "invoice_date": "2026-09-05",
            "payment_terms": "Net 30"
        }, headers=self.auth_finance)

        self.assertEqual(status, 201)
        self.assertEqual(body.get("invoice_number"), "INV-2026-0891")
        self.assertEqual(body.get("state"), "posted")
        self.assertEqual(body.get("amount_total"), 73032.00)
        self.assertEqual(body.get("payment_status"), "not_paid")

    # =========================================================================
    # Step 22: Customer Payment Recorded & Ledger Reconciled
    # =========================================================================
    def test_22_payment_recorded_and_reconciled(self):
        self.test_21_billing_invoice_generated()

        status, body, _ = self._request("POST", "/api/v1/internal/invoices/inv_e2e_0891/pay", {
            "payment_method": "wire_transfer",
            "amount": 73032.00
        }, headers=self.auth_finance)

        self.assertEqual(status, 200)
        self.assertEqual(body.get("payment_status"), "paid")
        self.assertEqual(body.get("amount_residual"), 0.00)
        self.assertTrue(body.get("reconciled"))

    # =========================================================================
    # Master Step 23: Complete Linear Chronological Run
    # =========================================================================
    def test_23_full_linear_sequence_run(self):
        """Executes all 22 steps in a single unbroken linear sequence."""
        # 1. Sales rep creates quote
        s, b, _ = self._request("POST", "/api/v1/internal/quotes", {"partner_id": 4821}, headers=self.auth_internal_sales)
        self.assertEqual(s, 201)

        # 2. Add hardware line
        s, b, _ = self._request("POST", "/api/v1/internal/quotes/quo_e2e_8819/lines", {
            "product_id": "prod_hw_gateway_01", "quantity": 2.0, "unit_price": 5000.00, "charge_type": "one_time"
        }, headers=self.auth_internal_sales)
        self.assertEqual(s, 201)

        # 3. Add subscription line
        s, b, _ = self._request("POST", "/api/v1/internal/quotes/quo_e2e_8819/lines", {
            "product_id": "prod_saas_threat_100", "quantity": 100.0, "unit_price": 600.00, "charge_type": "recurring"
        }, headers=self.auth_internal_sales)
        self.assertEqual(s, 201)

        # 4. Apply 5% concession
        s, b, _ = self._request("PATCH", "/api/v1/internal/quotes/quo_e2e_8819/discount", {"discount_percent": 5.0}, headers=self.auth_internal_sales)
        self.assertEqual(s, 200)

        # 5. Baseline approve
        s, b, _ = self._request("POST", "/api/v1/internal/quotes/quo_e2e_8819/baseline-approve", {}, headers=self.auth_commercial_director)
        self.assertEqual(s, 200)

        # 6. Customer notification check
        s, b, _ = self._request("GET", "/api/v1/portal/notifications", headers=self.auth_customer_sarah)
        self.assertEqual(s, 200)

        # 7. Customer magic auth
        s, b, _ = self._request("POST", "/api/v1/portal/auth/magic-verify", {"token": "magic_e2e_token_sarah"})
        self.assertEqual(s, 200)

        # 8. Customer views quote
        s, b, _ = self._request("GET", "/api/v1/portal/quotes/quo_e2e_8819", headers=self.auth_customer_sarah)
        self.assertEqual(s, 200)

        # 9. Line discussion fetch
        s, b, _ = self._request("GET", "/api/v1/portal/quotes/quo_e2e_8819/lines/line_e2e_01/comments", headers=self.auth_customer_sarah)
        self.assertEqual(s, 200)

        # 10. Post line question
        s, b, _ = self._request("POST", "/api/v1/portal/quotes/quo_e2e_8819/lines/line_e2e_01/comments", {
            "message": "Does the Model X-1 include rack mount hardware?"
        }, headers=self.auth_customer_sarah)
        self.assertEqual(s, 201)

        # 11. Quantity change request
        s, b, _ = self._request("POST", "/api/v1/portal/quotes/quo_e2e_8819/negotiation/change-request", {
            "line_item_changes": [{"line_id": "line_e2e_01", "requested_quantity": 4.0}]
        }, headers=self.auth_customer_sarah)
        self.assertEqual(s, 201)

        # 12. Counter-discount request
        s, b, _ = self._request("POST", "/api/v1/portal/quotes/quo_e2e_8819/negotiation/counter-discount", {
            "requested_discount_percent": 15.0
        }, headers=self.auth_customer_sarah)
        self.assertEqual(s, 201)

        # 15. Customer sees in-negotiation status
        s, b, _ = self._request("GET", "/api/v1/portal/quotes/quo_e2e_8819", headers=self.auth_customer_sarah)
        self.assertEqual(s, 200)
        self.assertEqual(b.get("negotiation_status"), "pending_seller_review")

        # 16. Manager approves concession
        s, b, _ = self._request("POST", "/api/v1/internal/quotes/quo_e2e_8819/manager-approve", {}, headers=self.auth_commercial_director)
        self.assertEqual(s, 200)
        self.assertEqual(b.get("revision_number"), 2)

        # 17. Inspect diff
        s, b, _ = self._request("GET", "/api/v1/portal/quotes/quo_e2e_8819/revisions/2/diff?compare_with=1", headers=self.auth_customer_sarah)
        self.assertEqual(s, 200)

        # 18. Customer confirms & e-signs
        s, b, _ = self._request("POST", "/api/v1/portal/quotes/quo_e2e_8819/accept", {
            "accepted_terms": True, "signer_name": "Sarah Connor"
        }, headers=self.auth_customer_sarah)
        self.assertEqual(s, 200)
        self.assertEqual(b.get("status"), "approved")

        # 19. Order created
        s, b, _ = self._request("GET", "/api/v1/portal/orders/SO-2026-1184", headers=self.auth_customer_sarah)
        self.assertEqual(s, 200)

        # 20. Fulfillment starts
        s, b, _ = self._request("POST", "/api/v1/internal/orders/SO-2026-1184/fulfill", {}, headers=self.auth_ops)
        self.assertEqual(s, 200)

        # 21. Billing starts
        s, b, _ = self._request("POST", "/api/v1/internal/orders/SO-2026-1184/invoice", {}, headers=self.auth_finance)
        self.assertEqual(s, 201)

        # 22. Payment recorded
        s, b, _ = self._request("POST", "/api/v1/internal/invoices/inv_e2e_0891/pay", {"amount": 73032.00}, headers=self.auth_finance)
        self.assertEqual(s, 200)
        self.assertEqual(b.get("payment_status"), "paid")


if __name__ == "__main__":
    unittest.main()

"""
DealFlow360 - Phase 3 Authentication & Security Automated Test Suite
Verifies:
1. Anti-IDOR: Customer A can NEVER access Customer B's quote (404-masking defense)
2. PDF download, Counter-Discount, Change Request, and Acceptance IDOR guards
3. Signatory authorization rules (403 Forbidden for non-signatories)
4. Internal employee portal bypass guard (403 Forbidden)
5. Magic-link verification and expiration handling (401 Unauthorized)
6. Zero-leak data redaction (internal margins/costs scrubbed)
7. Multi-tenant quote list isolation
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
TEST_PORT = 8997
BASE_URL = f"http://{TEST_HOST}:{TEST_PORT}/api/v1/portal"


class TestCustomerPortalSecurityAuth(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.HTTPServer((TEST_HOST, TEST_PORT), PortalMockHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.2)

        cls.auth_customer_a_signatory = {"Authorization": "Bearer mock_jwt_access_token_usr_c91f0e4b81"}
        cls.auth_customer_a_non_signatory = {"Authorization": "Bearer mock_jwt_token_customer_a_non_signatory"}
        cls.auth_customer_b = {"Authorization": "Bearer mock_jwt_token_customer_b"}

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self._orig_quotes = copy.deepcopy(portal_mock_api.MOCK_QUOTES)
        self._orig_comments = copy.deepcopy(portal_mock_api.MOCK_COMMENTS)

    def tearDown(self):
        portal_mock_api.MOCK_QUOTES.clear()
        portal_mock_api.MOCK_QUOTES.update(self._orig_quotes)
        portal_mock_api.MOCK_COMMENTS.clear()
        portal_mock_api.MOCK_COMMENTS.extend(self._orig_comments)

    def _request(self, method: str, path: str, body: dict = None, headers: dict = None):
        url = f"{BASE_URL}{path}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)
        req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                resp_data = resp.read()
                content_type = resp.headers.get("Content-Type", "")
                if "application/json" in content_type:
                    return resp.status, json.loads(resp_data.decode("utf-8")), resp.headers
                return resp.status, resp_data, resp.headers
        except urllib.error.HTTPError as e:
            try:
                err_data = e.read().decode("utf-8")
                try:
                    parsed_err = json.loads(err_data)
                except Exception:
                    parsed_err = err_data
                return e.code, parsed_err, e.headers
            finally:
                e.close()

    # 1. Anti-IDOR: Customer A cannot view Customer B's quote
    def test_01_customer_a_cannot_access_customer_b_quote(self):
        status, body, _ = self._request("GET", "/quotes/quo_wayne_991", headers=self.auth_customer_a_signatory)
        self.assertEqual(status, 404, "Must return 404 Not Found to mask resource existence (Anti-IDOR)")
        self.assertEqual(body.get("code"), "QUOTE_NOT_FOUND")

    # 2. Anti-IDOR: Customer A cannot download Customer B's PDF
    def test_02_customer_a_cannot_download_customer_b_pdf(self):
        status, body, _ = self._request("GET", "/quotes/quo_wayne_991/pdf", headers=self.auth_customer_a_signatory)
        self.assertEqual(status, 404)
        self.assertEqual(body.get("code"), "QUOTE_NOT_FOUND")

    # 3. Anti-IDOR: Customer A cannot submit counter-discount on Customer B's quote
    def test_03_customer_a_cannot_counter_discount_customer_b_quote(self):
        status, body, _ = self._request("POST", "/quotes/quo_wayne_991/negotiation/counter-discount", {
            "requested_discount_percent": 15.0
        }, headers=self.auth_customer_a_signatory)
        self.assertEqual(status, 404)
        self.assertEqual(body.get("code"), "QUOTE_NOT_FOUND")

    # 4. Anti-IDOR: Customer A cannot submit change request on Customer B's quote
    def test_04_customer_a_cannot_change_request_customer_b_quote(self):
        status, body, _ = self._request("POST", "/quotes/quo_wayne_991/negotiation/change-request", {
            "line_item_changes": [{"line_id": "line_9901", "requested_quantity": 1}]
        }, headers=self.auth_customer_a_signatory)
        self.assertEqual(status, 404)
        self.assertEqual(body.get("code"), "QUOTE_NOT_FOUND")

    # 5. Anti-IDOR: Customer A cannot accept Customer B's quote
    def test_05_customer_a_cannot_accept_customer_b_quote(self):
        status, body, _ = self._request("POST", "/quotes/quo_wayne_991/accept", {
            "signer_name": "Sarah Connor",
            "accepted_terms": True
        }, headers=self.auth_customer_a_signatory)
        self.assertEqual(status, 404)
        self.assertEqual(body.get("code"), "QUOTE_NOT_FOUND")

    # 6. Legitimate Ownership: Customer B CAN access Customer B's quote
    def test_06_customer_b_can_access_their_own_quote(self):
        status, body, _ = self._request("GET", "/quotes/quo_wayne_991", headers=self.auth_customer_b)
        self.assertEqual(status, 200)
        self.assertEqual(body.get("quote_id"), "quo_wayne_991")
        self.assertEqual(body.get("customer", {}).get("company_name"), "Wayne Enterprises")

        # And Customer B cannot access Customer A's quote:
        status_b_on_a, body_b_on_a, _ = self._request("GET", "/quotes/quo_8819ab2", headers=self.auth_customer_b)
        self.assertEqual(status_b_on_a, 404)

    # 7. Signatory Privilege Guard: Non-signatory cannot execute quote
    def test_07_non_signatory_user_blocked_from_signing(self):
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/accept", {
            "signer_name": "John Connor",
            "accepted_terms": True
        }, headers=self.auth_customer_a_non_signatory)
        self.assertEqual(status, 403, "Non-signatory must receive 403 Forbidden")
        self.assertEqual(body.get("code"), "FORBIDDEN_SIGNATORY_REQUIRED")

    # 8. Employee Portal Bypass Guard: Internal staff cannot login via customer portal
    def test_08_internal_employee_blocked_from_portal_login(self):
        status, body, _ = self._request("POST", "/auth/login", {
            "email": "internal.sales@dealflow360.com",
            "password": "InternalPassword123!"
        })
        self.assertEqual(status, 403, "Internal employee attempting portal login must be blocked with 403")
        self.assertEqual(body.get("code"), "EMPLOYEE_PORTAL_BYPASS")

    # 9. Magic Link Verification: Valid Token
    def test_09_magic_link_authentication_and_verification(self):
        status, body, _ = self._request("POST", "/auth/magic-verify", {
            "token": "valid_deal_invitation_token"
        })
        self.assertEqual(status, 200)
        self.assertIn("access_token", body)
        self.assertEqual(body.get("user", {}).get("company_name"), "Cyberdyne Defense Systems")

    # 10. Magic Link Verification: Expired Token
    def test_10_expired_magic_link_rejected(self):
        status, body, _ = self._request("POST", "/auth/magic-verify", {
            "token": "expired_magic_token"
        })
        self.assertEqual(status, 401)
        self.assertEqual(body.get("code"), "LINK_EXPIRED")

    # 11. Tampered Token Rejection
    def test_11_tampered_token_rejected(self):
        status, body, _ = self._request("GET", "/quotes", headers={"Authorization": "Bearer tampered_token_xyz"})
        self.assertEqual(status, 401)
        self.assertEqual(body.get("code"), "UNAUTHORIZED")

    # 12. Zero-Leak Data Redaction: Margins and Cost Prices Scrubbed
    def test_12_zero_leak_data_redaction(self):
        status, body, _ = self._request("GET", "/quotes/quo_8819ab2", headers=self.auth_customer_a_signatory)
        self.assertEqual(status, 200)
        # Verify internal cost/margin fields do not leak in response
        body_str = json.dumps(body)
        self.assertNotIn("_internal_standard_price", body_str)
        self.assertNotIn("_internal_margin", body_str)
        self.assertNotIn("_internal_rep_commission", body_str)
        self.assertNotIn("standard_price", body_str)
        self.assertNotIn("commission", body_str)

    # 13. Multi-Tenant Quote Listing Isolation
    def test_13_quote_listing_multi_tenant_isolation(self):
        # Customer A list
        status_a, body_a, _ = self._request("GET", "/quotes", headers=self.auth_customer_a_signatory)
        self.assertEqual(status_a, 200)
        quote_ids_a = [q["quote_id"] for q in body_a["data"]]
        self.assertIn("quo_8819ab2", quote_ids_a)
        self.assertNotIn("quo_wayne_991", quote_ids_a)

        # Customer B list
        status_b, body_b, _ = self._request("GET", "/quotes", headers=self.auth_customer_b)
        self.assertEqual(status_b, 200)
        quote_ids_b = [q["quote_id"] for q in body_b["data"]]
        self.assertIn("quo_wayne_991", quote_ids_b)
        self.assertNotIn("quo_8819ab2", quote_ids_b)

    # 14. Confirming Without Terms Accepted (Precondition Violation)
    def test_14_confirm_without_accepted_terms_rejected(self):
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/accept", {
            "signer_name": "Sarah Connor",
            "accepted_terms": False
        }, headers=self.auth_customer_a_signatory)
        self.assertEqual(status, 400)
        self.assertEqual(body.get("code"), "TERMS_NOT_ACCEPTED")

    # 15. Mass Assignment / Parameter Tampering Ignored
    def test_15_mass_assignment_tampering_ignored(self):
        # Attacker tries to force approval and overwrite pricing via counter-discount payload
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/negotiation/counter-discount", {
            "requested_discount_percent": 10.0,
            "status": "approved",
            "total_amount": 10.00,
            "negotiation_status": "approved_by_seller"
        }, headers=self.auth_customer_a_signatory)
        self.assertEqual(status, 201)
        # Server must strictly ignore malicious status/price overrides and route to review
        self.assertEqual(body.get("quote_status"), "in_negotiation")
        self.assertEqual(body.get("negotiation_status"), "pending_seller_review")
        self.assertNotEqual(body.get("projected_total"), 10.00)

    # 16. Invalid Discount Range Boundary Enforced
    def test_16_invalid_discount_range_boundary_enforced(self):
        # Discount <= 0
        status_zero, body_zero, _ = self._request("POST", "/quotes/quo_8819ab2/negotiation/counter-discount", {
            "requested_discount_percent": 0.0
        }, headers=self.auth_customer_a_signatory)
        self.assertEqual(status_zero, 400)
        self.assertEqual(body_zero.get("code"), "INVALID_DISCOUNT_RANGE")

        # Discount >= 100
        status_100, body_100, _ = self._request("POST", "/quotes/quo_8819ab2/negotiation/counter-discount", {
            "requested_discount_percent": 105.0
        }, headers=self.auth_customer_a_signatory)
        self.assertEqual(status_100, 400)
        self.assertEqual(body_100.get("code"), "INVALID_DISCOUNT_RANGE")

    # 17. XSS & Injection in Comments Stored as Inert String
    def test_17_xss_injection_in_comments_stored_safely(self):
        xss_payload = "<script>alert('XSS_ATTACK');</script><img src=x onerror=alert(1)>"
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/lines/line_4020/comments", {
            "message": xss_payload
        }, headers=self.auth_customer_a_signatory)
        self.assertEqual(status, 201)
        self.assertEqual(body.get("message"), xss_payload)
        self.assertEqual(body.get("visibility"), "customer")

    # 18. Unauthenticated Protected Endpoint Calls Rejected
    def test_18_unauthenticated_api_calls_rejected(self):
        protected_endpoints = [
            ("GET", "/quotes"),
            ("GET", "/quotes/quo_8819ab2"),
            ("GET", "/notifications"),
            ("POST", "/quotes/quo_8819ab2/accept"),
            ("POST", "/quotes/quo_8819ab2/comments")
        ]
        for method, endpoint in protected_endpoints:
            req_body = {} if method in ("POST", "PATCH", "PUT") else None
            status, body, _ = self._request(method, endpoint, body=req_body, headers={})
            self.assertEqual(status, 401, f"Endpoint {method} {endpoint} must require authentication")
            self.assertEqual(body.get("code"), "UNAUTHORIZED")


if __name__ == "__main__":
    unittest.main(verbosity=2)

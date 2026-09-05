"""
Automated Contract Verification Test Suite for DealFlow360 Customer Portal
Tests all 20 endpoints defined in docs/customer_portal_api_contract.md
Uses Python standard library (unittest + urllib).
"""

import http.server
import json
import threading
import time
import unittest
import urllib.error
import urllib.request

from mock_server.portal_mock_api import PortalMockHandler

TEST_HOST = "127.0.0.1"
TEST_PORT = 8999
BASE_URL = f"http://{TEST_HOST}:{TEST_PORT}/api/v1/portal"


class TestCustomerPortalAPIContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.HTTPServer((TEST_HOST, TEST_PORT), PortalMockHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.2)  # Give server a brief moment to bind
        cls.auth_header = {"Authorization": "Bearer mock_jwt_access_token_usr_c91f0e4b81"}

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

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

    # 1. POST /auth/login
    def test_01_auth_login(self):
        status, body, _ = self._request("POST", "/auth/login", {
            "email": "sarah.connor@cyberdyne-defense.com",
            "password": "SecurePassword123!"
        })
        self.assertEqual(status, 200)
        self.assertIn("access_token", body)
        self.assertEqual(body["token_type"], "Bearer")
        self.assertEqual(body["user"]["email"], "sarah.connor@cyberdyne-defense.com")

    # 2. POST /auth/refresh
    def test_02_auth_refresh(self):
        status, body, _ = self._request("POST", "/auth/refresh", {"refresh_token": "rt_mock"})
        self.assertEqual(status, 200)
        self.assertIn("access_token", body)

    # 3. POST /auth/logout
    def test_03_auth_logout(self):
        status, body, _ = self._request("POST", "/auth/logout", {}, headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertTrue(body.get("success"))

    # 4. GET /auth/me
    def test_04_auth_me(self):
        status, body, _ = self._request("GET", "/auth/me", headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertEqual(body["id"], "usr_c91f0e4b81")
        self.assertTrue(body["can_sign_quotes"])

    # 5. GET /quotes (List)
    def test_05_list_quotes(self):
        status, body, _ = self._request("GET", "/quotes?page=1&per_page=10", headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertIn("data", body)
        self.assertIn("meta", body)
        self.assertIn("pagination", body["meta"])
        self.assertGreaterEqual(len(body["data"]), 1)

    # 6. GET /quotes/{quote_id}
    def test_06_get_quote_detail(self):
        status, body, _ = self._request("GET", "/quotes/quo_8819ab2", headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertEqual(body["quote_id"], "quo_8819ab2")
        self.assertIn("pricing_summary", body)
        self.assertIn("line_items", body)
        self.assertEqual(len(body["line_items"]), 2)

    # 7. GET /quotes/{quote_id}/pdf
    def test_07_download_quote_pdf(self):
        status, body, headers = self._request("GET", "/quotes/quo_8819ab2/pdf", headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertEqual(headers.get("Content-Type"), "application/pdf")
        self.assertTrue(body.startswith(b"%PDF-1.4"))

    # 8. POST /quotes/{quote_id}/negotiation/change-request
    def test_08_submit_change_request(self):
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/negotiation/change-request", {
            "customer_notes": "Modify workshop count",
            "line_item_changes": [{"line_id": "line_4021", "requested_quantity": 3.0}]
        }, headers=self.auth_header)
        self.assertEqual(status, 201)
        self.assertIn("change_request_id", body)
        self.assertEqual(body["quote_status"], "in_negotiation")

    # 9. POST /quotes/{quote_id}/negotiation/counter-discount
    def test_09_submit_counter_discount(self):
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/negotiation/counter-discount", {
            "discount_type": "percentage",
            "requested_discount_percent": 10.0,
            "customer_budget_notes": "Ceiling $97,000"
        }, headers=self.auth_header)
        self.assertEqual(status, 201)
        self.assertIn("counter_discount_id", body)
        self.assertEqual(body["requested_discount_percent"], 10.0)

    # 10. GET /quotes/{quote_id}/negotiation/status
    def test_10_get_negotiation_status(self):
        status, body, _ = self._request("GET", "/quotes/quo_8819ab2/negotiation/status", headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertIn("approval_status", body)
        self.assertIn("overall_status", body["approval_status"])

    # 11. GET /quotes/{quote_id}/revisions
    def test_11_get_revisions(self):
        status, body, _ = self._request("GET", "/quotes/quo_8819ab2/revisions", headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertIn("revisions", body)
        self.assertEqual(len(body["revisions"]), 1)

    # 12. GET /quotes/{quote_id}/revisions/{revision_id}/diff
    def test_12_get_revision_diff(self):
        status, body, _ = self._request("GET", "/quotes/quo_8819ab2/revisions/rev_002/diff", headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertIn("financial_delta", body)
        self.assertIn("line_item_deltas", body)

    # 13. GET /quotes/{quote_id}/comments
    def test_13_get_comments(self):
        status, body, _ = self._request("GET", "/quotes/quo_8819ab2/comments", headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertIn("data", body)
        self.assertGreaterEqual(len(body["data"]), 1)

    # 14. POST /quotes/{quote_id}/comments
    def test_14_post_comment(self):
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/comments", {
            "message": "Can we confirm the revised terms?"
        }, headers=self.auth_header)
        self.assertEqual(status, 201)
        self.assertIn("comment_id", body)
        self.assertEqual(body["message"], "Can we confirm the revised terms?")

    # 15. POST /quotes/{quote_id}/attachments
    def test_15_upload_attachment(self):
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/attachments", {
            "document_category": "specification"
        }, headers=self.auth_header)
        self.assertEqual(status, 201)
        self.assertIn("attachment_id", body)
        self.assertIn("download_url", body)

    # 16. POST /quotes/{quote_id}/accept
    def test_16_accept_quote(self):
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/accept", {
            "signer_name": "Sarah Connor",
            "signer_title": "CTO",
            "signature_type": "drawn",
            "signature_data": "data:image/png;base64,iVBOR...",
            "accepted_terms": True,
            "purchase_order_number": "PO-CYBER-9910"
        }, headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertIn("confirmation_id", body)
        self.assertEqual(body["status"], "approved")
        self.assertEqual(body["reference_order_number"], "SO-2026-1184")

    # 17. POST /quotes/{quote_id}/reject
    def test_17_reject_quote(self):
        status, body, _ = self._request("POST", "/quotes/quo_8819ab2/reject", {
            "rejection_reason_code": "budget_unavailable",
            "rejection_feedback": "Deferred to next quarter"
        }, headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertEqual(body["status"], "rejected")

    # 18. GET /notifications
    def test_18_get_notifications(self):
        status, body, _ = self._request("GET", "/notifications", headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertIn("data", body)
        self.assertIn("meta", body)
        self.assertIn("unread_count", body["meta"])

    # 19. PATCH /notifications/{notification_id}/read
    def test_19_mark_notification_read(self):
        status, body, _ = self._request("PATCH", "/notifications/notif_5521/read", {}, headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertTrue(body["is_read"])

    # 20. PATCH /notifications/read-all
    def test_20_mark_all_notifications_read(self):
        status, body, _ = self._request("PATCH", "/notifications/read-all", {}, headers=self.auth_header)
        self.assertEqual(status, 200)
        self.assertTrue(body["success"])

    # 21. Security & RFC 7807 Error Guard: Unauthorized Access
    def test_21_unauthorized_guard(self):
        status, body, _ = self._request("GET", "/quotes")
        self.assertEqual(status, 401)
        self.assertEqual(body["code"], "UNAUTHORIZED")
        self.assertIn("detail", body)

    # 22. Security Guard: Non-existent Quote (404)
    def test_22_quote_not_found_guard(self):
        status, body, _ = self._request("GET", "/quotes/non_existent_id", headers=self.auth_header)
        self.assertEqual(status, 404)
        self.assertEqual(body["code"], "QUOTE_NOT_FOUND")


if __name__ == "__main__":
    unittest.main(verbosity=2)

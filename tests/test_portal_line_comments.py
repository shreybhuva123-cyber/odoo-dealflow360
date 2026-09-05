"""
DealFlow360 - Customer Portal Line-Level Commenting Unit Test Suite
Phase 8: Automated verification of deliverable line commenting, zero-leak boundary
redaction, multi-tenant anti-IDOR authorization, read-receipt tracking, and
reusable presentation components.
"""

import os
import json
import copy
import socket
import threading
import unittest
import urllib.request
import urllib.error
import subprocess
import shutil
from http.server import HTTPServer

from mock_server import portal_mock_api
from mock_server.portal_mock_api import PortalMockHandler, MOCK_USERS, MOCK_QUOTES


def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def get_node_bin():
    if shutil.which('node'):
        return 'node'
    for candidate in [
        r'C:\Program Files\nodejs\node.exe',
        r'C:\Program Files (x86)\nodejs\node.exe',
        os.path.expanduser(r'~\AppData\Roaming\npm\node.cmd'),
    ]:
        if os.path.exists(candidate):
            return candidate
    return 'node'


class TestPortalLineComments(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_port = get_free_port()
        cls.server = HTTPServer(('127.0.0.1', cls.test_port), PortalMockHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.test_port}/api/v1/portal"
        cls.project_root = os.path.dirname(os.path.dirname(__file__))

        # Customer A: Cyberdyne Systems (commercial_partner_id: 1205)
        cls.token_customer_a = MOCK_USERS["usr_c91f0e4b81"]["token"]
        cls.auth_a = {"Authorization": f"Bearer {cls.token_customer_a}"}

        # Customer B: Wayne Enterprises (commercial_partner_id: 7701)
        cls.token_customer_b = MOCK_USERS["usr_bruce_wayne"]["token"]
        cls.auth_b = {"Authorization": f"Bearer {cls.token_customer_b}"}

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        # Deepcopy mutable in-memory structures for strict test isolation
        self._orig_comments = copy.deepcopy(portal_mock_api.MOCK_COMMENTS)

    def tearDown(self):
        portal_mock_api.MOCK_COMMENTS.clear()
        portal_mock_api.MOCK_COMMENTS.extend(self._orig_comments)

    def _get(self, endpoint: str, headers: dict):
        req = urllib.request.Request(f"{self.base_url}{endpoint}", headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return resp.status, data
        except urllib.error.HTTPError as e:
            data = json.loads(e.read().decode("utf-8"))
            return e.code, data

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

    def _patch(self, endpoint: str, payload: dict, headers: dict):
        body = json.dumps(payload).encode("utf-8")
        req_headers = {"Content-Type": "application/json", **headers}
        req = urllib.request.Request(f"{self.base_url}{endpoint}", data=body, headers=req_headers, method="PATCH")
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
            [get_node_bin(), '-e', full_code],
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

    # 1. Line Comments Listing & Metadata
    def test_01_get_line_comments_success_and_metadata(self):
        status, body = self._get("/quotes/quo_8819ab2/lines/line_4020/comments", self.auth_a)
        self.assertEqual(status, 200)
        self.assertIn("data", body)
        self.assertIn("meta", body)

        meta = body["meta"]
        self.assertEqual(meta["quote_id"], "quo_8819ab2")
        self.assertEqual(meta["line_id"], "line_4020")
        self.assertEqual(meta["total_comments"], 2)

        comments = body["data"]
        self.assertEqual(len(comments), 2)

        # Comment 1: Customer inquiry
        c1 = comments[0]
        self.assertEqual(c1["comment_id"], "cmt_991823")
        self.assertEqual(c1["author"]["type"], "customer")
        self.assertEqual(c1["author"]["name"], "Sarah Connor")
        self.assertEqual(c1["stable_line_key"], "prod_cloud_01_core_lic")
        self.assertIn("24/7 weekend emergency coverage", c1["message"])
        self.assertTrue(c1["is_read"])

        # Comment 2: Sales agent reply
        c2 = comments[1]
        self.assertEqual(c2["comment_id"], "cmt_991845")
        self.assertEqual(c2["author"]["type"], "sales_agent")
        self.assertEqual(c2["author"]["name"], "Alex Mercer")
        self.assertEqual(c2["parent_comment_id"], "cmt_991823")
        self.assertIn("guaranteed 30-minute response", c2["message"])

    # 2. Zero-Leak Boundary Air-Gap Redaction
    def test_02_zero_leak_boundary_internal_comments_redaction(self):
        # Verify internal deal desk note is in mock database with internal visibility
        internal_cmts = [c for c in portal_mock_api.MOCK_COMMENTS if c.get("visibility") == "internal"]
        self.assertTrue(len(internal_cmts) >= 1)
        self.assertEqual(internal_cmts[0]["comment_id"], "cmt_internal_secret_99")

        # Fetch customer line comments
        status, body = self._get("/quotes/quo_8819ab2/lines/line_4020/comments", self.auth_a)
        self.assertEqual(status, 200)
        comment_ids = [c["comment_id"] for c in body["data"]]
        self.assertNotIn("cmt_internal_secret_99", comment_ids)

        # Body string check: internal deal desk secrets must never appear
        raw_json_str = json.dumps(body)
        self.assertNotIn("INTERNAL DEAL DESK NOTE", raw_json_str)
        self.assertNotIn("budget cap", raw_json_str)
        self.assertNotIn("Concession up to 12%", raw_json_str)

        # Also check general quote comments endpoint
        g_status, g_body = self._get("/quotes/quo_8819ab2/comments", self.auth_a)
        self.assertEqual(g_status, 200)
        g_comment_ids = [c["comment_id"] for c in g_body["data"]]
        self.assertNotIn("cmt_internal_secret_99", g_comment_ids)
        self.assertNotIn("INTERNAL DEAL DESK NOTE", json.dumps(g_body))

    # 3. Anti-IDOR Authorization
    def test_03_anti_idor_cross_tenant_line_comments_access(self):
        # Customer B attempting to view Customer A quote line comments
        status_b, body_b = self._get("/quotes/quo_8819ab2/lines/line_4020/comments", self.auth_b)
        self.assertEqual(status_b, 404)
        self.assertEqual(body_b["code"], "QUOTE_NOT_FOUND")

        # Customer A attempting to view Customer B quote line comments
        status_a, body_a = self._get("/quotes/quo_wayne_991/lines/line_9901/comments", self.auth_a)
        self.assertEqual(status_a, 404)
        self.assertEqual(body_a["code"], "QUOTE_NOT_FOUND")

        # Unauthenticated request
        status_unauth, body_unauth = self._get("/quotes/quo_8819ab2/lines/line_4020/comments", {})
        self.assertEqual(status_unauth, 401)
        self.assertEqual(body_unauth["code"], "UNAUTHORIZED")

    # 4. Line Comments Summary & Unread Aggregation
    def test_04_comments_summary_per_line_and_unread_counts(self):
        status, body = self._get("/quotes/quo_8819ab2/comments/summary", self.auth_a)
        self.assertEqual(status, 200)
        self.assertEqual(body["quote_id"], "quo_8819ab2")
        self.assertIn("lines_summary", body)
        self.assertIn("total_unread_comments", body)

        lines_map = {item["line_id"]: item for item in body["lines_summary"]}

        # line_4020 has 2 customer comments, 0 unread
        self.assertIn("line_4020", lines_map)
        self.assertEqual(lines_map["line_4020"]["total_comments"], 2)
        self.assertEqual(lines_map["line_4020"]["unread_count"], 0)

        # line_4021 has 1 customer comment, 1 unread
        self.assertIn("line_4021", lines_map)
        self.assertEqual(lines_map["line_4021"]["total_comments"], 1)
        self.assertEqual(lines_map["line_4021"]["unread_count"], 1)

        # Total unread must be 1 (excluding internal notes)
        self.assertEqual(body["total_unread_comments"], 1)

    # 5. Customer Line Comment Posting
    def test_05_post_line_comment_success(self):
        payload = {
            "message": "Can we confirm whether staging environment installation is included?",
            "stable_line_key": "prod_cloud_01_core_lic",
            "parent_comment_id": "cmt_991845"
        }
        status, new_cmt = self._post("/quotes/quo_8819ab2/lines/line_4020/comments", payload, self.auth_a)
        self.assertEqual(status, 201)
        self.assertTrue(new_cmt["comment_id"].startswith("cmt_"))
        self.assertEqual(new_cmt["quote_id"], "quo_8819ab2")
        self.assertEqual(new_cmt["line_id"], "line_4020")
        self.assertEqual(new_cmt["stable_line_key"], "prod_cloud_01_core_lic")
        self.assertEqual(new_cmt["parent_comment_id"], "cmt_991845")
        self.assertEqual(new_cmt["visibility"], "customer")
        self.assertEqual(new_cmt["author"]["type"], "customer")
        self.assertEqual(new_cmt["author"]["name"], "Sarah Connor")
        self.assertIn("staging environment", new_cmt["message"])

        # Check that GET now returns 3 comments
        get_status, get_body = self._get("/quotes/quo_8819ab2/lines/line_4020/comments", self.auth_a)
        self.assertEqual(get_status, 200)
        self.assertEqual(get_body["meta"]["total_comments"], 3)
        self.assertEqual(len(get_body["data"]), 3)

    # 6. Comment Posting Validation
    def test_06_post_line_comment_validation_empty_body(self):
        # Empty string
        status, body = self._post("/quotes/quo_8819ab2/lines/line_4020/comments", {"message": "   "}, self.auth_a)
        self.assertEqual(status, 400)
        self.assertEqual(body["code"], "EMPTY_COMMENT_BODY")

        # Missing message property
        status2, body2 = self._post("/quotes/quo_8819ab2/lines/line_4020/comments", {}, self.auth_a)
        self.assertEqual(status2, 400)
        self.assertEqual(body2["code"], "EMPTY_COMMENT_BODY")

    # 7. Post Line Comment Anti-IDOR
    def test_07_post_line_comment_anti_idor(self):
        payload = {"message": "Unauthorized comment injection attempt"}
        status, body = self._post("/quotes/quo_8819ab2/lines/line_4020/comments", payload, self.auth_b)
        self.assertEqual(status, 404)
        self.assertEqual(body["code"], "QUOTE_NOT_FOUND")

    # 8. Mark Line Comments As Read
    def test_08_mark_line_comments_as_read(self):
        # Initially line_4021 has 1 unread comment
        status, res = self._patch("/quotes/quo_8819ab2/lines/line_4021/comments/read", {}, self.auth_a)
        self.assertEqual(status, 200)
        self.assertTrue(res["success"])
        self.assertEqual(res["marked_read_count"], 1)

        # Verify summary now reflects 0 unread for line_4021
        _, sum_body = self._get("/quotes/quo_8819ab2/comments/summary", self.auth_a)
        self.assertEqual(sum_body["total_unread_comments"], 0)

        # Cross-tenant check for read marker
        status_b, body_b = self._patch("/quotes/quo_8819ab2/lines/line_4021/comments/read", {}, self.auth_b)
        self.assertEqual(status_b, 404)
        self.assertEqual(body_b["code"], "QUOTE_NOT_FOUND")

    # 9. Component: LineCommentBadge
    def test_09_component_line_comment_badge(self):
        # Badge with unread count
        out_unread = self._exec_node_component("""
            console.log(c.LineCommentBadge({
                lineId: 'line_4020',
                lineName: 'Cloud License',
                totalComments: 3,
                unreadCount: 2
            }));
        """)
        self.assertIn('data-component="LineCommentBadge"', out_unread)
        self.assertIn('data-action="comment-line"', out_unread)
        self.assertIn('data-line-id="line_4020"', out_unread)
        self.assertIn('>3<', out_unread)
        self.assertIn('>2<', out_unread)
        self.assertIn('2 unread comment(s)', out_unread)

        # Neutral badge with 0 comments
        out_zero = self._exec_node_component("""
            console.log(c.LineCommentBadge({
                lineId: 'line_4021',
                lineName: 'Training Workshop',
                totalComments: 0,
                unreadCount: 0
            }));
        """)
        self.assertIn('>0<', out_zero)
        self.assertNotIn('unread comment(s)', out_zero)

    # 10. Component: CommentMessageBubble
    def test_10_component_comment_message_bubble(self):
        # Customer Bubble
        cust_comment = json.dumps({
            "comment_id": "cmt_101",
            "author": {"name": "Sarah Connor", "type": "customer"},
            "message": "Can we confirm the deployment date?",
            "created_at": "2026-09-04T09:15:00Z",
            "revision_number": 1
        })
        out_cust = self._exec_node_component(f"""
            console.log(c.CommentMessageBubble({{ comment: {cust_comment}, currentRevision: 1 }}));
        """)
        self.assertIn('data-author-type="customer"', out_cust)
        self.assertIn("Sarah Connor", out_cust)
        self.assertIn("Can we confirm the deployment date?", out_cust)

        # Sales Agent Bubble with previous revision badge
        sales_comment = json.dumps({
            "comment_id": "cmt_102",
            "author": {"name": "Alex Mercer", "type": "sales_agent", "title": "Account Executive"},
            "message": "Confirmed for October 1st launch.",
            "created_at": "2026-09-04T09:40:00Z",
            "revision_number": 1
        })
        out_sales = self._exec_node_component(f"""
            console.log(c.CommentMessageBubble({{ comment: {sales_comment}, currentRevision: 2 }}));
        """)
        self.assertIn('data-author-type="sales_agent"', out_sales)
        self.assertIn("Alex Mercer", out_sales)
        self.assertIn("Account Executive", out_sales)
        self.assertIn("Quote Rev #1", out_sales)

    # 11. Component: CommentComposer
    def test_11_component_comment_composer(self):
        out_composer = self._exec_node_component("""
            console.log(c.CommentComposer({ lineId: 'line_4020' }));
        """)
        self.assertIn('data-component="CommentComposer"', out_composer)
        self.assertIn('data-line-id="line_4020"', out_composer)
        self.assertIn('name="comment_message"', out_composer)
        self.assertIn('data-action="submit-line-comment"', out_composer)
        self.assertIn('data-action="attach-deliverable-file"', out_composer)

    # 12. Component: LineDiscussionDrawer States
    def test_12_component_line_discussion_drawer_states(self):
        # Loading state
        out_loading = self._exec_node_component("""
            console.log(c.LineDiscussionDrawer({
                isOpen: true,
                isLoading: true,
                line: { line_id: 'line_4020', name: 'Cloud License', quantity: 1, uom: 'Units', unit_price: 100000, total_amount: 100000 }
            }));
        """)
        self.assertIn('data-component="LineDiscussionDrawer"', out_loading)
        self.assertIn('data-state="loading"', out_loading)
        self.assertIn('Cloud License', out_loading)

        # Empty state
        out_empty = self._exec_node_component("""
            console.log(c.LineDiscussionDrawer({
                isOpen: true,
                isLoading: false,
                comments: [],
                line: { line_id: 'line_4020', name: 'Cloud License' }
            }));
        """)
        self.assertIn('data-state="empty"', out_empty)
        self.assertIn('No questions yet', out_empty)

        # Stream state with unread banner
        comments_json = json.dumps([
            {
                "comment_id": "cmt_101",
                "author": {"name": "Sarah Connor", "type": "customer"},
                "message": "Question 1",
                "created_at": "2026-09-04T09:15:00Z"
            }
        ])
        out_stream = self._exec_node_component(f"""
            console.log(c.LineDiscussionDrawer({{
                isOpen: true,
                isLoading: false,
                comments: {comments_json},
                unreadCount: 1,
                line: {{ line_id: 'line_4020', name: 'Cloud License', quantity: 1, unit_price: 100000, total_amount: 100000 }}
            }}));
        """)
        self.assertIn('data-component="CommentThreadStream"', out_stream)
        self.assertIn('data-action="mark-line-read"', out_stream)
        self.assertIn('data-action="close-line-drawer"', out_stream)

    # 13. Integration: QuoteLineItemsTable renders LineCommentBadge
    def test_13_quote_line_items_table_shows_comment_badges(self):
        lines_json = json.dumps([
            {
                "line_id": "line_4020",
                "name": "Core Security License",
                "quantity": 1,
                "uom": "Units",
                "unit_price": 100000.0,
                "total_amount": 100000.0,
                "charge_type": "recurring"
            }
        ])
        summary_json = json.dumps({
            "line_4020": {
                "total_comments": 4,
                "unread_count": 1
            }
        })
        out_table = self._exec_node_component(f"""
            console.log(c.QuoteLineItemsTable({{
                lines: {lines_json},
                currency: 'USD',
                lineCommentsSummary: {summary_json}
            }}));
        """)
        self.assertIn('data-component="LineCommentBadge"', out_table)
        self.assertIn('data-action="comment-line"', out_table)
        self.assertIn('data-line-id="line_4020"', out_table)
        self.assertIn('>4<', out_table)
        self.assertIn('>1<', out_table)


if __name__ == "__main__":
    unittest.main()

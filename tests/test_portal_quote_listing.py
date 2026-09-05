"""
DealFlow360 - Customer Portal Quotation Listing Unit Test Suite
Phase 5: Automated verification of multi-tenant quotation listing, zero-leak redaction,
search, filtering, sorting, pagination, and presentation components.
"""

import os
import json
import socket
import threading
import unittest
import urllib.request
import urllib.error
import subprocess
import shutil
from http.server import HTTPServer

from mock_server.portal_mock_api import PortalMockHandler, MOCK_USERS


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


class TestPortalQuoteListing(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_port = get_free_port()
        cls.server = HTTPServer(('127.0.0.1', cls.test_port), PortalMockHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.test_port}/api/v1/portal"
        cls.project_root = os.path.dirname(os.path.dirname(__file__))

        cls.token_a = MOCK_USERS["usr_c91f0e4b81"]["token"]  # Customer A: Cyberdyne (commercial_partner_id: 1205)
        cls.token_b = MOCK_USERS["usr_bruce_wayne"]["token"]  # Customer B: Wayne Ent (commercial_partner_id: 7701)
        cls.auth_a = {"Authorization": f"Bearer {cls.token_a}"}
        cls.auth_b = {"Authorization": f"Bearer {cls.token_b}"}

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def _get(self, endpoint: str, headers: dict):
        req = urllib.request.Request(f"{self.base_url}{endpoint}", headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return resp.status, data

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
            timeout=5
        )
        if proc.returncode != 0:
            raise RuntimeError(f"Node execution failed: {proc.stderr}")
        return proc.stdout.strip()

    # 1. Multi-Tenant Isolation: Customer A sees ONLY Customer A quotes
    def test_01_customer_a_sees_only_customer_a_quotes(self):
        status, body = self._get("/quotes", self.auth_a)
        self.assertEqual(status, 200)
        quotes = body["data"]
        quote_ids = [q["quote_id"] for q in quotes]
        self.assertIn("quo_8819ab2", quote_ids)
        self.assertIn("quo_8819ab3", quote_ids)
        # Wayne Enterprises quote must NEVER be returned to Customer A
        self.assertNotIn("quo_wayne_991", quote_ids)
        for q in quotes:
            self.assertNotEqual(q["quote_number"], "QUO-2026-0099")

    # 2. Multi-Tenant Isolation: Customer B sees ONLY Customer B quotes
    def test_02_customer_b_sees_only_customer_b_quotes(self):
        status, body = self._get("/quotes", self.auth_b)
        self.assertEqual(status, 200)
        quotes = body["data"]
        quote_ids = [q["quote_id"] for q in quotes]
        self.assertIn("quo_wayne_991", quote_ids)
        self.assertEqual(len(quotes), 1)
        # Cyberdyne quotes must NEVER be returned to Customer B
        self.assertNotIn("quo_8819ab2", quote_ids)
        self.assertNotIn("quo_8819ab3", quote_ids)

    # 3. Zero-Leak Redaction Boundary: No internal margin/cost/commission data exposed
    def test_03_zero_leak_redaction_boundary(self):
        status, body = self._get("/quotes", self.auth_a)
        self.assertEqual(status, 200)
        for q in body["data"]:
            for key in q.keys():
                self.assertFalse(key.startswith("_internal"), f"Internal field leaked: {key}")
                self.assertFalse("margin" in key.lower() and key != "currency")
                self.assertFalse("cost" in key.lower())
                self.assertFalse("commission" in key.lower())

    # 4. Status Filtering
    def test_04_status_filtering(self):
        # Filter for in_negotiation
        status, body = self._get("/quotes?status=in_negotiation", self.auth_a)
        self.assertEqual(status, 200)
        for q in body["data"]:
            self.assertEqual(q["status"], "in_negotiation")

        # Filter for approved
        status, body = self._get("/quotes?status=approved", self.auth_a)
        self.assertEqual(status, 200)
        for q in body["data"]:
            self.assertEqual(q["status"], "approved")

        # Filter for sent
        status, body = self._get("/quotes?status=sent", self.auth_a)
        self.assertEqual(status, 200)
        for q in body["data"]:
            self.assertEqual(q["status"], "sent")

    # 5. Negotiation Indicator Filter
    def test_05_has_negotiation_filter(self):
        status, body = self._get("/quotes?has_negotiation=true", self.auth_a)
        self.assertEqual(status, 200)
        self.assertTrue(len(body["data"]) >= 1)
        for q in body["data"]:
            self.assertTrue(q["has_active_negotiation"])
            self.assertNotEqual(q["negotiation_status"], "none")

    # 6. Search by Quote Number, Title, and Sales Rep
    def test_06_search_filtering(self):
        # Search quote number
        status, body = self._get("/quotes?search=0048", self.auth_a)
        self.assertEqual(status, 200)
        self.assertEqual(len(body["data"]), 1)
        self.assertEqual(body["data"][0]["quote_number"], "QUO-2026-0048")

        # Search title substring
        status, body = self._get("/quotes?search=Anomaly", self.auth_a)
        self.assertEqual(status, 200)
        self.assertEqual(len(body["data"]), 1)
        self.assertIn("Anomaly", body["data"][0]["title"])

        # Search sales rep
        status, body = self._get("/quotes?search=Elena", self.auth_a)
        self.assertEqual(status, 200)
        self.assertTrue(len(body["data"]) >= 1)
        for q in body["data"]:
            self.assertIn("Elena", q["sales_rep"]["name"])

        # Non-matching search returns 0 items
        status, body = self._get("/quotes?search=NonExistent9999", self.auth_a)
        self.assertEqual(status, 200)
        self.assertEqual(len(body["data"]), 0)
        self.assertEqual(body["meta"]["pagination"]["total_items"], 0)

    # 7. Sorting by Total Amount
    def test_07_sorting_by_total_amount(self):
        # Descending: highest first
        status, body = self._get("/quotes?sort_by=total_amount&sort_dir=desc", self.auth_a)
        self.assertEqual(status, 200)
        amounts = [q["total_amount"] for q in body["data"]]
        self.assertEqual(amounts, sorted(amounts, reverse=True))

        # Ascending: lowest first
        status, body = self._get("/quotes?sort_by=total_amount&sort_dir=asc", self.auth_a)
        self.assertEqual(status, 200)
        amounts = [q["total_amount"] for q in body["data"]]
        self.assertEqual(amounts, sorted(amounts, reverse=False))

    # 8. Sorting by Date
    def test_08_sorting_by_date(self):
        status, body = self._get("/quotes?sort_by=date&sort_dir=desc", self.auth_a)
        self.assertEqual(status, 200)
        dates = [q["created_at"] for q in body["data"]]
        self.assertEqual(dates, sorted(dates, reverse=True))

    # 9. Pagination Mechanics
    def test_09_pagination_mechanics(self):
        # Page 1, per_page 2
        status, body = self._get("/quotes?page=1&per_page=2", self.auth_a)
        self.assertEqual(status, 200)
        self.assertEqual(len(body["data"]), 2)
        p = body["meta"]["pagination"]
        self.assertEqual(p["current_page"], 1)
        self.assertEqual(p["per_page"], 2)
        self.assertTrue(p["total_items"] >= 5)
        self.assertTrue(p["total_pages"] >= 3)
        self.assertTrue(p["has_next_page"])
        self.assertFalse(p["has_prev_page"])

        # Page 2, per_page 2
        status2, body2 = self._get("/quotes?page=2&per_page=2", self.auth_a)
        self.assertEqual(status2, 200)
        self.assertEqual(len(body2["data"]), 2)
        p2 = body2["meta"]["pagination"]
        self.assertEqual(p2["current_page"], 2)
        self.assertTrue(p2["has_prev_page"])

        # Verify page 1 and page 2 have different quotes
        p1_ids = {q["quote_id"] for q in body["data"]}
        p2_ids = {q["quote_id"] for q in body2["data"]}
        self.assertTrue(p1_ids.isdisjoint(p2_ids))

    # 10. QuoteFilterBar Component Rendering
    def test_10_quote_filter_bar_rendering(self):
        html = self._exec_node_component("""
        console.log(c.QuoteFilterBar({
            currentStatus: 'in_negotiation',
            statusCounts: { all: 5, in_negotiation: 1, sent: 1 },
            searchQuery: 'Cyberdyne',
            sortBy: 'total_amount',
            sortDir: 'desc'
        }));
        """)
        self.assertIn('data-component="QuoteFilterBar"', html)
        self.assertIn('value="Cyberdyne"', html)
        self.assertIn('In Negotiation (1)', html)
        self.assertIn('data-action="filter-status"', html)
        self.assertIn('data-action="sort-select"', html)

    # 11. QuoteTable Desktop Component Rendering
    def test_11_quote_table_rendering(self):
        html = self._exec_node_component("""
        const quotes = [{
            quote_id: 'quo_8819ab2',
            quote_number: 'QUO-2026-0048',
            title: 'Enterprise AI Suite',
            status: 'in_negotiation',
            negotiation_status: 'pending_seller_review',
            revision_number: 2,
            total_amount: 107400.00,
            currency: 'USD',
            created_at: '2026-09-01T08:00:00Z',
            updated_at: '2026-09-05T10:00:00Z',
            expiration_date: '2026-09-30T23:59:59Z',
            sales_rep: { name: 'Alex Mercer', email: 'alex@example.com' },
            has_active_negotiation: true
        }];
        console.log(c.QuoteTable({ quotes }));
        """)
        self.assertIn('data-component="QuoteTable"', html)
        self.assertIn('QUO-2026-0048', html)
        self.assertIn('v2', html)
        self.assertIn('Enterprise AI Suite', html)
        self.assertIn('$107,400.00', html)
        self.assertIn('Alex Mercer', html)
        self.assertIn('Review', html)

    # 12. QuoteCard Mobile Component Rendering
    def test_12_quote_card_mobile_rendering(self):
        html = self._exec_node_component("""
        const quote = {
            quote_id: 'quo_8819ab2',
            quote_number: 'QUO-2026-0048',
            title: 'Enterprise AI Suite',
            status: 'sent',
            total_amount: 107400.00,
            currency: 'USD',
            created_at: '2026-09-01T08:00:00Z',
            sales_rep: { name: 'Alex Mercer' }
        };
        console.log(c.QuoteCard({ quote }));
        """)
        self.assertIn('data-component="QuoteCard"', html)
        self.assertIn('QUO-2026-0048', html)
        self.assertIn('$107,400.00', html)
        self.assertIn('Review Quote', html)

    # 13. QuotePagination Component Rendering
    def test_13_quote_pagination_rendering(self):
        html = self._exec_node_component("""
        console.log(c.QuotePagination({
            pagination: {
                current_page: 2,
                per_page: 10,
                total_items: 42,
                total_pages: 5,
                has_next_page: true,
                has_prev_page: true
            }
        }));
        """)
        self.assertIn('data-component="QuotePagination"', html)
        self.assertIn('Showing <span class="font-semibold text-slate-800 font-mono">11</span>', html)
        self.assertIn('to <span class="font-semibold text-slate-800 font-mono">20</span>', html)
        self.assertIn('of <span class="font-semibold text-slate-800 font-mono">42</span>', html)
        self.assertIn('Page 2 of 5', html)

    # 14. QuoteListContainer State Switching
    def test_14_quote_list_container_states(self):
        # Ready state with quotes
        ready_html = self._exec_node_component("""
        console.log(c.QuoteListContainer({
            quotes: [{ quote_id: 'q1', quote_number: 'QUO-01', title: 'T1', status: 'sent', total_amount: 5000, currency: 'USD' }],
            currentStatus: 'all'
        }));
        """)
        self.assertIn('data-component="QuoteListContainer"', ready_html)
        self.assertIn('data-state="ready"', ready_html)

        # Loading state
        loading_html = self._exec_node_component("console.log(c.QuoteListContainer({ isLoading: true }));")
        self.assertIn('data-state="loading"', loading_html)

        # Empty state
        empty_html = self._exec_node_component("console.log(c.QuoteListContainer({ quotes: [], currentStatus: 'approved' }));")
        self.assertIn('data-state="empty"', empty_html)
        self.assertIn('No matching proposals found', empty_html)

        # Error state
        error_html = self._exec_node_component("""
        console.log(c.QuoteListContainer({
            error: { code: 'NETWORK_TIMEOUT', message: 'The gateway timed out.' }
        }));
        """)
        self.assertIn('data-state="error"', error_html)
        self.assertIn('NETWORK_TIMEOUT', error_html)


if __name__ == '__main__':
    unittest.main()

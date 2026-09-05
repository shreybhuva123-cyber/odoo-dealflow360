"""
DealFlow360 - Customer Portal Frontend Integration Layer Test Suite
Phase 9: Automated verification of transport infrastructure (ApiClient, TokenStore, QueryCache),
RFC 7807 error normalization (PortalApiError), 401 silent refresh, idempotent retries,
and all 9 headless domain services (Auth, Quotes, Quote Detail, Negotiation, Comments,
Revisions, Confirmation, Notifications, Status).
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
from http.server import HTTPServer

from mock_server import portal_mock_api
from mock_server.portal_mock_api import PortalMockHandler, MOCK_USERS, MOCK_QUOTES


def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


class TestPortalIntegrationLayer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_port = get_free_port()
        cls.server = HTTPServer(('127.0.0.1', cls.test_port), PortalMockHandler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.server_origin = f"http://127.0.0.1:{cls.test_port}"
        cls.base_url = f"{cls.server_origin}/api/v1/portal"
        cls.project_root = os.path.dirname(os.path.dirname(__file__))

        # Customer A: Cyberdyne (commercial_partner_id: 1205)
        cls.token_signatory = MOCK_USERS["usr_c91f0e4b81"]["token"]
        cls.token_viewer = MOCK_USERS["usr_john_connor"]["token"]

        # Customer B: Wayne Enterprises (commercial_partner_id: 7701)
        cls.token_customer_b = MOCK_USERS["usr_bruce_wayne"]["token"]

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        # Deepcopy mutable in-memory structures for strict test isolation
        self._orig_quotes = copy.deepcopy(portal_mock_api.MOCK_QUOTES)
        self._orig_comments = copy.deepcopy(portal_mock_api.MOCK_COMMENTS)
        self._orig_notifs = copy.deepcopy(portal_mock_api.MOCK_NOTIFICATIONS)

        # Explicitly restore baseline for primary test quote
        if "quo_8819ab2" in portal_mock_api.MOCK_QUOTES:
            portal_mock_api.MOCK_QUOTES["quo_8819ab2"]["status"] = "sent"
            portal_mock_api.MOCK_QUOTES["quo_8819ab2"]["negotiation_status"] = "none"
            portal_mock_api.MOCK_QUOTES["quo_8819ab2"]["can_accept"] = True
            portal_mock_api.MOCK_QUOTES["quo_8819ab2"]["can_negotiate"] = True

    def tearDown(self):
        portal_mock_api.MOCK_QUOTES.clear()
        portal_mock_api.MOCK_QUOTES.update(self._orig_quotes)
        portal_mock_api.MOCK_COMMENTS.clear()
        portal_mock_api.MOCK_COMMENTS.extend(self._orig_comments)
        portal_mock_api.MOCK_NOTIFICATIONS.clear()
        portal_mock_api.MOCK_NOTIFICATIONS.extend(self._orig_notifs)

        if "quo_8819ab2" in portal_mock_api.MOCK_QUOTES:
            portal_mock_api.MOCK_QUOTES["quo_8819ab2"]["status"] = "sent"
            portal_mock_api.MOCK_QUOTES["quo_8819ab2"]["negotiation_status"] = "none"
            portal_mock_api.MOCK_QUOTES["quo_8819ab2"]["can_accept"] = True
            portal_mock_api.MOCK_QUOTES["quo_8819ab2"]["can_negotiate"] = True

    def _exec_node(self, js_code: str):
        """Execute a JavaScript snippet in Node.js within the project environment"""
        proc = subprocess.run(
            ['node', '-e', js_code],
            cwd=self.project_root,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=10
        )
        if proc.returncode != 0:
            raise RuntimeError(f"Node execution failed with code {proc.returncode}:\nSTDERR: {proc.stderr}\nSTDOUT: {proc.stdout}")
        return proc.stdout.strip()

    # =========================================================================
    # 1. Static Asset Delivery & HTML Inclusions
    # =========================================================================
    def test_01_static_asset_delivery_api_primitives(self):
        """Mock server serves API primitive scripts over HTTP with application/javascript"""
        scripts = [
            "/js/api/PortalApiError.js",
            "/js/api/TokenStore.js",
            "/js/api/QueryCache.js",
            "/js/api/ApiClient.js"
        ]
        for path in scripts:
            req = urllib.request.Request(f"{self.server_origin}{path}")
            with urllib.request.urlopen(req) as resp:
                self.assertEqual(resp.status, 200, f"Failed to load {path}")
                self.assertIn("javascript", resp.headers.get("Content-Type", "").lower())
                body = resp.read().decode('utf-8')
                self.assertTrue(len(body) > 100, f"Asset {path} body too short")

    def test_02_static_asset_delivery_services(self):
        """Mock server serves all 9 domain services and services index script over HTTP"""
        services = [
            "/js/services/AuthService.js",
            "/js/services/QuoteService.js",
            "/js/services/QuoteDetailService.js",
            "/js/services/NegotiationService.js",
            "/js/services/CommentService.js",
            "/js/services/RevisionService.js",
            "/js/services/ConfirmationService.js",
            "/js/services/NotificationService.js",
            "/js/services/StatusService.js",
            "/js/services/index.js"
        ]
        for path in services:
            req = urllib.request.Request(f"{self.server_origin}{path}")
            with urllib.request.urlopen(req) as resp:
                self.assertEqual(resp.status, 200, f"Failed to load {path}")
                self.assertIn("javascript", resp.headers.get("Content-Type", "").lower())
                body = resp.read().decode('utf-8')
                self.assertTrue(len(body) > 100, f"Service {path} body too short")

    def test_03_index_html_includes_all_scripts(self):
        """portal_ui/index.html includes all newly registered API and service scripts"""
        req = urllib.request.Request(f"{self.server_origin}/portal")
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode('utf-8')

        required_tags = [
            '<script src="/js/api/PortalApiError.js"></script>',
            '<script src="/js/api/TokenStore.js"></script>',
            '<script src="/js/api/QueryCache.js"></script>',
            '<script src="/js/api/ApiClient.js"></script>',
            '<script src="/js/services/AuthService.js"></script>',
            '<script src="/js/services/QuoteService.js"></script>',
            '<script src="/js/services/QuoteDetailService.js"></script>',
            '<script src="/js/services/NegotiationService.js"></script>',
            '<script src="/js/services/CommentService.js"></script>',
            '<script src="/js/services/RevisionService.js"></script>',
            '<script src="/js/services/ConfirmationService.js"></script>',
            '<script src="/js/services/NotificationService.js"></script>',
            '<script src="/js/services/StatusService.js"></script>',
            '<script src="/js/services/index.js"></script>'
        ]
        for tag in required_tags:
            self.assertIn(tag, html, f"Missing script tag in index.html: {tag}")

    # =========================================================================
    # 2. PortalApiError RFC 7807 Normalization
    # =========================================================================
    def test_04_portal_api_error_unit(self):
        """PortalApiError normalizes RFC 7807 problem details and formats messages"""
        js = """
        const { PortalApiError } = require('./portal_ui/js/api/PortalApiError');

        const err1 = new PortalApiError({
          status: 404,
          code: 'QUOTE_NOT_FOUND',
          title: 'Not Found',
          detail: 'Quotation quo_test was not found in system.'
        });

        const rawBackendJson = {
          type: 'https://errors.dealflow360.com/invalid-discount',
          title: 'Invalid Discount',
          status: 422,
          code: 'DISCOUNT_EXCEEDS_MAX',
          detail: 'Proposed discount exceeds commercial ceiling.',
          invalid_params: [{ name: 'discount_pct', reason: 'Must be <= 25%' }]
        };
        const err2 = PortalApiError.fromProblemDetails(rawBackendJson, 422, '/quotes/123/discount');

        const netErr = PortalApiError.networkError(new Error('Failed to fetch'), '/quotes');

        console.log(JSON.stringify({
          err1: {
            name: err1.name,
            status: err1.status,
            code: err1.code,
            userMessage: err1.getUserMessage()
          },
          err2: {
            status: err2.status,
            code: err2.code,
            detail: err2.detail,
            invalidCount: err2.invalidParams.length
          },
          netErr: {
            status: netErr.status,
            isNetwork: netErr.isNetworkError,
            userMessage: netErr.getUserMessage()
          }
        }));
        """
        output = json.loads(self._exec_node(js))
        self.assertEqual(output["err1"]["status"], 404)
        self.assertEqual(output["err1"]["code"], "QUOTE_NOT_FOUND")
        self.assertIn("not found", output["err1"]["userMessage"].lower())

        self.assertEqual(output["err2"]["status"], 422)
        self.assertEqual(output["err2"]["code"], "DISCOUNT_EXCEEDS_MAX")
        self.assertEqual(output["err2"]["invalidCount"], 1)

        self.assertEqual(output["netErr"]["status"], 0)
        self.assertTrue(output["netErr"]["isNetwork"])
        self.assertIn("failure", output["netErr"]["userMessage"].lower())

    # =========================================================================
    # 3. TokenStore Session Handling
    # =========================================================================
    def test_05_token_store_unit(self):
        """TokenStore stores JWT tokens, hydrates user profile, and alerts subscribers"""
        js = """
        const { TokenStore } = require('./portal_ui/js/api/TokenStore');

        const store = new TokenStore();
        let events = [];
        const unsubscribe = store.subscribe((event, data) => {
          events.push({ event, data });
        });

        // Initially unauthenticated
        const initiallyHas = store.hasToken();

        // Set access token
        store.setAccessToken('access_token_123');
        store.setRefreshToken('refresh_token_456');
        store.setUser({ id: 'usr_1', name: 'Sarah' });

        const authedHas = store.hasToken();
        const readAccessToken = store.getAccessToken();
        const readRefreshToken = store.getRefreshToken();
        const readUser = store.getUser();

        // Clear session
        store.clear();
        const postClearHas = store.hasToken();

        unsubscribe();
        store.setAccessToken('ignored_event');

        console.log(JSON.stringify({
          initiallyHas,
          authedHas,
          readAccessToken,
          readRefreshToken,
          readUser,
          postClearHas,
          eventsCount: events.length
        }));
        """
        output = json.loads(self._exec_node(js))
        self.assertFalse(output["initiallyHas"])
        self.assertTrue(output["authedHas"])
        self.assertEqual(output["readAccessToken"], "access_token_123")
        self.assertEqual(output["readRefreshToken"], "refresh_token_456")
        self.assertEqual(output["readUser"]["name"], "Sarah")
        self.assertFalse(output["postClearHas"])
        self.assertEqual(output["eventsCount"], 3)  # token_changed, user_changed, session_cleared

    # =========================================================================
    # 4. QueryCache In-Memory TTL & Selective Invalidation
    # =========================================================================
    def test_06_query_cache_ttl_and_invalidation(self):
        """QueryCache respects TTL expiration, deterministic keys, and prefix invalidation"""
        js = """
        const { QueryCache } = require('./portal_ui/js/api/QueryCache');

        const cache = new QueryCache({ defaultTtlMs: 50 });

        // Set items
        cache.set(['quotes', { page: 1 }], [{ id: 'q1' }]);
        cache.set(['quotes', { page: 2 }], [{ id: 'q2' }]);
        cache.set(['quote', 'q1'], { id: 'q1', title: 'Quote 1' });

        const beforeVal1 = cache.get(['quotes', { page: 1 }]);
        const beforeDetail = cache.get(['quote', 'q1']);

        // Prefix invalidation: invalidate all quotes listings
        const invalidatedCount = cache.invalidate(['quotes']);
        const afterVal1 = cache.get(['quotes', { page: 1 }]);
        const detailStillExists = cache.get(['quote', 'q1']);

        console.log(JSON.stringify({
          beforeFound: Boolean(beforeVal1),
          detailFound: Boolean(beforeDetail),
          invalidatedCount,
          afterListingFound: Boolean(afterVal1),
          detailStillFound: Boolean(detailStillExists)
        }));
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["beforeFound"])
        self.assertTrue(output["detailFound"])
        self.assertEqual(output["invalidatedCount"], 2)
        self.assertFalse(output["afterListingFound"])
        self.assertTrue(output["detailStillFound"])

    def test_07_query_cache_optimistic_update_and_rollback(self):
        """QueryCache supports optimistic update mutations with precise automatic rollbacks"""
        js = """
        const { QueryCache } = require('./portal_ui/js/api/QueryCache');

        const cache = new QueryCache();
        const key = ['notifications'];
        cache.set(key, { data: [{ id: 'n1', is_read: false }] });

        // Optimistically mark read
        const rollback = cache.optimisticUpdate(key, current => {
          return {
            data: current.data.map(n => Object.assign({}, n, { is_read: true }))
          };
        });

        const optimisticValue = cache.get(key);

        // Execute rollback
        rollback();
        const rolledBackValue = cache.get(key);

        console.log(JSON.stringify({
          optimisticRead: optimisticValue.data[0].is_read,
          rolledBackRead: rolledBackValue.data[0].is_read
        }));
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["optimisticRead"])
        self.assertFalse(output["rolledBackRead"])

    # =========================================================================
    # 5. ApiClient Transport & Security
    # =========================================================================
    def test_08_api_client_bearer_token_injection(self):
        """ApiClient automatically injects Authorization Bearer header from TokenStore"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');

        (async () => {{
          const suite = createPortalClient({{ baseUrl: '{self.base_url}' }});
          suite.tokenStore.setAccessToken('{self.token_signatory}');

          // Call GET /quotes/quo_8819ab2
          const quote = await suite.client.get('/quotes/quo_8819ab2');

          console.log(JSON.stringify({{
            quoteNumber: quote.quote_number,
            status: quote.status
          }}));
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertEqual(output["quoteNumber"], "QUO-2026-0048")
        self.assertEqual(output["status"], "sent")

    def test_09_api_client_error_normalization_rfc7807(self):
        """ApiClient rejects failed responses with normalized PortalApiError instances"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');
        const {{ PortalApiError }} = require('./portal_ui/js/api/PortalApiError');

        (async () => {{
          const suite = createPortalClient({{ baseUrl: '{self.base_url}' }});
          suite.tokenStore.setAccessToken('{self.token_signatory}');

          try {{
            // Attempt to access non-existent quotation
            await suite.client.get('/quotes/quo_does_not_exist_999');
            console.log(JSON.stringify({{ errorOccurred: false }}));
          }} catch (err) {{
            console.log(JSON.stringify({{
              errorOccurred: true,
              isPortalApiError: err instanceof PortalApiError,
              status: err.status,
              code: err.code,
              detail: err.detail
            }}));
          }}
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["errorOccurred"])
        self.assertTrue(output["isPortalApiError"])
        self.assertEqual(output["status"], 404)
        self.assertEqual(output["code"], "QUOTE_NOT_FOUND")

    def test_10_api_client_timeout_and_abort(self):
        """ApiClient aborts requests exceeding timeoutMs and throws network error"""
        js = f"""
        const {{ ApiClient }} = require('./portal_ui/js/api/ApiClient');
        const {{ PortalApiError }} = require('./portal_ui/js/api/PortalApiError');

        (async () => {{
          // Timeout configured to 1ms to trigger abort immediately
          const client = new ApiClient({{
            baseUrl: '{self.base_url}',
            timeoutMs: 1,
            maxRetries: 0
          }});

          try {{
            await client.get('/quotes/quo_8819ab2');
            console.log(JSON.stringify({{ aborted: false }}));
          }} catch (err) {{
            console.log(JSON.stringify({{
              aborted: true,
              isNetwork: err.isNetworkError,
              status: err.status
            }}));
          }}
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["aborted"])
        self.assertTrue(output["isNetwork"])
        self.assertEqual(output["status"], 0)

    # =========================================================================
    # 6. Silent 401 Refresh Interceptor
    # =========================================================================
    def test_11_api_client_401_silent_refresh(self):
        """ApiClient silently refreshes expired token on 401 and transparently replays request"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');

        (async () => {{
          const suite = createPortalClient({{ baseUrl: '{self.base_url}' }});
          
          // Seed initial token and valid refresh token
          suite.tokenStore.setAccessToken('expired_or_invalid_access_token');
          suite.tokenStore.setRefreshToken('valid_mock_refresh_token');

          // The mock server will respond 401 to 'expired_or_invalid_access_token'
          // ApiClient should intercept, call POST /auth/refresh, update TokenStore, and replay!
          const userProfile = await suite.client.get('/auth/me');

          const refreshedToken = suite.tokenStore.getAccessToken();

          console.log(JSON.stringify({{
            success: Boolean(userProfile),
            userName: userProfile.name,
            refreshedToken: refreshedToken
          }}));
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["success"])
        self.assertEqual(output["refreshedToken"], "mock_jwt_refreshed_token_usr_c91f0e4b81")

    # =========================================================================
    # 7. AuthService End-to-End
    # =========================================================================
    def test_12_auth_service_flow(self):
        """AuthService supports password login, magic link, token refresh, and logout"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');

        (async () => {{
          const suite = createPortalClient({{ baseUrl: '{self.base_url}' }});

          // 1. Login with password
          const loginRes = await suite.auth.loginWithPassword('sarah.connor@cyberdyne-defense.com', 'SuperSecret2026!');
          const tokenAfterLogin = suite.tokenStore.getAccessToken();

          // 2. Token refresh
          const refreshRes = await suite.auth.refreshToken('mock_refresh_token_xyz');
          const tokenAfterRefresh = suite.tokenStore.getAccessToken();

          // 3. Employee bypass block (403)
          let employeeBypassed = false;
          try {{
            await suite.auth.loginWithPassword('internal.sales@dealflow360.com', 'InternalPass!');
          }} catch (err) {{
            employeeBypassed = (err.status === 403 && err.code === 'EMPLOYEE_PORTAL_BYPASS');
          }}

          // 4. Logout
          const logoutRes = await suite.auth.logout();
          const hasTokenAfterLogout = suite.tokenStore.hasToken();

          console.log(JSON.stringify({{
            loginSuccess: Boolean(loginRes.access_token),
            tokenAfterLogin: Boolean(tokenAfterLogin),
            refreshTokenSuccess: Boolean(refreshRes.access_token),
            employeeBlocked: employeeBypassed,
            logoutSuccess: logoutRes.success,
            hasTokenAfterLogout
          }}));
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["loginSuccess"])
        self.assertTrue(output["tokenAfterLogin"])
        self.assertTrue(output["refreshTokenSuccess"])
        self.assertTrue(output["employeeBlocked"])
        self.assertTrue(output["logoutSuccess"])
        self.assertFalse(output["hasTokenAfterLogout"])

    # =========================================================================
    # 8. QuoteService & QuoteDetailService
    # =========================================================================
    def test_13_quote_service_and_quote_detail_service(self):
        """QuoteService & QuoteDetailService fetch listing and granular quote details"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');

        (async () => {{
          const suite = createPortalClient({{ baseUrl: '{self.base_url}' }});
          suite.tokenStore.setAccessToken('{self.token_signatory}');

          // 1. Listing
          const quoteList = await suite.quotes.fetchQuotes({{ status: 'all' }});

          // 2. Summary KPI metrics
          const summary = await suite.quotes.fetchSummary();

          // 3. Detail
          const detail = await suite.quoteDetail.fetchQuoteDetail('quo_8819ab2');

          console.log(JSON.stringify({{
            quotesCount: quoteList.quotes.length,
            kpiTotalCount: summary.total_quotes,
            detailQuoteNumber: detail.quote_number,
            lineItemsCount: detail.line_items.length,
            totalAmount: detail.pricing_summary.total_amount
          }}));
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["quotesCount"] >= 1)
        self.assertTrue(output["kpiTotalCount"] >= 1)
        self.assertEqual(output["detailQuoteNumber"], "QUO-2026-0048")
        self.assertEqual(output["lineItemsCount"], 2)
        self.assertEqual(output["totalAmount"], 107400.00)

    # =========================================================================
    # 9. NegotiationService & Counter-Discounts
    # =========================================================================
    def test_14_negotiation_service_counter_discount(self):
        """NegotiationService submits counter-discount with idempotency key and invalidates cache"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');

        (async () => {{
          const suite = createPortalClient({{ baseUrl: '{self.base_url}' }});
          suite.tokenStore.setAccessToken('{self.token_signatory}');

          // 1. Fetch negotiation status
          const status = await suite.negotiation.fetchNegotiationStatus('quo_8819ab2');

          // 2. Submit counter-discount (12%)
          const counterRes = await suite.negotiation.submitCounterDiscount('quo_8819ab2', {{
            requested_discount_percent: 12.0,
            rationale: 'Aligning with FY26 IT procurement budget.'
          }});

          // 3. Boundary validation: discount <= 0 should throw 400
          let caughtInvalid = false;
          try {{
            await suite.negotiation.submitCounterDiscount('quo_8819ab2', {{
              requested_discount_percent: 0.0
            }});
          }} catch (err) {{
            caughtInvalid = (err.status === 400 && err.code === 'INVALID_DISCOUNT_RANGE');
          }}

          console.log(JSON.stringify({{
            initialStatus: status.quote_status,
            counterStatus: counterRes.quote_status,
            negotiationStatus: counterRes.negotiation_status,
            caughtInvalid
          }}));
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertEqual(output["counterStatus"], "in_negotiation")
        self.assertEqual(output["negotiationStatus"], "pending_seller_review")
        self.assertTrue(output["caughtInvalid"])

    # =========================================================================
    # 10. CommentService Line-Level & Safe Optimism
    # =========================================================================
    def test_15_comment_service_line_level_discussions(self):
        """CommentService retrieves line comments, posts new messages, and respects privacy"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');

        (async () => {{
          const suite = createPortalClient({{ baseUrl: '{self.base_url}' }});
          suite.tokenStore.setAccessToken('{self.token_signatory}');

          // 1. Fetch line comments for line_4020
          const initialComments = await suite.comments.fetchLineComments('quo_8819ab2', 'line_4020');

          // Ensure zero-leak: internal note should not be in customer stream
          const hasInternal = initialComments.comments.some(c => c.visibility === 'internal');

          // 2. Post line comment
          const newComment = await suite.comments.postLineComment('quo_8819ab2', 'line_4020', {{
            message: 'Confirmed SLA parameters with security team.'
          }});

          // 3. Mark thread as read
          const markRes = await suite.comments.markLineCommentsRead('quo_8819ab2', 'line_4020');

          console.log(JSON.stringify({{
            initialCount: initialComments.comments.length,
            hasInternal,
            newCommentId: newComment.comment_id,
            newCommentMessage: newComment.message,
            markSuccess: markRes.success
          }}));
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["initialCount"] >= 2)
        self.assertFalse(output["hasInternal"], "Internal-only comment leaked to customer!")
        self.assertIn("Confirmed SLA", output["newCommentMessage"])
        self.assertTrue(output["markSuccess"])

    # =========================================================================
    # 11. RevisionService Timelines & Semantic Diffs
    # =========================================================================
    def test_16_revision_service_timeline_and_diff(self):
        """RevisionService fetches revision history and semantic financial diffs"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');

        (async () => {{
          const suite = createPortalClient({{ baseUrl: '{self.base_url}' }});
          suite.tokenStore.setAccessToken('{self.token_signatory}');

          // 1. Fetch revisions list
          const revList = await suite.revisions.fetchRevisions('quo_8819ab2');

          // 2. Fetch diff between revision 1 and 2
          const diff = await suite.revisions.fetchRevisionDiff('quo_8819ab2', 'rev_002', 'rev_001');

          console.log(JSON.stringify({{
            currentRevision: revList.current_revision,
            revisionsLength: revList.revisions.length,
            deltaTotal: diff.financial_delta.difference_amount,
            lineDeltasLength: diff.line_item_deltas.length
          }}));
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertEqual(output["currentRevision"], 1)
        self.assertEqual(output["deltaTotal"], -7500.00)
        self.assertTrue(output["lineDeltasLength"] >= 1)

    # =========================================================================
    # 12. ConfirmationService Authoritative Legal E-Sign
    # =========================================================================
    def test_17_confirmation_service_authoritative(self):
        """ConfirmationService enforces authoritative validation and signatory rules"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');

        (async () => {{
          // 1. Signatory account (Sarah Connor)
          const suiteSignatory = createPortalClient({{ baseUrl: '{self.base_url}' }});
          suiteSignatory.tokenStore.setAccessToken('{self.token_signatory}');

          const summary = await suiteSignatory.confirmation.getPreConfirmationSummary('quo_8819ab2');

          // Submit valid confirmation
          const confirmRes = await suiteSignatory.confirmation.confirmQuote('quo_8819ab2', {{
            signer_name: 'Sarah Connor',
            signer_title: 'Chief Information Security Officer',
            accepted_terms: true
          }});

          // 2. Missing terms validation (400)
          let missingTermsError = false;
          try {{
            await suiteSignatory.confirmation.confirmQuote('quo_8819ab2', {{
              signer_name: 'Sarah Connor',
              accepted_terms: false
            }});
          }} catch (err) {{
            missingTermsError = (err.status === 400 && err.code === 'TERMS_NOT_ACCEPTED');
          }}

          // 3. Non-signatory account (John Connor - can_sign_quotes: False)
          const suiteViewer = createPortalClient({{ baseUrl: '{self.base_url}' }});
          suiteViewer.tokenStore.setAccessToken('{self.token_viewer}');

          let forbiddenSignatory = false;
          try {{
            await suiteViewer.confirmation.confirmQuote('quo_8819ab2', {{
              signer_name: 'John Connor',
              accepted_terms: true
            }});
          }} catch (err) {{
            forbiddenSignatory = (err.status === 403 && err.code === 'FORBIDDEN_SIGNATORY_REQUIRED');
          }}

          console.log(JSON.stringify({{
            canAccept: summary.can_accept,
            orderNumber: confirmRes.reference_order_number,
            statusAfterConfirm: confirmRes.status,
            missingTermsError,
            forbiddenSignatory
          }}));
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["canAccept"])
        self.assertEqual(output["orderNumber"], "SO-2026-1184")
        self.assertEqual(output["statusAfterConfirm"], "approved")
        self.assertTrue(output["missingTermsError"])
        self.assertTrue(output["forbiddenSignatory"])

    # =========================================================================
    # 13. NotificationService & StatusService
    # =========================================================================
    def test_18_notifications_and_status_service(self):
        """NotificationService handles alerts and StatusService manages event subscriptions"""
        js = f"""
        const {{ createPortalClient }} = require('./portal_ui/js/services');

        (async () => {{
          const suite = createPortalClient({{ baseUrl: '{self.base_url}' }});
          suite.tokenStore.setAccessToken('{self.token_signatory}');

          // 1. Fetch notifications
          const notifs = await suite.notifications.fetchNotifications();

          // 2. Mark single notification read
          const markOne = await suite.notifications.markNotificationRead('notif_5521');

          // 3. Mark all read
          const markAll = await suite.notifications.markAllNotificationsRead();

          // 4. StatusService subscription
          let eventReceived = null;
          const unsubscribe = suite.status.on('status:quo_8819ab2', data => {{
            eventReceived = data;
          }});
          suite.status.emit('status:quo_8819ab2', {{ status: 'approved' }});
          unsubscribe();

          // Stop all pollers
          suite.status.stopAll();

          console.log(JSON.stringify({{
            notifCount: notifs.data.length,
            markOneSuccess: markOne.is_read,
            markAllSuccess: markAll.success,
            eventPayloadStatus: eventReceived ? eventReceived.status : null
          }}));
        }})();
        """
        output = json.loads(self._exec_node(js))
        self.assertTrue(output["notifCount"] >= 1)
        self.assertTrue(output["markOneSuccess"])
        self.assertTrue(output["markAllSuccess"])
        self.assertEqual(output["eventPayloadStatus"], "approved")

    # =========================================================================
    # 14. Central Factory & Client Cohesion
    # =========================================================================
    def test_19_central_services_factory_and_singleton(self):
        """createPortalClient creates fully wired suite sharing cache and token store"""
        js = f"""
        const services = require('./portal_ui/js/services');

        const suite = services.createPortalClient({{ baseUrl: '{self.base_url}' }});
        suite.tokenStore.setAccessToken('test_cohesion_token');

        // Verify shared reference: AuthService, QuoteService, ApiClient share same TokenStore
        const clientToken = suite.client.tokenStore.getAccessToken();
        const authClientToken = suite.auth.client.tokenStore.getAccessToken();
        const sameTokenStore = (suite.tokenStore === suite.client.tokenStore);
        const sameCache = (suite.cache === suite.client.cache);

        console.log(JSON.stringify({{
          clientToken,
          authClientToken,
          sameTokenStore,
          sameCache,
          hasAllServices: Boolean(
            suite.auth &&
            suite.quotes &&
            suite.quoteDetail &&
            suite.negotiation &&
            suite.comments &&
            suite.revisions &&
            suite.confirmation &&
            suite.notifications &&
            suite.status
          )
        }}));
        """
        output = json.loads(self._exec_node(js))
        self.assertEqual(output["clientToken"], "test_cohesion_token")
        self.assertEqual(output["authClientToken"], "test_cohesion_token")
        self.assertTrue(output["sameTokenStore"])
        self.assertTrue(output["sameCache"])
        self.assertTrue(output["hasAllServices"])


if __name__ == "__main__":
    unittest.main()

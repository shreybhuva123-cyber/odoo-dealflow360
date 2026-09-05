"""
DealFlow360 - Customer Portal Mock API Server
Phase 1 Contract Verification Server
Zero external dependencies (uses Python standard library).
Can be run standalone for frontend development: python -m mock_server.portal_mock_api
"""

import http.server
import json
import os
import re
import urllib.parse
from http import HTTPStatus

PORT = 8080
HOST = "127.0.0.1"

# Mock In-Memory Database
# Mock In-Memory Database (Multi-Tenant)
MOCK_USERS = {
    "usr_c91f0e4b81": {
        "id": "usr_c91f0e4b81",
        "name": "Sarah Connor",
        "email": "sarah.connor@cyberdyne-defense.com",
        "phone": "+1 (555) 019-2834",
        "partner_id": 4821,
        "commercial_partner_id": 1205,
        "company_name": "Cyberdyne Defense Systems",
        "can_sign_quotes": True,
        "share": True,
        "token": "mock_jwt_access_token_usr_c91f0e4b81",
        "unread_notifications_count": 3
    },
    "usr_john_connor": {
        "id": "usr_john_connor",
        "name": "John Connor",
        "email": "john.connor@cyberdyne-defense.com",
        "phone": "+1 (555) 019-2835",
        "partner_id": 4822,
        "commercial_partner_id": 1205,
        "company_name": "Cyberdyne Defense Systems",
        "can_sign_quotes": False,  # Non-signatory
        "share": True,
        "token": "mock_jwt_token_customer_a_non_signatory",
        "unread_notifications_count": 0
    },
    "usr_bruce_wayne": {
        "id": "usr_bruce_wayne",
        "name": "Bruce Wayne",
        "email": "bruce.wayne@wayne-enterprises.com",
        "phone": "+1 (555) 991-0001",
        "partner_id": 9901,
        "commercial_partner_id": 7701,  # Different tenant!
        "company_name": "Wayne Enterprises",
        "can_sign_quotes": True,
        "share": True,
        "token": "mock_jwt_token_customer_b",
        "unread_notifications_count": 0
    },
    "usr_internal_sales": {
        "id": "usr_internal_sales",
        "name": "Alex Mercer",
        "email": "internal.sales@dealflow360.com",
        "role": "sales_rep",
        "share": False,
        "token": "mock_jwt_internal_sales_token"
    },
    "usr_internal_director": {
        "id": "usr_internal_director",
        "name": "Marcus Vance",
        "email": "marcus.vance@dealflow360.com",
        "role": "commercial_director",
        "share": False,
        "token": "mock_jwt_commercial_director_token"
    },
    "usr_internal_ops": {
        "id": "usr_internal_ops",
        "name": "Logistics Dispatch Desk",
        "email": "ops@dealflow360.com",
        "role": "operations",
        "share": False,
        "token": "mock_jwt_ops_token"
    },
    "usr_internal_finance": {
        "id": "usr_internal_finance",
        "name": "Financial Controller Desk",
        "email": "finance@dealflow360.com",
        "role": "finance",
        "share": False,
        "token": "mock_jwt_finance_token"
    }
}

MOCK_USER = MOCK_USERS["usr_c91f0e4b81"]

MOCK_QUOTES = {
    # Customer A's Quote (Commercial Partner 1205)
    "quo_8819ab2": {
        "quote_id": "quo_8819ab2",
        "quote_number": "QUO-2026-0048",
        "title": "Enterprise Cloud Migration & Threat Defense Suite",
        "commercial_partner_id": 1205,
        "partner_id": 4821,
        "status": "sent",
        "negotiation_status": "none",
        "revision_number": 1,
        "created_at": "2026-09-01T08:00:00Z",
        "expiration_date": "2026-09-30T23:59:59Z",
        "currency": "USD",
        "pricing_summary": {
            "subtotal": 100000.00,
            "discount_total": 0.00,
            "discount_percentage": 0.0,
            "tax_total": 7400.00,
            "total_amount": 107400.00,
            "one_time_total": 13425.00,
            "recurring_total": 93975.00,
            "recurring_interval": "annual"
        },
        "sales_rep": {
            "name": "Alex Mercer",
            "email": "alex.mercer@dealflow360.com",
            "phone": "+1 (555) 302-8811",
            "avatar_url": "https://cdn.dealflow360.com/team/alex.png"
        },
        "customer": {
            "company_name": "Cyberdyne Defense Systems",
            "contact_name": "Sarah Connor",
            "billing_address": "800 Cyberdyne Blvd, Sunnyvale, CA",
            "shipping_address": "800 Cyberdyne Blvd, Sunnyvale, CA"
        },
        "line_items": [
            {
                "line_id": "line_4020",
                "product_id": "prod_cloud_01",
                "name": "Core Security Infrastructure License",
                "description": "Annual enterprise tier license with automated anomaly detection.",
                "charge_type": "recurring",
                "recurring_interval": "annual",
                "quantity": 1.0,
                "uom": "Units",
                "unit_price": 87500.00,
                "discount_percent": 0.0,
                "discount_amount": 0.00,
                "subtotal": 87500.00,
                "tax_rate_percent": 7.4,
                "tax_amount": 6475.00,
                "total_amount": 93975.00
            },
            {
                "line_id": "line_4021",
                "product_id": "prod_trg_02",
                "name": "On-Site Implementation & Training Workshop",
                "description": "Comprehensive engineer onboarding, 5 full-day sessions.",
                "charge_type": "one_time",
                "recurring_interval": None,
                "quantity": 5.0,
                "uom": "Days",
                "unit_price": 2500.00,
                "discount_percent": 0.0,
                "discount_amount": 0.00,
                "subtotal": 12500.00,
                "tax_rate_percent": 7.4,
                "tax_amount": 925.00,
                "total_amount": 13425.00
            }
        ],
        "terms_and_conditions": "Payment due Net 30 days from invoice date. Implementation starts within 14 days of signature. Level-2 SLA included.",
        "payment_terms": "Net 30",
        "can_accept": True,
        "can_negotiate": True,
        # Internal fields that must be redacted by serializer:
        "_internal_standard_price": 45000.00,
        "_internal_margin": 55.0,
        "_internal_rep_commission": 8.5
    },
    "quo_8819ab3": {
        "quote_id": "quo_8819ab3",
        "quote_number": "QUO-2026-0049",
        "title": "AI Anomaly Detection Sensor Expansion",
        "commercial_partner_id": 1205,
        "partner_id": 4821,
        "status": "sent",
        "negotiation_status": "none",
        "revision_number": 1,
        "created_at": "2026-09-03T11:00:00Z",
        "updated_at": "2026-09-03T11:00:00Z",
        "expiration_date": "2026-10-05T23:59:59Z",
        "currency": "USD",
        "pricing_summary": {
            "subtotal": 45000.00,
            "discount_total": 0.00,
            "discount_percentage": 0.0,
            "tax_total": 3500.00,
            "total_amount": 48500.00,
            "one_time_total": 48500.00,
            "recurring_total": 0.00,
            "recurring_interval": None
        },
        "sales_rep": {
            "name": "Elena Rostova",
            "email": "elena.rostova@dealflow360.com"
        },
        "customer": {
            "company_name": "Cyberdyne Defense Systems",
            "contact_name": "Sarah Connor",
            "billing_address": "800 Cyberdyne Blvd, Sunnyvale, CA",
            "shipping_address": "800 Cyberdyne Blvd, Sunnyvale, CA"
        },
        "line_items": [
            {
                "line_id": "line_4030",
                "product_id": "prod_sens_01",
                "name": "AI Anomaly Edge Sensor Nodes (Pack of 10)",
                "description": "Distributed edge inference probes for real-time telemetry inspection.",
                "charge_type": "one_time",
                "recurring_interval": None,
                "quantity": 3.0,
                "uom": "Packs",
                "unit_price": 15000.00,
                "discount_percent": 0.0,
                "discount_amount": 0.00,
                "subtotal": 45000.00,
                "tax_rate_percent": 7.78,
                "tax_amount": 3500.00,
                "total_amount": 48500.00
            }
        ],
        "terms_and_conditions": "Standard hardware deployment terms. 1-year warranty included.",
        "payment_terms": "Net 30",
        "can_accept": True,
        "can_negotiate": True,
        "_internal_standard_price": 20000.00,
        "_internal_margin": 58.0
    },
    "quo_8819ab4": {
        "quote_id": "quo_8819ab4",
        "quote_number": "QUO-2026-0032",
        "title": "Legacy Infrastructure Maintenance Renewal",
        "commercial_partner_id": 1205,
        "partner_id": 4821,
        "status": "approved",
        "negotiation_status": "approved_by_seller",
        "reference_order_number": "SO-2026-1184",
        "confirmed_at": "2026-08-28T14:30:00Z",
        "revision_number": 3,
        "created_at": "2026-08-15T09:00:00Z",
        "updated_at": "2026-08-28T14:30:00Z",
        "expiration_date": "2026-09-15T23:59:59Z",
        "currency": "USD",
        "pricing_summary": {
            "subtotal": 185000.00,
            "discount_total": 5000.00,
            "discount_percentage": 2.7,
            "tax_total": 13000.00,
            "total_amount": 198000.00,
            "one_time_total": 0.00,
            "recurring_total": 198000.00,
            "recurring_interval": "annual"
        },
        "sales_rep": {
            "name": "Alex Mercer",
            "email": "alex.mercer@dealflow360.com"
        },
        "customer": {
            "company_name": "Cyberdyne Defense Systems",
            "contact_name": "Sarah Connor",
            "billing_address": "800 Cyberdyne Blvd, Sunnyvale, CA",
            "shipping_address": "800 Cyberdyne Blvd, Sunnyvale, CA"
        },
        "line_items": [
            {
                "line_id": "line_4040",
                "product_id": "prod_maint_01",
                "name": "Legacy Infrastructure Maintenance Tier 1",
                "description": "Comprehensive maintenance coverage including 24/7 emergency dispatch.",
                "charge_type": "recurring",
                "recurring_interval": "annual",
                "quantity": 1.0,
                "uom": "Year",
                "unit_price": 190000.00,
                "discount_percent": 2.63,
                "discount_amount": 5000.00,
                "subtotal": 185000.00,
                "tax_rate_percent": 7.03,
                "tax_amount": 13000.00,
                "total_amount": 198000.00
            }
        ],
        "terms_and_conditions": "Annual maintenance agreement. Auto-renews unless notice provided 60 days prior.",
        "payment_terms": "Net 30",
        "can_accept": False,
        "can_negotiate": False,
        "_internal_standard_price": 90000.00,
        "_internal_margin": 52.0
    },
    "quo_8819ab5": {
        "quote_id": "quo_8819ab5",
        "quote_number": "QUO-2026-0021",
        "title": "On-Premise Hardware Cluster Tier 3",
        "commercial_partner_id": 1205,
        "partner_id": 4821,
        "status": "expired",
        "negotiation_status": "none",
        "revision_number": 1,
        "created_at": "2026-07-01T10:00:00Z",
        "updated_at": "2026-07-01T10:00:00Z",
        "expiration_date": "2026-08-01T23:59:59Z",
        "currency": "USD",
        "pricing_summary": {
            "subtotal": 70000.00,
            "discount_total": 0.00,
            "discount_percentage": 0.0,
            "tax_total": 5000.00,
            "total_amount": 75000.00,
            "one_time_total": 75000.00,
            "recurring_total": 0.00,
            "recurring_interval": None
        },
        "sales_rep": {
            "name": "Alex Mercer",
            "email": "alex.mercer@dealflow360.com"
        },
        "customer": {
            "company_name": "Cyberdyne Defense Systems",
            "contact_name": "Sarah Connor",
            "billing_address": "800 Cyberdyne Blvd, Sunnyvale, CA",
            "shipping_address": "800 Cyberdyne Blvd, Sunnyvale, CA"
        },
        "line_items": [
            {
                "line_id": "line_4050",
                "product_id": "prod_hw_01",
                "name": "On-Premise Hardware Cluster Tier 3",
                "description": "High-availability rack-mounted compute units.",
                "charge_type": "one_time",
                "recurring_interval": None,
                "quantity": 1.0,
                "uom": "Rack",
                "unit_price": 70000.00,
                "discount_percent": 0.0,
                "discount_amount": 0.00,
                "subtotal": 70000.00,
                "tax_rate_percent": 7.14,
                "tax_amount": 5000.00,
                "total_amount": 75000.00
            }
        ],
        "terms_and_conditions": "Hardware delivery within 45 days. Proposal expired on 2026-08-01.",
        "payment_terms": "Net 30",
        "can_accept": False,
        "can_negotiate": False,
        "_internal_standard_price": 50000.00,
        "_internal_margin": 33.3
    },
    "quo_8819ab6": {
        "quote_id": "quo_8819ab6",
        "quote_number": "QUO-2026-0015",
        "title": "Disaster Recovery Standby Site",
        "commercial_partner_id": 1205,
        "partner_id": 4821,
        "status": "rejected",
        "negotiation_status": "none",
        "revision_number": 1,
        "created_at": "2026-06-10T14:00:00Z",
        "updated_at": "2026-06-18T16:20:00Z",
        "expiration_date": "2026-07-10T23:59:59Z",
        "currency": "USD",
        "pricing_summary": {
            "subtotal": 58000.00,
            "discount_total": 0.00,
            "discount_percentage": 0.0,
            "tax_total": 4000.00,
            "total_amount": 62000.00,
            "one_time_total": 12000.00,
            "recurring_total": 50000.00,
            "recurring_interval": "annual"
        },
        "sales_rep": {
            "name": "Elena Rostova",
            "email": "elena.rostova@dealflow360.com"
        },
        "customer": {
            "company_name": "Cyberdyne Defense Systems",
            "contact_name": "Sarah Connor",
            "billing_address": "800 Cyberdyne Blvd, Sunnyvale, CA",
            "shipping_address": "800 Cyberdyne Blvd, Sunnyvale, CA"
        },
        "line_items": [
            {
                "line_id": "line_4060",
                "product_id": "prod_dr_01",
                "name": "Cold Standby Failover Site Infrastructure",
                "description": "Geographically redundant standby failover replica.",
                "charge_type": "recurring",
                "recurring_interval": "annual",
                "quantity": 1.0,
                "uom": "Site",
                "unit_price": 58000.00,
                "discount_percent": 0.0,
                "discount_amount": 0.00,
                "subtotal": 58000.00,
                "tax_rate_percent": 6.9,
                "tax_amount": 4000.00,
                "total_amount": 62000.00
            }
        ],
        "terms_and_conditions": "Declined by buyer during commercial review on 2026-06-18.",
        "payment_terms": "Net 30",
        "can_accept": False,
        "can_negotiate": False,
        "_internal_standard_price": 40000.00,
        "_internal_margin": 35.0
    },
    # Customer B's Quote (Commercial Partner 7701 - Wayne Enterprises)
    "quo_wayne_991": {
        "quote_id": "quo_wayne_991",
        "quote_number": "QUO-2026-0099",
        "title": "Tactical Defense Infrastructure",
        "commercial_partner_id": 7701,
        "partner_id": 9901,
        "status": "sent",
        "negotiation_status": "none",
        "revision_number": 1,
        "created_at": "2026-09-02T08:00:00Z",
        "expiration_date": "2026-10-15T23:59:59Z",
        "currency": "USD",
        "pricing_summary": {
            "subtotal": 500000.00,
            "discount_total": 0.00,
            "discount_percentage": 0.0,
            "tax_total": 37000.00,
            "total_amount": 537000.00,
            "one_time_total": 537000.00,
            "recurring_total": 0.00,
            "recurring_interval": None
        },
        "sales_rep": {
            "name": "Alex Mercer",
            "email": "alex.mercer@dealflow360.com"
        },
        "customer": {
            "company_name": "Wayne Enterprises",
            "contact_name": "Bruce Wayne",
            "billing_address": "1007 Mountain Drive, Gotham City",
            "shipping_address": "1007 Mountain Drive, Gotham City"
        },
        "line_items": [
            {
                "line_id": "line_9901",
                "product_id": "prod_tac_01",
                "name": "Subterranean Perimeter Defense Array",
                "description": "High-density thermal grid sensor installation.",
                "charge_type": "one_time",
                "recurring_interval": None,
                "quantity": 2.0,
                "uom": "Units",
                "unit_price": 250000.00,
                "discount_percent": 0.0,
                "discount_amount": 0.00,
                "subtotal": 500000.00,
                "tax_rate_percent": 7.4,
                "tax_amount": 37000.00,
                "total_amount": 537000.00
            }
        ],
        "terms_and_conditions": "Strict confidentiality required. Delivery within 60 days.",
        "payment_terms": "Immediate (Net 15)",
        "can_accept": True,
        "can_negotiate": True,
        "_internal_standard_price": 220000.00,
        "_internal_margin": 56.0
    }
}

MOCK_COMMENTS = [
    {
        "comment_id": "cmt_991823",
        "quote_id": "quo_8819ab2",
        "line_id": "line_4020",
        "stable_line_key": "prod_cloud_01_core_lic",
        "revision_number": 1,
        "parent_comment_id": None,
        "author": {
            "id": "usr_c91f0e4b81",
            "name": "Sarah Connor",
            "email": "sarah.connor@cyberdyne-defense.com",
            "type": "customer",
            "avatar_url": "https://cdn.dealflow360.com/avatars/usr_c91f0e4b81.png"
        },
        "visibility": "customer",
        "message": "Could we please clarify if Level-2 support SLA includes 24/7 weekend emergency coverage?",
        "created_at": "2026-09-04T09:15:22Z",
        "is_read": True,
        "attachments": []
    },
    {
        "comment_id": "cmt_991845",
        "quote_id": "quo_8819ab2",
        "line_id": "line_4020",
        "stable_line_key": "prod_cloud_01_core_lic",
        "revision_number": 1,
        "parent_comment_id": "cmt_991823",
        "author": {
            "id": "rep_102",
            "name": "Alex Mercer",
            "email": "alex.mercer@dealflow360.com",
            "type": "sales_agent",
            "title": "Account Executive",
            "avatar_url": "https://cdn.dealflow360.com/team/alex.png"
        },
        "visibility": "customer",
        "message": "Hi Sarah! Yes, Enterprise Tier includes 24/7/365 emergency response with guaranteed 30-minute response.",
        "created_at": "2026-09-04T09:40:11Z",
        "is_read": True,
        "attachments": []
    },
    {
        "comment_id": "cmt_internal_secret_99",
        "quote_id": "quo_8819ab2",
        "line_id": "line_4020",
        "stable_line_key": "prod_cloud_01_core_lic",
        "revision_number": 1,
        "parent_comment_id": None,
        "author": {
            "id": "rep_102",
            "name": "Alex Mercer",
            "email": "alex.mercer@dealflow360.com",
            "type": "sales_agent"
        },
        "visibility": "internal",
        "message": "INTERNAL DEAL DESK NOTE: Customer has authorized budget cap of $95k. Concession up to 12% approved by VP. Do not expose to customer.",
        "created_at": "2026-09-04T09:45:00Z",
        "is_read": False,
        "attachments": []
    },
    {
        "comment_id": "cmt_991850",
        "quote_id": "quo_8819ab2",
        "line_id": "line_4021",
        "stable_line_key": "prod_trg_02_workshop",
        "revision_number": 1,
        "parent_comment_id": None,
        "author": {
            "id": "usr_c91f0e4b81",
            "name": "Sarah Connor",
            "email": "sarah.connor@cyberdyne-defense.com",
            "type": "customer",
            "avatar_url": "https://cdn.dealflow360.com/avatars/usr_c91f0e4b81.png"
        },
        "visibility": "customer",
        "message": "Could we please adjust the on-site workshop count from 5 to 3 days if online self-paced training is used?",
        "created_at": "2026-09-04T10:15:00Z",
        "is_read": False,
        "attachments": []
    }
]

MOCK_NOTIFICATIONS = [
    {
        "notification_id": "notif_5521",
        "recipient_id": "usr_c91f0e4b81",
        "event_type": "quote_revision_published",
        "title": "New Quote Revision Published",
        "message": "Alex Mercer published Revision #2 for Quote QUO-2026-0048 with updated pricing.",
        "quote_id": "quo_8819ab2",
        "quote_number": "QUO-2026-0048",
        "target_route": "/portal/quotes/quo_8819ab2?revision=2",
        "is_read": False,
        "created_at": "2026-09-04T14:25:00Z"
    }
]

MOCK_ORDERS = {}
MOCK_INVOICES = {}
MOCK_PAYMENTS = {}


class PortalMockHandler(http.server.BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, Idempotency-Key")

    def _send_json(self, status_code: int, data: dict):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _send_rfc7807_error(self, status_code: int, code: str, title: str, detail: str, invalid_params=None):
        error_payload = {
            "type": f"https://errors.dealflow360.com/{code.lower().replace('_', '-')}",
            "title": title,
            "status": status_code,
            "code": code,
            "detail": detail,
            "instance": self.path,
            "invalid_params": invalid_params or [],
            "timestamp": "2026-09-05T10:45:00.000Z"
        }
        self._send_json(status_code, error_payload)

    def _get_json_body(self):
        if hasattr(self, "_parsed_json_body"):
            return self._parsed_json_body
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            self._parsed_json_body = {}
            return self._parsed_json_body
        raw = self.rfile.read(content_length).decode("utf-8", errors="replace")
        try:
            self._parsed_json_body = json.loads(raw)
        except Exception:
            self._parsed_json_body = None
        return self._parsed_json_body

    def _get_current_user(self):
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer ") or len(auth.split(" ")) < 2:
            return None
        token = auth.split(" ")[1]
        if token.startswith("tampered_") or token == "invalid_token":
            return None
        for u in MOCK_USERS.values():
            if u.get("token") == token:
                return u
        # Backwards compatibility fallback and refreshed token
        if token in ("mock_jwt_access_token_usr_c91f0e4b81", "mock_jwt_refreshed_token_usr_c91f0e4b81"):
            return MOCK_USERS["usr_c91f0e4b81"]
        return None

    def _check_auth(self):
        return self._get_current_user() is not None

    def _check_quote_access(self, quote_id: str):
        user = self._get_current_user()
        if not user:
            return None, 401, "UNAUTHORIZED", "Missing or invalid bearer token."
        if quote_id not in MOCK_QUOTES:
            return None, 404, "QUOTE_NOT_FOUND", f"Quote '{quote_id}' not found."
        quote = MOCK_QUOTES[quote_id]
        # Anti-IDOR Ownership check:
        # Quote commercial_partner_id MUST match user commercial_partner_id
        if quote.get("commercial_partner_id") != user.get("commercial_partner_id"):
            # 404 MASKING DEFENSE: Return 404 Not Found, never 403, to prevent existence enumeration
            return None, 404, "QUOTE_NOT_FOUND", f"Quote '{quote_id}' not found."
        return quote, 200, None, None

    def _sanitize_quote(self, quote: dict):
        sanitized = {k: v for k, v in quote.items() if not k.startswith("_internal")}
        if "line_items" in sanitized and isinstance(sanitized["line_items"], list):
            sanitized["line_items"] = [
                {lk: lv for lk, lv in item.items() if not lk.startswith("_internal")}
                for item in sanitized["line_items"]
            ]
        return sanitized

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        _ = self._get_json_body()
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Serve Customer Portal Static Assets (css, js, etc.)
        portal_ui_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "portal_ui")
        if path.startswith("/css/") or path.startswith("/js/"):
            rel_path = path.lstrip("/").replace("/", os.sep)
            file_path = os.path.join(portal_ui_dir, rel_path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                content_type = "text/css" if path.endswith(".css") else "application/javascript"
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", f"{content_type}; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(content)
                return

        # Serve Customer Portal Single-Page App
        if path in ("/", "/portal") or path.startswith("/portal/"):
            html_path = os.path.join(portal_ui_dir, "index.html")
            if os.path.exists(html_path):
                with open(html_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(content)
                return

        # 6.4 GET /api/v1/portal/auth/me
        if path == "/api/v1/portal/auth/me":
            user = self._get_current_user()
            if not user:
                return self._send_rfc7807_error(401, "UNAUTHORIZED", "Unauthorized", "Missing or invalid bearer token.")
            return self._send_json(200, {k: v for k, v in user.items() if not k.startswith("token") and not k.startswith("_")})

        # 6.5 GET /api/v1/portal/quotes
        if path == "/api/v1/portal/quotes":
            user = self._get_current_user()
            if not user:
                return self._send_rfc7807_error(401, "UNAUTHORIZED", "Unauthorized", "Missing or invalid bearer token.")

            search_query = query.get("search", [""])[0].strip().lower()
            status_filter = query.get("status", ["all"])[0].strip().lower()
            has_neg = query.get("has_negotiation", [None])[0]
            sort_by = query.get("sort_by", ["date"])[0].strip()
            sort_dir = query.get("sort_dir", ["desc"])[0].strip().lower()
            try:
                page = max(1, int(query.get("page", [1])[0]))
            except ValueError:
                page = 1
            try:
                per_page = max(1, min(100, int(query.get("per_page", [10])[0])))
            except ValueError:
                per_page = 10

            # 1. Multi-tenant isolation (strict commercial_partner_id boundary)
            user_quotes = [
                q for q in MOCK_QUOTES.values()
                if q.get("commercial_partner_id") == user.get("commercial_partner_id")
            ]

            # 2. Status filter
            if status_filter and status_filter != "all":
                user_quotes = [q for q in user_quotes if q.get("status", "").lower() == status_filter]

            # 3. Negotiation indicator filter
            if has_neg is not None:
                is_neg = (has_neg.lower() == "true")
                user_quotes = [q for q in user_quotes if (q.get("negotiation_status") != "none") == is_neg]

            # 4. Search query (quote_number, title, sales_rep name)
            if search_query:
                user_quotes = [
                    q for q in user_quotes
                    if (search_query in q.get("quote_number", "").lower() or
                        search_query in q.get("title", "").lower() or
                        search_query in q.get("sales_rep", {}).get("name", "").lower())
                ]

            # 5. Sorting
            is_desc = (sort_dir == "desc")
            if sort_by == "total_amount":
                user_quotes.sort(key=lambda x: x.get("pricing_summary", {}).get("total_amount", 0.0), reverse=is_desc)
            elif sort_by == "expiration_date":
                user_quotes.sort(key=lambda x: x.get("expiration_date", ""), reverse=is_desc)
            elif sort_by == "quote_number":
                user_quotes.sort(key=lambda x: x.get("quote_number", ""), reverse=is_desc)
            else:  # default "date" / "created_at"
                user_quotes.sort(key=lambda x: x.get("created_at", ""), reverse=is_desc)

            total_items = len(user_quotes)
            total_pages = max(1, (total_items + per_page - 1) // per_page)
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            sliced_quotes = user_quotes[start_idx:end_idx]

            # 6. Serialization with Zero-Leak Data Redaction
            data = []
            for q in sliced_quotes:
                total_amt = q["pricing_summary"]["total_amount"]
                data.append({
                    "quote_id": q["quote_id"],
                    "quote_number": q["quote_number"],
                    "title": q["title"],
                    "status": q["status"],
                    "negotiation_status": q["negotiation_status"],
                    "revision_number": q.get("revision_number", 1),
                    "total_amount": total_amt,
                    "currency": q.get("currency", "USD"),
                    "created_at": q.get("created_at"),
                    "updated_at": q.get("updated_at", q.get("created_at")),
                    "expiration_date": q.get("expiration_date"),
                    "sales_rep": {
                        "name": q.get("sales_rep", {}).get("name", "Account Rep"),
                        "email": q.get("sales_rep", {}).get("email", ""),
                        "phone": q.get("sales_rep", {}).get("phone", "")
                    },
                    "has_active_negotiation": q.get("negotiation_status", "none") != "none",
                    "unread_comments_count": len([c for c in MOCK_COMMENTS if c.get("quote_id") == q["quote_id"]])
                })

            response = {
                "data": data,
                "meta": {
                    "pagination": {
                        "current_page": page,
                        "per_page": per_page,
                        "total_items": total_items,
                        "total_pages": total_pages,
                        "has_next_page": page < total_pages,
                        "has_prev_page": page > 1
                    },
                    "filters_applied": {
                        "status": status_filter,
                        "search": search_query,
                        "sort_by": sort_by,
                        "sort_dir": sort_dir
                    }
                },
                "links": {
                    "self": f"/api/v1/portal/quotes?page={page}&per_page={per_page}",
                    "next": f"/api/v1/portal/quotes?page={page+1}&per_page={per_page}" if page < total_pages else None,
                    "prev": f"/api/v1/portal/quotes?page={page-1}&per_page={per_page}" if page > 1 else None,
                    "first": f"/api/v1/portal/quotes?page=1&per_page={per_page}",
                    "last": f"/api/v1/portal/quotes?page={total_pages}&per_page={per_page}"
                }
            }
            return self._send_json(200, response)

        # 6.7 GET /api/v1/portal/quotes/{quote_id}/pdf
        pdf_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/pdf$", path)
        if pdf_match:
            quote_id = pdf_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            fake_pdf = b"%PDF-1.4 Mock DealFlow360 Quote Contract PDF File..."
            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Disposition", f'attachment; filename="DealFlow360_{quote_id}.pdf"')
            self.send_header("Content-Length", str(len(fake_pdf)))
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(fake_pdf)
            return

        # 6.12 GET /api/v1/portal/quotes/{quote_id}/negotiation/status
        neg_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/negotiation/status$", path)
        if neg_match:
            quote_id = neg_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            return self._send_json(200, {
                "quote_id": quote_id,
                "quote_status": quote["status"],
                "active_negotiation_type": "counter_discount",
                "active_request_id": "cd_7719",
                "negotiation_status": quote["negotiation_status"],
                "approval_status": {
                    "overall_status": "in_progress",
                    "public_stage_name": "Commercial Management Review",
                    "stage_number": 1,
                    "total_stages": 2,
                    "estimated_resolution": "2026-09-06T12:00:00Z"
                },
                "submitted_at": "2026-09-05T10:44:30Z",
                "last_updated_at": "2026-09-05T10:50:00Z",
                "latest_seller_comment": None
            })

        # 6.14 GET /api/v1/portal/quotes/{quote_id}/revisions/{revision_id}/diff
        diff_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/revisions/([^/]+)/diff$", path)
        if diff_match:
            quote_id, revision_id = diff_match.groups()
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            if quote_id == "quo_e2e_8819":
                return self._send_json(200, {
                    "quote_id": quote_id,
                    "base_revision": 1,
                    "target_revision": 2,
                    "financial_deltas": {
                        "old_total": 71421.00,
                        "new_total": 73032.00,
                        "difference_amount": 1611.00,
                        "discount_delta_percent": 10.0
                    },
                    "line_item_deltas": [
                        {
                            "line_id": "line_e2e_01",
                            "product_name": "Enterprise Edge Gateway Appliance Model X-1",
                            "change_type": "modified",
                            "old_quantity": 2.0,
                            "new_quantity": 4.0,
                            "old_discount_percent": 5.0,
                            "new_discount_percent": 15.0,
                            "old_total": 10203.00,
                            "new_total": 18258.00
                        },
                        {
                            "line_id": "line_e2e_02",
                            "product_name": "Cloud Threat Defense Platform - Enterprise Tier",
                            "change_type": "modified",
                            "old_discount_percent": 5.0,
                            "new_discount_percent": 15.0,
                            "old_total": 61218.00,
                            "new_total": 54774.00,
                            "delta_total": -6444.00
                        }
                    ]
                })
            return self._send_json(200, {
                "quote_id": quote_id,
                "target_revision": {"revision_id": revision_id, "revision_number": 2},
                "base_revision": {"revision_id": "rev_001", "revision_number": 1},
                "financial_delta": {
                    "base_total": 107400.00,
                    "target_total": 99900.00,
                    "difference_amount": -7500.00,
                    "currency": "USD"
                },
                "line_item_deltas": [
                    {
                        "line_id": "line_4021",
                        "product_name": "On-Site Implementation & Training Workshop",
                        "change_type": "modified",
                        "old_quantity": 5.0,
                        "new_quantity": 3.0,
                        "old_total": 13425.00,
                        "new_total": 8055.00,
                        "delta_total": -5370.00
                    }
                ],
                "terms_deltas": [{"term_name": "Payment Terms", "old_value": "Net 30", "new_value": "Net 15"}]
            })

        # 6.13 GET /api/v1/portal/quotes/{quote_id}/revisions
        rev_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/revisions$", path)
        if rev_match:
            quote_id = rev_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            return self._send_json(200, {
                "quote_id": quote_id,
                "current_revision": 1,
                "revisions": [
                    {
                        "revision_id": "rev_001",
                        "revision_number": 1,
                        "is_current": True,
                        "created_at": "2026-09-01T08:00:00Z",
                        "summary": "Initial quote publication.",
                        "total_amount": 107400.00,
                        "currency": "USD"
                    }
                ]
            })

        # 8.1 GET /api/v1/portal/quotes/{quote_id}/lines/{line_id}/comments
        line_cmt_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/lines/([^/]+)/comments$", path)
        if line_cmt_match:
            quote_id, line_id = line_cmt_match.groups()
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            # Strictly filter visibility == 'customer'
            matching_comments = [
                c for c in MOCK_COMMENTS
                if c.get("quote_id") == quote_id
                and (c.get("line_id") == line_id or c.get("stable_line_key") == line_id)
                and c.get("visibility", "customer") == "customer"
            ]
            unread_count = sum(1 for c in matching_comments if not c.get("is_read"))
            return self._send_json(200, {
                "data": matching_comments,
                "meta": {
                    "quote_id": quote_id,
                    "line_id": line_id,
                    "unread_count": unread_count,
                    "total_comments": len(matching_comments)
                }
            })

        # 8.2 GET /api/v1/portal/quotes/{quote_id}/comments/summary
        summary_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/comments/summary$", path)
        if summary_match:
            quote_id = summary_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            customer_comments = [
                c for c in MOCK_COMMENTS
                if c.get("quote_id") == quote_id
                and c.get("visibility", "customer") == "customer"
            ]
            lines_summary = {}
            for c in customer_comments:
                lid = c.get("line_id") or "general"
                if lid not in lines_summary:
                    lines_summary[lid] = {
                        "line_id": lid,
                        "stable_line_key": c.get("stable_line_key", lid),
                        "total_comments": 0,
                        "unread_count": 0
                    }
                lines_summary[lid]["total_comments"] += 1
                if not c.get("is_read"):
                    lines_summary[lid]["unread_count"] += 1
            return self._send_json(200, {
                "quote_id": quote_id,
                "total_unread_comments": sum(1 for c in customer_comments if not c.get("is_read")),
                "lines_summary": list(lines_summary.values())
            })

        # 6.15 GET /api/v1/portal/quotes/{quote_id}/comments
        cmt_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/comments$", path)
        if cmt_match:
            quote_id = cmt_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            # Hard zero-leak filter: customer portal NEVER receives internal comments
            customer_visible_comments = [
                c for c in MOCK_COMMENTS
                if c.get("quote_id") == quote_id
                and c.get("visibility", "customer") == "customer"
            ]
            return self._send_json(200, {
                "data": customer_visible_comments,
                "meta": {
                    "pagination": {
                        "current_page": 1,
                        "per_page": 25,
                        "total_items": len(customer_visible_comments),
                        "total_pages": 1,
                        "has_next_page": False,
                        "has_prev_page": False
                    }
                }
            })

        # 6.6 GET /api/v1/portal/quotes/{quote_id}
        single_quote_match = re.match(r"^/api/v1/portal/quotes/([^/]+)$", path)
        if single_quote_match:
            quote_id = single_quote_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            return self._send_json(200, self._sanitize_quote(quote))

        # 6.18 GET /api/v1/portal/notifications
        if path == "/api/v1/portal/notifications":
            if not self._check_auth():
                return self._send_rfc7807_error(401, "UNAUTHORIZED", "Unauthorized", "Missing or invalid bearer token.")
            unread_count = sum(1 for n in MOCK_NOTIFICATIONS if not n["is_read"])
            return self._send_json(200, {
                "data": MOCK_NOTIFICATIONS,
                "meta": {
                    "unread_count": unread_count,
                    "pagination": {
                        "current_page": 1,
                        "per_page": 20,
                        "total_items": len(MOCK_NOTIFICATIONS),
                        "total_pages": 1,
                        "has_next_page": False,
                        "has_prev_page": False
                    }
                }
            })

        # E2E Order Tracking: GET /api/v1/portal/orders/{order_number}
        order_match = re.match(r"^/api/v1/portal/orders/([^/]+)$", path)
        if order_match:
            order_num = order_match.group(1)
            user = self._get_current_user()
            if not user:
                return self._send_rfc7807_error(401, "UNAUTHORIZED", "Unauthorized", "Missing or invalid bearer token.")
            order = MOCK_ORDERS.get(order_num)
            if not order:
                if order_num == "SO-2026-1184":
                    order = {
                        "order_id": "order_e2e_1184",
                        "order_number": "SO-2026-1184",
                        "quote_reference": "QUO-2026-0105",
                        "commercial_partner_id": 1205,
                        "customer_name": "Cyberdyne Defense Systems",
                        "status": "confirmed",
                        "fulfillment_status": "pending",
                        "billing_status": "to_invoice",
                        "payment_status": "unpaid",
                        "total_amount": 73032.00,
                        "currency": "USD"
                    }
                    MOCK_ORDERS[order_num] = order
                else:
                    return self._send_rfc7807_error(404, "ORDER_NOT_FOUND", "Not Found", f"Order '{order_num}' not found.")
            return self._send_json(200, order)

        # Route Not Found
        self._send_rfc7807_error(404, "ROUTE_NOT_FOUND", "Not Found", f"Route GET {path} does not exist.")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        data = self._get_json_body() or {}

        # 6.1 POST /api/v1/portal/auth/login
        if path == "/api/v1/portal/auth/login":
            if not data or not data.get("email") or not data.get("password"):
                return self._send_rfc7807_error(400, "BAD_REQUEST", "Bad Request", "Email and password are required.")
            email = data.get("email")
            # Employee Portal Bypass Guard
            if email == "internal.sales@dealflow360.com":
                return self._send_rfc7807_error(403, "EMPLOYEE_PORTAL_BYPASS", "Forbidden", "Internal employees must access DealFlow360 via administrative ERP login.")

            # Find matching user
            user = None
            for u in MOCK_USERS.values():
                if u.get("email") == email:
                    user = u
                    break
            if not user:
                user = MOCK_USER

            return self._send_json(200, {
                "access_token": user.get("token", "mock_jwt_access_token_usr_c91f0e4b81"),
                "token_type": "Bearer",
                "expires_in": 900,
                "user": {k: v for k, v in user.items() if not k.startswith("token") and not k.startswith("_")}
            })

        # Phase 3 Magic-Link Verification
        if path == "/api/v1/portal/auth/magic-verify":
            data = self._get_json_body() or {}
            token = data.get("token")
            if token == "expired_magic_token":
                return self._send_rfc7807_error(401, "LINK_EXPIRED", "Unauthorized", "The magic invitation link has expired.")
            if token == "invalid_magic_token":
                return self._send_rfc7807_error(401, "INVALID_TOKEN", "Unauthorized", "The magic link token signature is invalid.")
            return self._send_json(200, {
                "access_token": "mock_jwt_access_token_usr_c91f0e4b81",
                "token_type": "Bearer",
                "expires_in": 900,
                "user": {k: v for k, v in MOCK_USERS["usr_c91f0e4b81"].items() if not k.startswith("token")}
            })

        # 6.2 POST /api/v1/portal/auth/refresh
        if path == "/api/v1/portal/auth/refresh":
            return self._send_json(200, {
                "access_token": "mock_jwt_refreshed_token_usr_c91f0e4b81",
                "token_type": "Bearer",
                "expires_in": 900
            })

        # 6.3 POST /api/v1/portal/auth/logout
        if path == "/api/v1/portal/auth/logout":
            return self._send_json(200, {"success": True, "message": "Logged out successfully."})

        # Auth guard for remaining POST endpoints
        if not self._check_auth():
            return self._send_rfc7807_error(401, "UNAUTHORIZED", "Unauthorized", "Missing or invalid bearer token.")

        # E2E Step 1: Internal Sales Rep Quotation Creation
        if path == "/api/v1/internal/quotes":
            quote_id = data.get("quote_id") or "quo_e2e_8819"
            quote_number = data.get("quote_number") or "QUO-2026-0105"
            new_quote = {
                "quote_id": quote_id,
                "quote_number": quote_number,
                "title": data.get("title", "Enterprise Edge Defense & Threat Intelligence Platform"),
                "partner_id": data.get("partner_id", 4821),
                "commercial_partner_id": data.get("commercial_partner_id", 1205),
                "currency": data.get("currency_id", "USD"),
                "status": "draft",
                "negotiation_status": "none",
                "revision_number": 1,
                "created_at": "2026-09-05T14:14:00Z",
                "expiration_date": data.get("expiration_date", "2026-09-30T23:59:59Z"),
                "payment_term_id": data.get("payment_term_id", "net_30"),
                "pricing_summary": {
                    "subtotal": 0.00,
                    "discount_total": 0.00,
                    "tax_total": 0.00,
                    "total_amount": 0.00,
                    "one_time_total": 0.00,
                    "recurring_total": 0.00,
                    "recurring_interval": "annual"
                },
                "sales_rep": {
                    "name": "Alex Mercer",
                    "email": "alex.mercer@dealflow360.com",
                    "phone": "+1 (555) 302-8811",
                    "avatar_url": "https://cdn.dealflow360.com/team/alex.png"
                },
                "customer": {
                    "company_name": "Cyberdyne Defense Systems",
                    "contact_name": "Sarah Connor",
                    "billing_address": "800 Cyberdyne Blvd, Sunnyvale, CA",
                    "shipping_address": "800 Cyberdyne Blvd, Sunnyvale, CA"
                },
                "line_items": []
            }
            MOCK_QUOTES[quote_id] = new_quote
            return self._send_json(201, {
                "quote_id": quote_id,
                "quote_number": quote_number,
                "status": "draft",
                "negotiation_status": "none",
                "revision_number": 1,
                "commercial_partner_id": new_quote["commercial_partner_id"],
                "pricing_summary": new_quote["pricing_summary"]
            })

        # E2E Steps 2 & 3: Internal Add Deliverables Line
        internal_line_match = re.match(r"^/api/v1/internal/quotes/([^/]+)/lines$", path)
        if internal_line_match:
            quote_id = internal_line_match.group(1)
            quote = MOCK_QUOTES.get(quote_id)
            if not quote:
                return self._send_rfc7807_error(404, "QUOTE_NOT_FOUND", "Not Found", f"Quote '{quote_id}' not found.")
            qty = float(data.get("quantity", 1.0))
            price = float(data.get("unit_price", 0.0))
            subtotal = qty * price
            disc_pct = float(data.get("discount_percent", 0.0))
            disc_amt = subtotal * (disc_pct / 100.0)
            net = subtotal - disc_amt
            tax = round(net * 0.074, 2)
            total = round(net + tax, 2)
            charge_type = data.get("charge_type", "one_time")
            line_id = data.get("line_id") or f"line_e2e_{len(quote.get('line_items', [])) + 1:02d}"
            line = {
                "line_id": line_id,
                "product_id": data.get("product_id", "prod_unknown"),
                "name": data.get("name", "Deliverable Item"),
                "charge_type": charge_type,
                "recurring_interval": data.get("recurring_interval", "annual" if charge_type == "recurring" else None),
                "quantity": qty,
                "unit_price": price,
                "discount_percent": disc_pct,
                "discount_amount": disc_amt,
                "subtotal": subtotal,
                "tax_amount": tax,
                "total_amount": total,
                "uom": data.get("uom", "Units")
            }
            quote["line_items"].append(line)
            gross_subtotal = sum(l["subtotal"] for l in quote["line_items"])
            disc_total = sum(l.get("discount_amount", 0.0) for l in quote["line_items"])
            tax_total = sum(l["tax_amount"] for l in quote["line_items"])
            total_amount = sum(l["total_amount"] for l in quote["line_items"])
            one_time_total = sum(l["total_amount"] for l in quote["line_items"] if l.get("charge_type") == "one_time")
            recurring_total = sum(l["total_amount"] for l in quote["line_items"] if l.get("charge_type") == "recurring")
            quote["pricing_summary"] = {
                "subtotal": gross_subtotal,
                "discount_total": disc_total,
                "tax_total": tax_total,
                "total_amount": total_amount,
                "one_time_total": one_time_total,
                "recurring_total": recurring_total,
                "recurring_interval": "annual"
            }
            return self._send_json(201, {
                "line_id": line_id,
                "quote_id": quote_id,
                "product_id": line["product_id"],
                "charge_type": charge_type,
                "quantity": qty,
                "unit_price": price,
                "subtotal": subtotal,
                "tax_amount": tax,
                "total_amount": total
            })

        # E2E Step 5: Internal Baseline Approval
        baseline_app_match = re.match(r"^/api/v1/internal/quotes/([^/]+)/baseline-approve$", path)
        if baseline_app_match:
            quote_id = baseline_app_match.group(1)
            quote = MOCK_QUOTES.get(quote_id)
            if not quote:
                return self._send_rfc7807_error(404, "QUOTE_NOT_FOUND", "Not Found", f"Quote '{quote_id}' not found.")
            quote["status"] = "sent"
            quote["negotiation_status"] = "none"
            notif = {
                "notification_id": f"notif_e2e_{len(MOCK_NOTIFICATIONS) + 1}",
                "recipient_id": "usr_c91f0e4b81",
                "event_type": "quote_published",
                "title": "New Quotation Ready for Review",
                "message": f"Alex Mercer published Quote {quote['quote_number']} for Cyberdyne Defense Systems.",
                "quote_id": quote_id,
                "quote_number": quote["quote_number"],
                "target_route": f"/portal/quotes/{quote_id}",
                "is_read": False,
                "created_at": "2026-09-05T14:15:00Z"
            }
            MOCK_NOTIFICATIONS.insert(0, notif)
            return self._send_json(200, {
                "quote_id": quote_id,
                "quote_number": quote["quote_number"],
                "status": "sent",
                "negotiation_status": "none",
                "revision_number": quote.get("revision_number", 1),
                "published_at": "2026-09-05T14:15:00Z",
                "invitation_url": "https://portal.dealflow360.com/auth/magic?token=magic_e2e_token_sarah"
            })

        # E2E Step 16: Internal Manager Concession Approval
        mgr_app_match = re.match(r"^/api/v1/internal/quotes/([^/]+)/manager-approve$", path)
        if mgr_app_match:
            quote_id = mgr_app_match.group(1)
            quote = MOCK_QUOTES.get(quote_id)
            if not quote:
                return self._send_rfc7807_error(404, "QUOTE_NOT_FOUND", "Not Found", f"Quote '{quote_id}' not found.")
            for line in quote.get("line_items", []):
                if line.get("product_id") == "prod_hw_gateway_01":
                    line["quantity"] = 4.0
                    line["subtotal"] = 20000.00
                line["discount_percent"] = 15.0
                disc_amt = round(line["subtotal"] * 0.15, 2)
                line["discount_amount"] = disc_amt
                net = line["subtotal"] - disc_amt
                tax = round(net * 0.074, 2)
                line["tax_amount"] = tax
                line["total_amount"] = round(net + tax, 2)
            gross = sum(l["subtotal"] for l in quote["line_items"])
            disc = sum(l["discount_amount"] for l in quote["line_items"])
            tax = sum(l["tax_amount"] for l in quote["line_items"])
            tot = sum(l["total_amount"] for l in quote["line_items"])
            one_time = sum(l["total_amount"] for l in quote["line_items"] if l.get("charge_type") == "one_time")
            rec = sum(l["total_amount"] for l in quote["line_items"] if l.get("charge_type") == "recurring")
            quote["pricing_summary"] = {
                "subtotal": gross,
                "discount_total": disc,
                "tax_total": tax,
                "total_amount": tot,
                "one_time_total": one_time,
                "recurring_total": rec,
                "recurring_interval": "annual"
            }
            quote["status"] = "sent"
            quote["negotiation_status"] = "approved"
            quote["revision_number"] = 2
            return self._send_json(200, {
                "quote_id": quote_id,
                "quote_number": quote["quote_number"],
                "status": "sent",
                "negotiation_status": "approved",
                "revision_number": 2,
                "published_at": "2026-09-05T14:22:00Z",
                "pricing_summary": quote["pricing_summary"]
            })

        # E2E Step 20: Internal Order Fulfillment
        fulfill_match = re.match(r"^/api/v1/internal/orders/([^/]+)/fulfill$", path)
        if fulfill_match:
            order_num = fulfill_match.group(1)
            order = MOCK_ORDERS.get(order_num)
            if not order:
                order = {
                    "order_id": "order_e2e_1184",
                    "order_number": order_num,
                    "status": "confirmed",
                    "fulfillment_status": "pending",
                    "billing_status": "to_invoice",
                    "payment_status": "unpaid",
                    "total_amount": 73032.00
                }
                MOCK_ORDERS[order_num] = order
            order["fulfillment_status"] = "in_progress"
            return self._send_json(200, {
                "order_number": order_num,
                "fulfillment_id": "pick_e2e_881",
                "fulfillment_status": "in_progress",
                "hardware_tracking_number": data.get("tracking_reference", "FEDEX-DEF-99182"),
                "cloud_provisioning_status": "provisioned",
                "dispatched_at": "2026-09-05T14:26:00Z"
            })

        # E2E Step 21: Internal Invoice Generation
        invoice_match = re.match(r"^/api/v1/internal/orders/([^/]+)/invoice$", path)
        if invoice_match:
            order_num = invoice_match.group(1)
            order = MOCK_ORDERS.get(order_num)
            if not order:
                order = {
                    "order_id": "order_e2e_1184",
                    "order_number": order_num,
                    "status": "confirmed",
                    "fulfillment_status": "in_progress",
                    "billing_status": "to_invoice",
                    "payment_status": "unpaid",
                    "total_amount": 73032.00
                }
                MOCK_ORDERS[order_num] = order
            order["billing_status"] = "invoiced"
            inv_id = "inv_e2e_0891"
            inv = {
                "invoice_id": inv_id,
                "invoice_number": "INV-2026-0891",
                "order_number": order_num,
                "state": "posted",
                "amount_untaxed": 68000.00,
                "amount_tax": 5032.00,
                "amount_total": 73032.00,
                "amount_residual": 73032.00,
                "payment_status": "not_paid"
            }
            MOCK_INVOICES[inv_id] = inv
            MOCK_INVOICES[inv["invoice_number"]] = inv
            return self._send_json(201, inv)

        # E2E Step 22: Internal Payment Recording
        pay_match = re.match(r"^/api/v1/internal/invoices/([^/]+)/pay$", path)
        if pay_match:
            inv_id = pay_match.group(1)
            inv = MOCK_INVOICES.get(inv_id)
            if not inv:
                inv = {
                    "invoice_id": inv_id,
                    "invoice_number": "INV-2026-0891",
                    "order_number": "SO-2026-1184",
                    "amount_total": 73032.00,
                    "amount_residual": 73032.00,
                    "payment_status": "not_paid"
                }
                MOCK_INVOICES[inv_id] = inv
            amt_paid = float(data.get("amount", inv["amount_total"]))
            inv["amount_residual"] = max(0.0, inv["amount_residual"] - amt_paid)
            inv["payment_status"] = "paid" if inv["amount_residual"] == 0.0 else "partial"
            if inv.get("order_number") in MOCK_ORDERS:
                MOCK_ORDERS[inv["order_number"]]["payment_status"] = inv["payment_status"]
            return self._send_json(200, {
                "payment_id": "pay_e2e_401",
                "invoice_number": inv.get("invoice_number", "INV-2026-0891"),
                "order_number": inv.get("order_number", "SO-2026-1184"),
                "amount_paid": amt_paid,
                "amount_residual": inv["amount_residual"],
                "payment_status": inv["payment_status"],
                "reconciled": True,
                "paid_at": "2026-09-05T14:28:00Z"
            })

        # 6.8 POST /api/v1/portal/quotes/{quote_id}/accept
        accept_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/accept$", path)
        if accept_match:
            quote_id = accept_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)

            user = self._get_current_user()
            # Signatory Privilege Guard
            if not user.get("can_sign_quotes"):
                return self._send_rfc7807_error(403, "FORBIDDEN_SIGNATORY_REQUIRED", "Signatory Required", "Your account does not have legal signatory authorization.")

            data = self._get_json_body()
            if not data or not data.get("accepted_terms"):
                return self._send_rfc7807_error(400, "TERMS_NOT_ACCEPTED", "Terms Required", "Must accept contract terms.")

            quote["status"] = "approved"
            quote["state"] = "sale"
            ref_order_num = "SO-2026-1184"
            order_record = {
                "order_id": "order_e2e_1184",
                "order_number": ref_order_num,
                "quote_reference": quote.get("quote_number", "QUO-2026-0105"),
                "commercial_partner_id": quote.get("commercial_partner_id", 1205),
                "customer_name": quote.get("customer", {}).get("company_name", "Cyberdyne Defense Systems"),
                "status": "confirmed",
                "fulfillment_status": "pending",
                "billing_status": "to_invoice",
                "payment_status": "unpaid",
                "total_amount": quote.get("pricing_summary", {}).get("total_amount", 73032.00),
                "currency": quote.get("currency", "USD")
            }
            MOCK_ORDERS[ref_order_num] = order_record
            return self._send_json(200, {
                "confirmation_id": "cnf_381902",
                "quote_id": quote_id,
                "quote_number": quote["quote_number"],
                "action_type": "quote_accepted",
                "status": "approved",
                "reference_order_number": "SO-2026-1184",
                "confirmed_at": "2026-09-05T10:42:00Z",
                "signatory": {
                    "name": data.get("signer_name", user["name"]),
                    "email": user["email"],
                    "ip_address": "127.0.0.1"
                },
                "message": f"Quote {quote['quote_number']} accepted. Sales Order SO-2026-1184 created.",
                "next_steps": [
                    "An email confirmation with the counter-signed contract PDF has been dispatched.",
                    "Your dedicated onboarding engineer Alex Mercer will contact you within 1 business day."
                ],
                "contract_download_url": f"/api/v1/portal/quotes/{quote_id}/pdf?version=final_signed"
            })

        # 6.9 POST /api/v1/portal/quotes/{quote_id}/reject
        reject_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/reject$", path)
        if reject_match:
            quote_id = reject_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            data = self._get_json_body() or {}
            quote["status"] = "rejected"
            return self._send_json(200, {
                "quote_id": quote_id,
                "quote_number": quote["quote_number"],
                "status": "rejected",
                "rejected_at": "2026-09-05T10:43:00Z",
                "message": "Quote has been declined. Your feedback has been relayed to the account team."
            })

        # 6.10 POST /api/v1/portal/quotes/{quote_id}/negotiation/change-request
        cr_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/negotiation/change-request$", path)
        if cr_match:
            quote_id = cr_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            data = self._get_json_body() or {}
            quote["status"] = "in_negotiation"
            quote["negotiation_status"] = "pending_seller_review"
            return self._send_json(201, {
                "change_request_id": "cr_10928",
                "quote_id": quote_id,
                "quote_status": "in_negotiation",
                "negotiation_status": "pending_seller_review",
                "submitted_at": "2026-09-05T10:44:00Z",
                "message": "Change request submitted successfully. The sales team has been notified.",
                "line_item_changes": data.get("line_item_changes", [])
            })

        # 6.11 POST /api/v1/portal/quotes/{quote_id}/negotiation/counter-discount
        cd_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/negotiation/counter-discount$", path)
        if cd_match:
            quote_id = cd_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            data = self._get_json_body() or {}
            disc_pct = data.get("requested_discount_percent", 0.0)
            if disc_pct <= 0 or disc_pct >= 100:
                return self._send_rfc7807_error(400, "INVALID_DISCOUNT_RANGE", "Invalid Discount", "Discount percent must be between 0.1% and 99.9%.")
            quote["status"] = "in_negotiation"
            quote["negotiation_status"] = "pending_seller_review"
            return self._send_json(201, {
                "counter_discount_id": "cd_7719",
                "quote_id": quote_id,
                "quote_status": "in_negotiation",
                "negotiation_status": "pending_seller_review",
                "submitted_at": "2026-09-05T10:44:30Z",
                "requested_discount_percent": disc_pct,
                "current_quote_total": quote["pricing_summary"]["total_amount"],
                "projected_total": quote["pricing_summary"]["total_amount"] * (1 - disc_pct / 100),
                "currency": "USD",
                "status": "pending_seller_review",
                "message": "Counter-discount submitted. The account executive and deal approval desk are reviewing your request."
            })

        # 8.3 POST /api/v1/portal/quotes/{quote_id}/lines/{line_id}/comments
        post_line_cmt_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/lines/([^/]+)/comments$", path)
        if post_line_cmt_match:
            quote_id, line_id = post_line_cmt_match.groups()
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            data = self._get_json_body() or {}
            msg = (data.get("message") or "").strip()
            if not msg:
                return self._send_rfc7807_error(400, "EMPTY_COMMENT_BODY", "Invalid Message", "Message body cannot be empty.")
            user = self._get_current_user()
            new_comment = {
                "comment_id": f"cmt_{len(MOCK_COMMENTS) + 992000}",
                "quote_id": quote_id,
                "line_id": line_id,
                "stable_line_key": data.get("stable_line_key", line_id),
                "revision_number": quote.get("revision_number", 1),
                "parent_comment_id": data.get("parent_comment_id"),
                "author": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "type": "customer",
                    "avatar_url": "https://cdn.dealflow360.com/avatars/usr_c91f0e4b81.png"
                },
                "visibility": "customer",
                "message": msg,
                "created_at": "2026-09-05T13:20:00Z",
                "is_read": True,
                "attachments": data.get("attachments", [])
            }
            MOCK_COMMENTS.append(new_comment)
            return self._send_json(201, new_comment)

        # 6.16 POST /api/v1/portal/quotes/{quote_id}/comments
        post_cmt_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/comments$", path)
        if post_cmt_match:
            quote_id = post_cmt_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            data = self._get_json_body() or {}
            if not data.get("message"):
                return self._send_rfc7807_error(400, "EMPTY_MESSAGE", "Invalid Message", "Message body cannot be empty.")
            user = self._get_current_user()
            new_comment = {
                "comment_id": f"cmt_{len(MOCK_COMMENTS) + 991900}",
                "quote_id": quote_id,
                "line_id": data.get("line_id", "general"),
                "stable_line_key": data.get("stable_line_key", data.get("line_id", "general")),
                "revision_number": quote.get("revision_number", 1),
                "parent_comment_id": data.get("parent_comment_id"),
                "author": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "type": "customer",
                    "avatar_url": "https://cdn.dealflow360.com/avatars/usr_c91f0e4b81.png"
                },
                "visibility": "customer",
                "message": data.get("message"),
                "created_at": "2026-09-05T10:46:00Z",
                "is_read": True,
                "attachments": []
            }
            MOCK_COMMENTS.append(new_comment)
            return self._send_json(201, new_comment)

        # 6.17 POST /api/v1/portal/quotes/{quote_id}/attachments
        att_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/attachments$", path)
        if att_match:
            quote_id = att_match.group(1)
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            return self._send_json(201, {
                "attachment_id": "att_4410",
                "filename": "SLA_Clarification_Scope.pdf",
                "file_size_bytes": 284102,
                "mime_type": "application/pdf",
                "document_category": "specification",
                "uploaded_at": "2026-09-05T10:45:30Z",
                "download_url": f"https://api.dealflow360.com/api/v1/portal/quotes/{quote_id}/attachments/att_4410"
            })

        self._send_rfc7807_error(404, "ROUTE_NOT_FOUND", "Not Found", f"Route POST {path} does not exist.")

    def do_PATCH(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        _ = self._get_json_body()

        if not self._check_auth():
            return self._send_rfc7807_error(401, "UNAUTHORIZED", "Unauthorized", "Missing or invalid bearer token.")

        # E2E Step 4: Internal Sales Rep Initial Discount Application
        internal_disc_match = re.match(r"^/api/v1/internal/quotes/([^/]+)/discount$", path)
        if internal_disc_match:
            quote_id = internal_disc_match.group(1)
            quote = MOCK_QUOTES.get(quote_id)
            if not quote:
                return self._send_rfc7807_error(404, "QUOTE_NOT_FOUND", "Not Found", f"Quote '{quote_id}' not found.")
            data = self._get_json_body() or {}
            disc_pct = float(data.get("discount_percent", 5.0))
            for line in quote.get("line_items", []):
                line["discount_percent"] = disc_pct
                disc_amt = round(line["subtotal"] * (disc_pct / 100.0), 2)
                line["discount_amount"] = disc_amt
                net = line["subtotal"] - disc_amt
                tax = round(net * 0.074, 2)
                line["tax_amount"] = tax
                line["total_amount"] = round(net + tax, 2)
            gross = sum(l["subtotal"] for l in quote["line_items"])
            disc_total = sum(l["discount_amount"] for l in quote["line_items"])
            net_subtotal = gross - disc_total
            tax_total = sum(l["tax_amount"] for l in quote["line_items"])
            total_amount = sum(l["total_amount"] for l in quote["line_items"])
            one_time = sum(l["total_amount"] for l in quote["line_items"] if l.get("charge_type") == "one_time")
            recurring = sum(l["total_amount"] for l in quote["line_items"] if l.get("charge_type") == "recurring")
            quote["pricing_summary"] = {
                "subtotal": gross,
                "discount_total": disc_total,
                "net_subtotal": net_subtotal,
                "tax_total": tax_total,
                "total_amount": total_amount,
                "one_time_total": one_time,
                "recurring_total": recurring,
                "recurring_interval": "annual"
            }
            return self._send_json(200, {
                "quote_id": quote_id,
                "discount_total": disc_total,
                "pricing_summary": quote["pricing_summary"]
            })

        # 8.4 PATCH /api/v1/portal/quotes/{quote_id}/lines/{line_id}/comments/read
        read_line_cmt_match = re.match(r"^/api/v1/portal/quotes/([^/]+)/lines/([^/]+)/comments/read$", path)
        if read_line_cmt_match:
            quote_id, line_id = read_line_cmt_match.groups()
            quote, status_code, err_code, detail = self._check_quote_access(quote_id)
            if not quote:
                return self._send_rfc7807_error(status_code, err_code, "Not Found", detail)
            marked = 0
            for c in MOCK_COMMENTS:
                if c.get("quote_id") == quote_id and (c.get("line_id") == line_id or c.get("stable_line_key") == line_id):
                    if not c.get("is_read"):
                        c["is_read"] = True
                        marked += 1
            return self._send_json(200, {
                "success": True,
                "quote_id": quote_id,
                "line_id": line_id,
                "marked_read_count": marked,
                "read_at": "2026-09-05T13:20:00Z"
            })

        # 6.20 PATCH /api/v1/portal/notifications/read-all
        if path == "/api/v1/portal/notifications/read-all":
            for n in MOCK_NOTIFICATIONS:
                n["is_read"] = True
            return self._send_json(200, {
                "success": True,
                "marked_read_count": len(MOCK_NOTIFICATIONS),
                "updated_at": "2026-09-05T10:47:15Z"
            })

        # 6.19 PATCH /api/v1/portal/notifications/{notification_id}/read
        read_match = re.match(r"^/api/v1/portal/notifications/([^/]+)/read$", path)
        if read_match:
            notif_id = read_match.group(1)
            for n in MOCK_NOTIFICATIONS:
                if n["notification_id"] == notif_id:
                    n["is_read"] = True
                    return self._send_json(200, {
                        "notification_id": notif_id,
                        "is_read": True,
                        "read_at": "2026-09-05T10:47:00Z"
                    })
            return self._send_rfc7807_error(404, "NOTIFICATION_NOT_FOUND", "Not Found", f"Notification '{notif_id}' not found.")

        self._send_rfc7807_error(404, "ROUTE_NOT_FOUND", "Not Found", f"Route PATCH {path} does not exist.")

    def log_message(self, format, *args):
        # Suppress noisy standard HTTP access logs during test runs
        return


def run_server(port=PORT):
    server_address = (HOST, port)
    httpd = http.server.HTTPServer(server_address, PortalMockHandler)
    print(f"DealFlow360 Customer Portal Mock API running on http://{HOST}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == "__main__":
    run_server()

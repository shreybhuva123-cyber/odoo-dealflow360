-- CreateIndex: User performance indexes
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_isActive_idx" ON "users"("isActive");
CREATE INDEX IF NOT EXISTS "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex: Customer performance indexes
CREATE INDEX IF NOT EXISTS "customers_customerTier_idx" ON "customers"("customerTier");
CREATE INDEX IF NOT EXISTS "customers_isActive_idx" ON "customers"("isActive");
CREATE INDEX IF NOT EXISTS "customers_customerTier_isActive_idx" ON "customers"("customerTier", "isActive");

-- CreateIndex: Product performance indexes
CREATE INDEX IF NOT EXISTS "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS "products_sku_idx" ON "products"("sku");
CREATE INDEX IF NOT EXISTS "products_isActive_idx" ON "products"("isActive");
CREATE INDEX IF NOT EXISTS "products_categoryId_isActive_idx" ON "products"("categoryId", "isActive");

-- CreateIndex: Product variant indexes
CREATE INDEX IF NOT EXISTS "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex: Price list indexes
CREATE INDEX IF NOT EXISTS "price_lists_customerTier_idx" ON "price_lists"("customerTier");
CREATE INDEX IF NOT EXISTS "price_list_items_priceListId_idx" ON "price_list_items"("priceListId");
CREATE INDEX IF NOT EXISTS "price_list_items_productId_idx" ON "price_list_items"("productId");

-- CreateIndex: Discount rule indexes
CREATE INDEX IF NOT EXISTS "discount_rules_customerTier_idx" ON "discount_rules"("customerTier");
CREATE INDEX IF NOT EXISTS "discount_rules_categoryId_idx" ON "discount_rules"("categoryId");

-- CreateIndex: Approval chain step indexes
CREATE INDEX IF NOT EXISTS "approval_chain_steps_approvalChainId_idx" ON "approval_chain_steps"("approvalChainId");

-- CreateIndex: Quotation performance indexes
CREATE INDEX IF NOT EXISTS "quotations_customerId_idx" ON "quotations"("customerId");
CREATE INDEX IF NOT EXISTS "quotations_salesRepId_idx" ON "quotations"("salesRepId");
CREATE INDEX IF NOT EXISTS "quotations_status_idx" ON "quotations"("status");
CREATE INDEX IF NOT EXISTS "quotations_createdAt_idx" ON "quotations"("createdAt");
CREATE INDEX IF NOT EXISTS "quotations_salesRepId_status_idx" ON "quotations"("salesRepId", "status");
CREATE INDEX IF NOT EXISTS "quotations_customerId_status_idx" ON "quotations"("customerId", "status");
CREATE INDEX IF NOT EXISTS "quotations_status_createdAt_idx" ON "quotations"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "quotations_salesRepId_createdAt_idx" ON "quotations"("salesRepId", "createdAt");

-- CreateIndex: Quotation item indexes
CREATE INDEX IF NOT EXISTS "quotation_items_quotationId_idx" ON "quotation_items"("quotationId");
CREATE INDEX IF NOT EXISTS "quotation_items_productId_idx" ON "quotation_items"("productId");

-- CreateIndex: Approval indexes
CREATE INDEX IF NOT EXISTS "approvals_quotationId_idx" ON "approvals"("quotationId");
CREATE INDEX IF NOT EXISTS "approvals_approverId_idx" ON "approvals"("approverId");
CREATE INDEX IF NOT EXISTS "approvals_status_idx" ON "approvals"("status");
CREATE INDEX IF NOT EXISTS "approvals_approvalRole_idx" ON "approvals"("approvalRole");
CREATE INDEX IF NOT EXISTS "approvals_status_approvalRole_idx" ON "approvals"("status", "approvalRole");

-- CreateIndex: Approval request indexes
CREATE INDEX IF NOT EXISTS "approval_requests_quotationId_idx" ON "approval_requests"("quotationId");
CREATE INDEX IF NOT EXISTS "approval_requests_status_idx" ON "approval_requests"("status");

-- CreateIndex: Approval action indexes
CREATE INDEX IF NOT EXISTS "approval_actions_quotationId_idx" ON "approval_actions"("quotationId");
CREATE INDEX IF NOT EXISTS "approval_actions_reviewerId_idx" ON "approval_actions"("reviewerId");

-- CreateIndex: Inventory indexes
CREATE INDEX IF NOT EXISTS "inventory_warehouseId_idx" ON "inventory"("warehouseId");
CREATE INDEX IF NOT EXISTS "inventory_productId_idx" ON "inventory"("productId");

-- CreateIndex: Order performance indexes
CREATE INDEX IF NOT EXISTS "orders_customerId_idx" ON "orders"("customerId");
CREATE INDEX IF NOT EXISTS "orders_salesRepId_idx" ON "orders"("salesRepId");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX IF NOT EXISTS "orders_salesRepId_status_idx" ON "orders"("salesRepId", "status");
CREATE INDEX IF NOT EXISTS "orders_customerId_status_idx" ON "orders"("customerId", "status");
CREATE INDEX IF NOT EXISTS "orders_status_createdAt_idx" ON "orders"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "orders_salesRepId_createdAt_idx" ON "orders"("salesRepId", "createdAt");

-- CreateIndex: Order item indexes
CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX IF NOT EXISTS "order_items_productId_idx" ON "order_items"("productId");
CREATE INDEX IF NOT EXISTS "order_items_variantId_idx" ON "order_items"("variantId");

-- CreateIndex: Fulfillment indexes
CREATE INDEX IF NOT EXISTS "fulfillments_orderId_idx" ON "fulfillments"("orderId");
CREATE INDEX IF NOT EXISTS "fulfillments_status_idx" ON "fulfillments"("status");
CREATE INDEX IF NOT EXISTS "fulfillments_assignedToId_idx" ON "fulfillments"("assignedToId");
CREATE INDEX IF NOT EXISTS "fulfillments_status_assignedToId_idx" ON "fulfillments"("status", "assignedToId");

-- CreateIndex: Fulfillment split indexes
CREATE INDEX IF NOT EXISTS "fulfillment_splits_fulfillmentId_idx" ON "fulfillment_splits"("fulfillmentId");
CREATE INDEX IF NOT EXISTS "fulfillment_splits_warehouseId_idx" ON "fulfillment_splits"("warehouseId");
CREATE INDEX IF NOT EXISTS "fulfillment_splits_productId_idx" ON "fulfillment_splits"("productId");

-- CreateIndex: Backorder indexes
CREATE INDEX IF NOT EXISTS "backorders_fulfillmentSplitId_idx" ON "backorders"("fulfillmentSplitId");
CREATE INDEX IF NOT EXISTS "backorders_productId_idx" ON "backorders"("productId");

-- CreateIndex: Subscription indexes
CREATE INDEX IF NOT EXISTS "subscriptions_customerId_idx" ON "subscriptions"("customerId");
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX IF NOT EXISTS "subscriptions_nextBillingDate_idx" ON "subscriptions"("nextBillingDate");

-- CreateIndex: Billing schedule indexes
CREATE INDEX IF NOT EXISTS "billing_schedules_subscriptionId_idx" ON "billing_schedules"("subscriptionId");
CREATE INDEX IF NOT EXISTS "billing_schedules_billingDate_idx" ON "billing_schedules"("billingDate");

-- CreateIndex: Invoice performance indexes
CREATE INDEX IF NOT EXISTS "invoices_customerId_idx" ON "invoices"("customerId");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices"("status");
CREATE INDEX IF NOT EXISTS "invoices_dueDate_idx" ON "invoices"("dueDate");
CREATE INDEX IF NOT EXISTS "invoices_customerId_status_idx" ON "invoices"("customerId", "status");
CREATE INDEX IF NOT EXISTS "invoices_status_dueDate_idx" ON "invoices"("status", "dueDate");
CREATE INDEX IF NOT EXISTS "invoices_status_createdAt_idx" ON "invoices"("status", "createdAt");

-- CreateIndex: Invoice item indexes
CREATE INDEX IF NOT EXISTS "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");
CREATE INDEX IF NOT EXISTS "invoice_items_productId_idx" ON "invoice_items"("productId");
CREATE INDEX IF NOT EXISTS "invoice_items_variantId_idx" ON "invoice_items"("variantId");

-- CreateIndex: Payment indexes
CREATE INDEX IF NOT EXISTS "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex: Negotiation indexes
CREATE INDEX IF NOT EXISTS "negotiations_quotationId_idx" ON "negotiations"("quotationId");
CREATE INDEX IF NOT EXISTS "negotiations_customerId_idx" ON "negotiations"("customerId");
CREATE INDEX IF NOT EXISTS "negotiation_messages_negotiationId_idx" ON "negotiation_messages"("negotiationId");

-- CreateIndex: Upsell/cross-sell indexes
CREATE INDEX IF NOT EXISTS "upsell_cross_sell_rules_productId_idx" ON "upsell_cross_sell_rules"("productId");
CREATE INDEX IF NOT EXISTS "upsell_cross_sell_rules_recommendedProductId_idx" ON "upsell_cross_sell_rules"("recommendedProductId");

-- CreateIndex: Deal health indexes
CREATE INDEX IF NOT EXISTS "deal_health_healthStatus_idx" ON "deal_health"("healthStatus");

-- CreateIndex: Audit log performance indexes
CREATE INDEX IF NOT EXISTS "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX IF NOT EXISTS "audit_logs_entityType_entityId_createdAt_idx" ON "audit_logs"("entityType", "entityId", "createdAt");

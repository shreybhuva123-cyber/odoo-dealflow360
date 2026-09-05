import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useFulfillment,
  useUpdateFulfillmentStatus,
} from '@/hooks/useFulfillment';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useAuthStore } from '@/stores/auth.store';
import {
  FulfillmentStatusBadge,
  FulfillmentPriorityBadge,
  FulfillmentProgress,
  FulfillmentItemsTable,
  ShipmentStatus,
  FulfillmentTimeline,
  WarehouseAllocation,
  FulfillmentDetailSkeleton,
} from './components';
import { FulfillmentItem, FulfillmentStatus } from '@/types';
import { ROUTES } from '@/constants/routes';
import { useInvoices, useCreateInvoice } from '@/hooks/useInvoices';
import { showToast } from '@/stores/toast.store';

export function FulfillmentDetailPage() {
  const { fulfillmentId } = useParams<{ fulfillmentId: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  const isOpsOrAdmin =
    role === 'ADMIN' ||
    role === 'WAREHOUSE_OPS' ||
    role === 'FINANCE' ||
    role === 'SALES_MANAGER';

  const { data: order, isLoading } = useFulfillment(fulfillmentId);
  const { data: warehouses = [] } = useWarehouses();
  const updateStatusMutation = useUpdateFulfillmentStatus();

  const { data: invoices = [] } = useInvoices();
  const createInvoiceMutation = useCreateInvoice();

  const [activeAllocatingItem, setActiveAllocatingItem] = useState<FulfillmentItem | null>(null);

  const linkedInvoice = invoices.find(
    (inv) =>
      inv.fulfillmentId === order?.id ||
      (order?.quotationId && inv.quotationId === order.quotationId)
  );

  const handleGenerateInvoice = async () => {
    if (!order) return;
    try {
      const items = (order.items || []).map((it) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        quantity: it.requiredQuantity || 1,
        unitPrice: 12000,
      }));

      const newInvoice = await createInvoiceMutation.mutateAsync({
        quotationId: order.quotationId,
        quotationNumber: order.quotationNumber,
        dealId: order.dealId,
        dealName: order.dealName,
        fulfillmentId: order.id,
        fulfillmentNumber: order.id,
        customerId: 'cust_' + order.customerName.toLowerCase().replace(/\s+/g, '_'),
        customerName: order.customerName,
        customerEmail: `billing@${order.customerName.toLowerCase().replace(/\s+/g, '')}.com`,
        items,
        paymentTerms: 'Net 30',
      });

      showToast(`Invoice ${newInvoice.invoiceNumber} created from fulfillment order!`, 'green');
      navigate(ROUTES.APP.INVOICE_DETAIL(newInvoice.id));
    } catch {
      showToast('Failed to generate invoice', 'red');
    }
  };

  if (isLoading) {
    return <FulfillmentDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="p-12 max-w-lg mx-auto text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-base font-bold text-foreground">Fulfillment Record Not Found</h2>
        <p className="text-xs text-muted-foreground">
          Could not locate fulfillment record "{fulfillmentId}". It may have been archived or
          removed.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.APP.FULFILLMENT)}
          className="btn btn-primary btn-sm text-xs"
        >
          ← Return to Fulfillment
        </button>
      </div>
    );
  }

  const handleStatusTransition = (nextStatus: FulfillmentStatus) => {
    updateStatusMutation.mutate({
      id: order.id,
      status: nextStatus,
      authorName: role?.replace('_', ' ') || 'Logistics Operator',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.APP.FULFILLMENT)}
            className="btn btn-ghost btn-sm text-xs"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-foreground">{order.id}</h1>
              <FulfillmentStatusBadge status={order.status} size="sm" />
              <FulfillmentPriorityBadge priority={order.priority} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Client:{' '}
              <strong className="text-foreground">{order.customerName}</strong> · Primary Hub:{' '}
              {order.primaryWarehouseName || 'Multi-Hub Dispatch'}
            </p>
          </div>
        </div>

        {/* Operational Transitions */}
        {isOpsOrAdmin && (
          <div className="flex items-center gap-2">
            {order.status === 'allocated' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('processing')}
                disabled={updateStatusMutation.isPending}
                className="btn btn-warning btn-sm text-xs font-semibold"
              >
                ⚙️ Begin Processing
              </button>
            )}

            {order.status === 'processing' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('ready')}
                disabled={updateStatusMutation.isPending}
                className="btn btn-sm text-xs font-semibold"
                style={{
                  background: 'rgba(99, 102, 241, 0.25)',
                  color: '#818CF8',
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                }}
              >
                📦 Mark Ready to Ship
              </button>
            )}

            {order.status === 'ready' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('shipped')}
                disabled={updateStatusMutation.isPending}
                className="btn btn-success btn-sm text-xs font-semibold"
              >
                🚚 Dispatch Carrier
              </button>
            )}

            {order.status === 'shipped' && (
              <button
                type="button"
                onClick={() => handleStatusTransition('completed')}
                disabled={updateStatusMutation.isPending}
                className="btn btn-success btn-sm text-xs font-semibold"
              >
                ✓ Confirm Delivery
              </button>
            )}

            {/* Commercial Billing Connection */}
            {linkedInvoice ? (
              <button
                type="button"
                onClick={() => navigate(ROUTES.APP.INVOICE_DETAIL(linkedInvoice.id))}
                className="btn btn-sm text-xs font-semibold"
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#60A5FA',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                }}
              >
                🧾 View Invoice ({linkedInvoice.invoiceNumber})
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerateInvoice}
                disabled={createInvoiceMutation.isPending}
                className="btn btn-sm text-xs font-semibold"
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                🧾 Generate Invoice
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cross-Reference Context Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Deal Info */}
        <div className="card p-3" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">
            Deal Opportunity
          </div>
          <div className="font-semibold text-xs text-foreground mt-1 truncate">
            {order.dealName || 'Enterprise Deal'}
          </div>
          {order.dealId && (
            <Link
              to={ROUTES.APP.PIPELINE_DETAIL(order.dealId)}
              className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              Open Pipeline Deal ↗
            </Link>
          )}
        </div>

        {/* Quotation Info */}
        <div className="card p-3" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">
            Approved Quotation
          </div>
          <div className="font-semibold text-xs text-foreground mt-1 font-mono">
            {order.quotationNumber || order.quotationId}
          </div>
          {order.quotationId && (
            <Link
              to={ROUTES.APP.QUOTATION_DETAIL(order.quotationId)}
              className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              Inspect Quote Builder ↗
            </Link>
          )}
        </div>

        {/* Commercial Invoice */}
        <div className="card p-3" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">
            Invoice & Billing
          </div>
          <div className="font-semibold text-xs text-foreground mt-1 font-mono">
            {linkedInvoice ? linkedInvoice.invoiceNumber : 'Pending Invoice'}
          </div>
          {linkedInvoice ? (
            <Link
              to={ROUTES.APP.INVOICE_DETAIL(linkedInvoice.id)}
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-0.5 font-medium"
            >
              View Invoice ({linkedInvoice.status}) ↗
            </Link>
          ) : (
            <button
              onClick={handleGenerateInvoice}
              className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5 text-left font-medium"
            >
              + Create Invoice ↗
            </button>
          )}
        </div>

        {/* Shipping Destination */}
        <div className="card p-3" style={{ background: 'var(--surface)' }}>
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">
            Destination Address
          </div>
          <div className="text-xs text-foreground mt-1 truncate">
            {order.shippingAddress
              ? `${order.shippingAddress.street}, ${order.shippingAddress.city}`
              : 'Corporate HQ, Electronic City'}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {order.shippingAddress?.country || 'India'}
          </div>
        </div>
      </div>

      {/* Fulfillment Progress Stepper */}
      <FulfillmentProgress status={order.status} />

      {/* Active Allocation Drawer / Modal */}
      {activeAllocatingItem && (
        <div
          className="card p-4 animate-scale-in"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--accent)',
            boxShadow: '0 8px 30px rgba(59, 130, 246, 0.2)',
          }}
        >
          <WarehouseAllocation
            fulfillmentId={order.id}
            item={activeAllocatingItem}
            warehouses={warehouses}
            onClose={() => setActiveAllocatingItem(null)}
          />
        </div>
      )}

      {/* Product Items Table */}
      <FulfillmentItemsTable
        items={order.items || []}
        userRole={role}
        onOpenAllocate={(item) => setActiveAllocatingItem(item)}
      />

      {/* Freight & Carrier Tracking */}
      <ShipmentStatus shipment={order.shipment} orderId={order.id} />

      {/* Immutable Audit Log */}
      <FulfillmentTimeline
        activities={order.activities}
        onAddNote={(note) => {
          updateStatusMutation.mutate({
            id: order.id,
            status: order.status,
            authorName: role?.replace('_', ' ') || 'Alex Morgan',
            note,
          });
        }}
      />
    </div>
  );
}

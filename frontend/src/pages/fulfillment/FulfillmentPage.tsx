import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFulfillments,
  useFulfillmentStats,
  useUpdateFulfillmentStatus,
} from '@/hooks/useFulfillment';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useAuthStore } from '@/stores/auth.store';
import {
  FulfillmentStats,
  FulfillmentFilters,
  FulfillmentTable,
  FulfillmentStatsSkeleton,
  FulfillmentTableSkeleton,
  FulfillmentEmptyState,
  NewFulfillmentDialog,
} from './components';
import { Fulfillment, FulfillmentStatus } from '@/types';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';

export function FulfillmentPage() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [warehouseId, setWarehouseId] = useState('all');
  const [priority, setPriority] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  const { data: stats, isLoading: isStatsLoading } = useFulfillmentStats();
  const { data: warehouses = [] } = useWarehouses();
  const {
    data: fulfillments = [],
    isLoading: isOrdersLoading,
    refetch,
  } = useFulfillments({
    search,
    status,
    warehouseId,
    priority,
    dateRange,
  });

  const updateStatusMutation = useUpdateFulfillmentStatus();

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setWarehouseId('all');
    setPriority('all');
    setDateRange('all');
  };

  const handleUpdateStatus = (order: Fulfillment, newStatus: FulfillmentStatus) => {
    updateStatusMutation.mutate({
      id: order.id,
      status: newStatus,
      authorName: role?.replace('_', ' ') || 'Warehouse Team',
    });
  };

  const handleAllocate = (order: Fulfillment) => {
    navigate(ROUTES.APP.FULFILLMENT_DETAIL(order.id));
  };

  const hasFilters =
    search.trim() !== '' ||
    status !== 'all' ||
    warehouseId !== 'all' ||
    priority !== 'all' ||
    dateRange !== 'all';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Fulfillment & Operations Hub</h1>
          <p className="text-xs text-muted-foreground">
            Multi-warehouse stock allocation, delivery fulfillment, and freight shipment tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm text-xs"
            onClick={() => {
              refetch();
              showToast('Refreshed fulfillment orders', 'blue');
            }}
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm text-xs"
            onClick={() => setIsNewDialogOpen(true)}
          >
            + Create Fulfillment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {isStatsLoading ? (
        <FulfillmentStatsSkeleton />
      ) : (
        <FulfillmentStats
          stats={stats}
          activeStatus={status}
          onFilterStatus={(s) => setStatus(s)}
        />
      )}

      {/* Filter Toolbar */}
      <FulfillmentFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        warehouseId={warehouseId}
        onWarehouseChange={setWarehouseId}
        priority={priority}
        onPriorityChange={setPriority}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        warehouses={warehouses}
        onReset={handleResetFilters}
      />

      {/* Orders Table */}
      {isOrdersLoading ? (
        <FulfillmentTableSkeleton />
      ) : fulfillments.length === 0 ? (
        <FulfillmentEmptyState
          isFiltered={hasFilters}
          onResetFilters={handleResetFilters}
          onCreateOrder={() => setIsNewDialogOpen(true)}
        />
      ) : (
        <FulfillmentTable
          fulfillments={fulfillments}
          userRole={role}
          onAllocate={handleAllocate}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* New Fulfillment Modal */}
      <NewFulfillmentDialog
        isOpen={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
      />
    </div>
  );
}

import React from 'react';
import { ShipmentInfo } from '@/types';
import { showToast } from '@/stores/toast.store';

interface ShipmentStatusProps {
  shipment?: ShipmentInfo;
  orderId: string;
  className?: string;
}

export function ShipmentStatus({
  shipment,
  orderId,
  className = '',
}: ShipmentStatusProps) {
  if (!shipment) {
    return (
      <div
        className={`card p-4 text-center ${className}`}
        style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}
      >
        <div className="text-xl mb-1">📦</div>
        <div className="text-xs font-semibold text-foreground">Shipment Not Yet Manifested</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          Tracking telemetry will generate once goods are packed and allocated to outbound dispatch.
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (shipment.status) {
      case 'delivered':
        return <span className="badge badge-green">Delivered</span>;
      case 'out_for_delivery':
        return <span className="badge badge-amber">Out for Delivery</span>;
      case 'in_transit':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--cyan, #06b6d4)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            In Transit
          </span>
        );
      default:
        return <span className="badge badge-blue">Pending Carrier Pickup</span>;
    }
  };

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText(shipment.trackingNumber);
    showToast(`Copied tracking number: ${shipment.trackingNumber}`, 'blue');
  };

  return (
    <div
      className={`card p-4 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '18px' }}>🚚</span>
          <div>
            <h3 className="text-xs font-bold text-foreground">Shipment & Freight Telemetry</h3>
            <p className="text-[10px] text-muted-foreground">Carrier integration via EDI / API</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {/* Carrier */}
        <div className="card p-2.5" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase">Carrier</div>
          <div className="text-xs font-bold text-foreground mt-0.5">{shipment.carrier}</div>
        </div>

        {/* Tracking Number */}
        <div className="card p-2.5" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase">Tracking #</div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs font-mono font-bold text-accent truncate">
              {shipment.trackingNumber}
            </span>
            <button
              type="button"
              onClick={handleCopyTracking}
              className="text-[10px] text-muted-foreground hover:text-foreground ml-1"
              title="Copy tracking"
            >
              📋
            </button>
          </div>
        </div>

        {/* Shipped Date */}
        <div className="card p-2.5" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase">Shipped Date</div>
          <div className="text-xs font-mono text-foreground mt-0.5">
            {shipment.shippingDate || 'Scheduled'}
          </div>
        </div>

        {/* Expected Delivery */}
        <div className="card p-2.5" style={{ background: 'var(--surface2)' }}>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase">Estimated Arrival</div>
          <div className="text-xs font-mono font-bold text-green-400 mt-0.5">
            {shipment.expectedDelivery || 'TBD'}
          </div>
        </div>
      </div>

      {shipment.currentLocation && (
        <div
          className="flex items-center gap-2 p-2 rounded text-xs"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <span className="text-sm">📍</span>
          <div className="flex-1 text-[11px] text-foreground">
            <span className="text-muted-foreground">Current Hub Checkpoint: </span>
            <strong className="font-semibold">{shipment.currentLocation}</strong>
          </div>
          <button
            type="button"
            onClick={() =>
              showToast(`Synchronized real-time GPS telemetry for ${shipment.trackingNumber}`, 'blue')
            }
            className="btn btn-ghost btn-xs text-[10px]"
          >
            ↻ Live Ping
          </button>
        </div>
      )}
    </div>
  );
}

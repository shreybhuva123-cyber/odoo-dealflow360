import React, { useState } from 'react';
import { useCreateFulfillment } from '@/hooks/useFulfillment';

interface NewFulfillmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewFulfillmentDialog({ isOpen, onClose }: NewFulfillmentDialogProps) {
  const createMutation = useCreateFulfillment();

  const [customerName, setCustomerName] = useState('Acme Corporation');
  const [dealName, setDealName] = useState('Enterprise Hardware Rollout');
  const [quoteNumber, setQuoteNumber] = useState('Q-1045');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'critical'>('high');
  const [selectedProduct, setSelectedProduct] = useState('prod_laptop_pro');
  const [quantity, setQuantity] = useState(10);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productMap: Record<string, { name: string; sku: string }> = {
      prod_laptop_pro: { name: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)', sku: 'LP-100' },
      prod_display_4k: { name: 'UltraDisplay 27" 4K HDR Color-Calibrated Monitor', sku: 'MN-24' },
      prod_1: { name: 'DealFlow Enterprise Edge AI Appliance X1', sku: 'DF-EDGE-X1' },
      prod_keyboard_mech: { name: 'Tactile Silent Mechanical Keyboard (Hot-Swap)', sku: 'KB-10' },
    };

    const chosen = productMap[selectedProduct] || {
      name: 'ThinkStation Pro Laptop X1',
      sku: 'LP-100',
    };

    createMutation.mutate(
      {
        quotationId: `quote_${Date.now()}`,
        quotationNumber: quoteNumber,
        dealId: `deal_${Date.now()}`,
        dealName,
        customerId: `cust_${Date.now()}`,
        customerName,
        priority,
        items: [
          {
            productId: selectedProduct,
            productName: chosen.name,
            sku: chosen.sku,
            quantity: Number(quantity) || 1,
          },
        ],
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card w-full max-w-md p-6 animate-scale-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '18px' }}>➕</span>
            <h3 className="text-base font-bold text-foreground">Create Fulfillment Order</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-muted-foreground mb-1 font-semibold">Customer Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input w-full text-xs p-2 rounded"
              style={{ background: 'var(--surface2)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1 font-semibold">
                Deal Reference
              </label>
              <input
                type="text"
                required
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                className="input w-full text-xs p-2 rounded"
                style={{ background: 'var(--surface2)' }}
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1 font-semibold">
                Quote Identifier
              </label>
              <input
                type="text"
                required
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                className="input w-full text-xs p-2 rounded"
                style={{ background: 'var(--surface2)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1 font-semibold">Product SKU</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="select w-full text-xs p-2 rounded"
                style={{ background: 'var(--surface2)' }}
              >
                <option value="prod_laptop_pro">ThinkStation Laptop Pro (LP-100)</option>
                <option value="prod_display_4k">UltraDisplay 27" 4K (MN-24)</option>
                <option value="prod_1">Edge AI Appliance X1 (DF-EDGE-X1)</option>
                <option value="prod_keyboard_mech">Tactile Keyboard (KB-10)</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1 font-semibold">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input w-full text-xs p-2 rounded"
                style={{ background: 'var(--surface2)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1 font-semibold">
              Dispatch Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="select w-full text-xs p-2 rounded"
              style={{ background: 'var(--surface2)' }}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="btn btn-ghost btn-sm text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary btn-sm text-xs"
            >
              {createMutation.isPending ? 'Creating...' : 'Initialize Fulfillment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

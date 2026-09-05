export type FulfillmentStatus =
  | 'pending'
  | 'allocated'
  | 'processing'
  | 'ready'
  | 'shipped'
  | 'partially_delivered'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type FulfillmentPriority = 'low' | 'normal' | 'high' | 'critical';

export type ItemStockStatus =
  | 'available'
  | 'partially_available'
  | 'out_of_stock'
  | 'allocated'
  | 'backordered';

export interface WarehouseItemAllocation {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}

export interface FulfillmentItem {
  id: string;
  fulfillmentId: string;
  productId: string;
  productName: string;
  sku: string;
  requiredQuantity: number;
  allocatedQuantity: number;
  availableQuantity: number;
  remainingQuantity: number;
  status: ItemStockStatus;
  allocations: WarehouseItemAllocation[];
}

export interface ShipmentInfo {
  carrier: string;
  carrierLogo?: string;
  trackingNumber: string;
  shippingDate?: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered';
  currentLocation?: string;
}

export interface FulfillmentActivity {
  id: string;
  fulfillmentId: string;
  action: string;
  user: string;
  timestamp: string;
  status?: FulfillmentStatus;
  note?: string;
}

export interface Fulfillment {
  id: string;
  quotationId: string;
  quotationNumber?: string;
  dealId: string;
  dealName?: string;
  customerId: string;
  customerName: string;
  status: FulfillmentStatus;
  priority: FulfillmentPriority;
  totalItems: number;
  allocatedItems: number;
  primaryWarehouseId?: string;
  primaryWarehouseName?: string;
  createdAt: string;
  updatedAt: string;
  shipment?: ShipmentInfo;
  items?: FulfillmentItem[];
  activities?: FulfillmentActivity[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface FulfillmentStats {
  pending: number;
  processing: number;
  partial: number;
  readyToShip: number;
  completed: number;
  lowStockAlerts: number;
  backordered: number;
  delayed: number;
}

export interface FulfillmentFilterOptions {
  search?: string;
  status?: string;
  warehouseId?: string;
  priority?: string;
  dateRange?: string;
}

export interface InventoryAllocationInput {
  itemId: string;
  allocations: {
    warehouseId: string;
    quantity: number;
  }[];
  note?: string;
}

export * from './warehouse.types';

export interface Stock {
  productId: string;
  warehouseId: string;
  warehouseName: string;
  onHand: number;
  reserved: number;
  available: number;
}

export interface FulfillmentAllocation {
  id: string;
  quotationId: string;
  productId: string;
  productName: string;
  requestedQty: number;
  allocatedQty: number;
  warehouseId: string;
  warehouseName: string;
  status: 'PENDING' | 'RESERVED' | 'PICKED' | 'SHIPPED' | 'DELIVERED';
  backorderRequired: boolean;
  backorderQty: number;
  estimatedDeliveryDate: string;
}

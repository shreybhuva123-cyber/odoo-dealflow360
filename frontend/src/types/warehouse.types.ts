export type ReorderStatus = 'normal' | 'low' | 'out_of_stock';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  city: string;
  country: string;
  isPrimary: boolean;
  transitDaysToCustomer: number;
  capacityPercentage: number;
  totalProducts: number;
  lowStockCount: number;
  activeFulfillments: number;
  managerName?: string;
  phone?: string;
  address?: string;
}

export interface WarehouseInventoryItem {
  id: string;
  warehouseId: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  available: number;
  reserved: number;
  reorderStatus: ReorderStatus;
  minStockThreshold: number;
  unitPrice?: number;
  lastRestockedAt?: string;
}

export interface WarehouseStats {
  totalWarehouses: number;
  totalProducts: number;
  avgCapacityPercentage: number;
  totalLowStockItems: number;
  totalActiveFulfillments: number;
}

export interface WarehouseFilterOptions {
  search?: string;
  category?: string;
  stockStatus?: 'all' | 'low_stock' | 'out_of_stock' | 'normal';
}

export interface ProductStockAvailability {
  productId: string;
  productName: string;
  sku: string;
  totalAvailable: number;
  totalReserved: number;
  warehouses: {
    warehouseId: string;
    warehouseName: string;
    available: number;
    reserved: number;
    transitDays: number;
  }[];
}

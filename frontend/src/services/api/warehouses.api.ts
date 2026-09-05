import {
  Warehouse,
  WarehouseInventoryItem,
  WarehouseStats,
  WarehouseFilterOptions,
  ProductStockAvailability,
} from '@/types';

const WAREHOUSE_STORAGE_KEY = 'dealflow_warehouses_v2';
const INVENTORY_STORAGE_KEY = 'dealflow_warehouse_inventory_v2';

export const DEFAULT_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-mumbai',
    code: 'WH-BOM-01',
    name: 'Mumbai Central Logistics Hub',
    location: 'Bhiwandi Logistics Park, Mumbai, Maharashtra',
    city: 'Mumbai',
    country: 'India',
    isPrimary: true,
    transitDaysToCustomer: 1,
    capacityPercentage: 82,
    totalProducts: 1248,
    lowStockCount: 12,
    activeFulfillments: 18,
    managerName: 'Vikram Malhotra',
    phone: '+91 22 4912 8800',
    address: 'Bldg 4, Sector 7, Bhiwandi Multi-Modal Hub, Mumbai 421302',
  },
  {
    id: 'wh-delhi',
    code: 'WH-DEL-02',
    name: 'Delhi NCR Distribution Center',
    location: 'Pataudi Road Industrial Area, Gurugram, Haryana',
    city: 'Delhi NCR',
    country: 'India',
    isPrimary: false,
    transitDaysToCustomer: 2,
    capacityPercentage: 64,
    totalProducts: 940,
    lowStockCount: 6,
    activeFulfillments: 11,
    managerName: 'Ananya Roy',
    phone: '+91 124 670 1200',
    address: 'Plot 18, Sector 10A, Pataudi Industrial Zone, Gurugram 122001',
  },
  {
    id: 'wh-bangalore',
    code: 'WH-BLR-03',
    name: 'Bangalore Tech Cargo Hub',
    location: 'Hosakote Industrial Corridor, Bengaluru, Karnataka',
    city: 'Bengaluru',
    country: 'India',
    isPrimary: false,
    transitDaysToCustomer: 2,
    capacityPercentage: 75,
    totalProducts: 1120,
    lowStockCount: 9,
    activeFulfillments: 14,
    managerName: 'Suresh Nair',
    phone: '+91 80 4320 9900',
    address: 'Survey 42/3, KIADB Tech Logistics Center, Hosakote, Bengaluru 562114',
  },
  {
    id: 'wh-pune',
    code: 'WH-PNQ-04',
    name: 'Pune Regional Fulfillment Node',
    location: 'Chakan Auto Corridor, Pune, Maharashtra',
    city: 'Pune',
    country: 'India',
    isPrimary: false,
    transitDaysToCustomer: 2,
    capacityPercentage: 48,
    totalProducts: 620,
    lowStockCount: 3,
    activeFulfillments: 5,
    managerName: 'Pooja Deshmukh',
    phone: '+91 20 6189 4400',
    address: 'Phase 2 MIDC, Chakan Industrial Area, Pune 410501',
  },
  {
    id: 'wh-chennai',
    code: 'WH-MAA-05',
    name: 'Chennai Ocean Port Depot',
    location: 'Sriperumbudur Logistics Zone, Chennai, Tamil Nadu',
    city: 'Chennai',
    country: 'India',
    isPrimary: false,
    transitDaysToCustomer: 3,
    capacityPercentage: 91,
    totalProducts: 1450,
    lowStockCount: 15,
    activeFulfillments: 22,
    managerName: 'K. Ramanathan',
    phone: '+91 44 2811 5000',
    address: 'SIPCOT Industrial Park, Sriperumbudur, Chennai 602105',
  },
];

export const DEFAULT_INVENTORY_ITEMS: WarehouseInventoryItem[] = [
  // Mumbai
  {
    id: 'inv-bom-101',
    warehouseId: 'wh-mumbai',
    productId: 'prod_1',
    productName: 'DealFlow Enterprise Edge AI Appliance X1',
    sku: 'DF-EDGE-X1',
    category: 'Hardware',
    available: 30,
    reserved: 12,
    reorderStatus: 'normal',
    minStockThreshold: 10,
    unitPrice: 12500,
    lastRestockedAt: '2026-08-28',
  },
  {
    id: 'inv-bom-102',
    warehouseId: 'wh-mumbai',
    productId: 'prod_2',
    productName: 'DealFlow Cloud Platform Core (Annual)',
    sku: 'DF-SAAS-CORE',
    category: 'Software',
    available: 999,
    reserved: 0,
    reorderStatus: 'normal',
    minStockThreshold: 0,
    unitPrice: 24000,
    lastRestockedAt: '2026-09-01',
  },
  {
    id: 'inv-bom-103',
    warehouseId: 'wh-mumbai',
    productId: 'prod_laptop_pro',
    productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
    sku: 'LP-100',
    category: 'Computing',
    available: 35,
    reserved: 15,
    reorderStatus: 'normal',
    minStockThreshold: 20,
    unitPrice: 1850,
    lastRestockedAt: '2026-09-01',
  },
  {
    id: 'inv-bom-104',
    warehouseId: 'wh-mumbai',
    productId: 'prod_display_4k',
    productName: 'UltraDisplay 27" 4K HDR Color-Calibrated Monitor',
    sku: 'MN-24',
    category: 'Displays',
    available: 8,
    reserved: 12,
    reorderStatus: 'low',
    minStockThreshold: 15,
    unitPrice: 650,
    lastRestockedAt: '2026-08-15',
  },
  {
    id: 'inv-bom-105',
    warehouseId: 'wh-mumbai',
    productId: 'prod_keyboard_mech',
    productName: 'Tactile Silent Mechanical Keyboard (Hot-Swap)',
    sku: 'KB-10',
    category: 'Accessories',
    available: 0,
    reserved: 5,
    reorderStatus: 'out_of_stock',
    minStockThreshold: 25,
    unitPrice: 120,
    lastRestockedAt: '2026-08-01',
  },
  {
    id: 'inv-bom-106',
    warehouseId: 'wh-mumbai',
    productId: 'prod_dock_thunderbolt',
    productName: 'Thunderbolt 4 Quad-Display Workstation Dock',
    sku: 'DK-400',
    category: 'Accessories',
    available: 45,
    reserved: 8,
    reorderStatus: 'normal',
    minStockThreshold: 15,
    unitPrice: 280,
    lastRestockedAt: '2026-09-02',
  },

  // Delhi
  {
    id: 'inv-del-201',
    warehouseId: 'wh-delhi',
    productId: 'prod_1',
    productName: 'DealFlow Enterprise Edge AI Appliance X1',
    sku: 'DF-EDGE-X1',
    category: 'Hardware',
    available: 15,
    reserved: 5,
    reorderStatus: 'normal',
    minStockThreshold: 8,
    unitPrice: 12500,
    lastRestockedAt: '2026-08-25',
  },
  {
    id: 'inv-del-202',
    warehouseId: 'wh-delhi',
    productId: 'prod_laptop_pro',
    productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
    sku: 'LP-100',
    category: 'Computing',
    available: 25,
    reserved: 5,
    reorderStatus: 'normal',
    minStockThreshold: 15,
    unitPrice: 1850,
    lastRestockedAt: '2026-08-30',
  },
  {
    id: 'inv-del-203',
    warehouseId: 'wh-delhi',
    productId: 'prod_display_4k',
    productName: 'UltraDisplay 27" 4K HDR Color-Calibrated Monitor',
    sku: 'MN-24',
    category: 'Displays',
    available: 18,
    reserved: 4,
    reorderStatus: 'normal',
    minStockThreshold: 10,
    unitPrice: 650,
    lastRestockedAt: '2026-08-29',
  },
  {
    id: 'inv-del-204',
    warehouseId: 'wh-delhi',
    productId: 'prod_keyboard_mech',
    productName: 'Tactile Silent Mechanical Keyboard (Hot-Swap)',
    sku: 'KB-10',
    category: 'Accessories',
    available: 14,
    reserved: 2,
    reorderStatus: 'normal',
    minStockThreshold: 10,
    unitPrice: 120,
    lastRestockedAt: '2026-09-03',
  },

  // Bangalore
  {
    id: 'inv-blr-301',
    warehouseId: 'wh-bangalore',
    productId: 'prod_laptop_pro',
    productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
    sku: 'LP-100',
    category: 'Computing',
    available: 10,
    reserved: 8,
    reorderStatus: 'low',
    minStockThreshold: 12,
    unitPrice: 1850,
    lastRestockedAt: '2026-08-20',
  },
  {
    id: 'inv-blr-302',
    warehouseId: 'wh-bangalore',
    productId: 'prod_1',
    productName: 'DealFlow Enterprise Edge AI Appliance X1',
    sku: 'DF-EDGE-X1',
    category: 'Hardware',
    available: 8,
    reserved: 2,
    reorderStatus: 'normal',
    minStockThreshold: 5,
    unitPrice: 12500,
    lastRestockedAt: '2026-08-27',
  },
  {
    id: 'inv-blr-303',
    warehouseId: 'wh-bangalore',
    productId: 'prod_dock_thunderbolt',
    productName: 'Thunderbolt 4 Quad-Display Workstation Dock',
    sku: 'DK-400',
    category: 'Accessories',
    available: 6,
    reserved: 10,
    reorderStatus: 'low',
    minStockThreshold: 15,
    unitPrice: 280,
    lastRestockedAt: '2026-08-18',
  },

  // Pune
  {
    id: 'inv-pnq-401',
    warehouseId: 'wh-pune',
    productId: 'prod_laptop_pro',
    productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
    sku: 'LP-100',
    category: 'Computing',
    available: 8,
    reserved: 2,
    reorderStatus: 'normal',
    minStockThreshold: 6,
    unitPrice: 1850,
    lastRestockedAt: '2026-08-29',
  },
  {
    id: 'inv-pnq-402',
    warehouseId: 'wh-pune',
    productId: 'prod_display_4k',
    productName: 'UltraDisplay 27" 4K HDR Color-Calibrated Monitor',
    sku: 'MN-24',
    category: 'Displays',
    available: 5,
    reserved: 1,
    reorderStatus: 'normal',
    minStockThreshold: 4,
    unitPrice: 650,
    lastRestockedAt: '2026-08-30',
  },

  // Chennai
  {
    id: 'inv-maa-501',
    warehouseId: 'wh-chennai',
    productId: 'prod_laptop_pro',
    productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
    sku: 'LP-100',
    category: 'Computing',
    available: 12,
    reserved: 4,
    reorderStatus: 'normal',
    minStockThreshold: 10,
    unitPrice: 1850,
    lastRestockedAt: '2026-08-26',
  },
  {
    id: 'inv-maa-502',
    warehouseId: 'wh-chennai',
    productId: 'prod_1',
    productName: 'DealFlow Enterprise Edge AI Appliance X1',
    sku: 'DF-EDGE-X1',
    category: 'Hardware',
    available: 18,
    reserved: 6,
    reorderStatus: 'normal',
    minStockThreshold: 8,
    unitPrice: 12500,
    lastRestockedAt: '2026-08-28',
  },
];

function loadStoredWarehouses(): Warehouse[] {
  try {
    const raw = localStorage.getItem(WAREHOUSE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WAREHOUSE_STORAGE_KEY, JSON.stringify(DEFAULT_WAREHOUSES));
      return DEFAULT_WAREHOUSES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WAREHOUSES;
  }
}

function saveStoredWarehouses(warehouses: Warehouse[]): void {
  try {
    localStorage.setItem(WAREHOUSE_STORAGE_KEY, JSON.stringify(warehouses));
  } catch (err) {
    console.error('Failed to persist warehouses', err);
  }
}

function loadStoredInventory(): WarehouseInventoryItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(DEFAULT_INVENTORY_ITEMS));
      return DEFAULT_INVENTORY_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INVENTORY_ITEMS;
  }
}

function saveStoredInventory(items: WarehouseInventoryItem[]): void {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to persist inventory', err);
  }
}

export const warehousesApi = {
  async getWarehouses(filters?: { search?: string }): Promise<Warehouse[]> {
    await new Promise((r) => setTimeout(r, 60));
    let list = loadStoredWarehouses();
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.city.toLowerCase().includes(q) ||
          w.code.toLowerCase().includes(q) ||
          w.location.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getWarehouse(id?: string): Promise<Warehouse | null> {
    await new Promise((r) => setTimeout(r, 50));
    if (!id) return null;
    const list = loadStoredWarehouses();
    return list.find((w) => w.id === id || w.code === id) || null;
  },

  async getWarehouseStats(): Promise<WarehouseStats> {
    await new Promise((r) => setTimeout(r, 50));
    const warehouses = loadStoredWarehouses();
    const inventory = loadStoredInventory();

    const totalWarehouses = warehouses.length;
    const totalProducts = warehouses.reduce((acc, w) => acc + (w.totalProducts || 0), 0);
    const avgCapacityPercentage = Math.round(
      warehouses.reduce((acc, w) => acc + (w.capacityPercentage || 0), 0) / (totalWarehouses || 1)
    );
    const totalLowStockItems = inventory.filter((i) => i.reorderStatus === 'low' || i.reorderStatus === 'out_of_stock').length;
    const totalActiveFulfillments = warehouses.reduce((acc, w) => acc + (w.activeFulfillments || 0), 0);

    return {
      totalWarehouses,
      totalProducts,
      avgCapacityPercentage,
      totalLowStockItems,
      totalActiveFulfillments,
    };
  },

  async getWarehouseInventory(
    warehouseId: string,
    filters?: WarehouseFilterOptions
  ): Promise<WarehouseInventoryItem[]> {
    await new Promise((r) => setTimeout(r, 60));
    let items = loadStoredInventory().filter((i) => i.warehouseId === warehouseId);

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== 'all') {
      items = items.filter((i) => i.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.stockStatus && filters.stockStatus !== 'all') {
      items = items.filter((i) => i.reorderStatus === filters.stockStatus);
    }

    return items;
  },

  async getStockAvailability(productIdOrSku: string): Promise<ProductStockAvailability> {
    await new Promise((r) => setTimeout(r, 50));
    const warehouses = loadStoredWarehouses();
    const inventory = loadStoredInventory();

    const matchingItems = inventory.filter(
      (i) => i.productId === productIdOrSku || i.sku.toLowerCase() === productIdOrSku.toLowerCase()
    );

    const warehouseBreakdown = warehouses.map((wh) => {
      const inv = matchingItems.find((i) => i.warehouseId === wh.id);
      return {
        warehouseId: wh.id,
        warehouseName: wh.name,
        available: inv ? inv.available : 0,
        reserved: inv ? inv.reserved : 0,
        transitDays: wh.transitDaysToCustomer || 2,
      };
    });

    const totalAvailable = warehouseBreakdown.reduce((acc, w) => acc + w.available, 0);
    const totalReserved = warehouseBreakdown.reduce((acc, w) => acc + w.reserved, 0);

    const sample = matchingItems[0];

    return {
      productId: sample?.productId || productIdOrSku,
      productName: sample?.productName || productIdOrSku,
      sku: sample?.sku || productIdOrSku,
      totalAvailable,
      totalReserved,
      warehouses: warehouseBreakdown,
    };
  },

  async restockInventoryItem(warehouseId: string, itemId: string, quantity: number): Promise<WarehouseInventoryItem> {
    await new Promise((r) => setTimeout(r, 100));
    const inventory = loadStoredInventory();
    const idx = inventory.findIndex((i) => i.id === itemId && i.warehouseId === warehouseId);
    if (idx === -1) throw new Error('Inventory item not found');

    const item = inventory[idx];
    item.available += quantity;
    if (item.available > item.minStockThreshold) {
      item.reorderStatus = 'normal';
    } else if (item.available > 0) {
      item.reorderStatus = 'low';
    }
    item.lastRestockedAt = new Date().toISOString().split('T')[0];

    inventory[idx] = item;
    saveStoredInventory(inventory);
    return item;
  },

  // Internal helper for decrementing stock during allocation
  adjustWarehouseStock(warehouseId: string, productIdOrSku: string, allocateQty: number): void {
    const inventory = loadStoredInventory();
    const idx = inventory.findIndex(
      (i) =>
        i.warehouseId === warehouseId &&
        (i.productId === productIdOrSku || i.sku.toLowerCase() === productIdOrSku.toLowerCase())
    );

    if (idx !== -1) {
      const item = inventory[idx];
      item.available = Math.max(0, item.available - allocateQty);
      item.reserved += allocateQty;
      if (item.available === 0) {
        item.reorderStatus = 'out_of_stock';
      } else if (item.available <= item.minStockThreshold) {
        item.reorderStatus = 'low';
      }
      inventory[idx] = item;
      saveStoredInventory(inventory);
    }
  },
};

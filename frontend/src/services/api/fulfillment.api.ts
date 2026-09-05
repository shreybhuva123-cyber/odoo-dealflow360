import {
  Fulfillment,
  FulfillmentStatus,
  FulfillmentStats,
  FulfillmentFilterOptions,
  FulfillmentItem,
  FulfillmentActivity,
  Warehouse,
  FulfillmentAllocation,
} from '@/types';
import { warehousesApi } from './warehouses.api';

const FULFILLMENT_STORAGE_KEY = 'dealflow_fulfillment_v2';

export const MOCK_WAREHOUSES: Warehouse[] = [
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
  },
  {
    id: 'wh-bangalore',
    code: 'WH-BLR-03',
    name: 'Bangalore Tech Cargo Hub',
    location: 'Hosakote Industrial Area, Bengaluru, Karnataka',
    city: 'Bengaluru',
    country: 'India',
    isPrimary: false,
    transitDaysToCustomer: 2,
    capacityPercentage: 75,
    totalProducts: 1120,
    lowStockCount: 9,
    activeFulfillments: 14,
  },
];

export const MOCK_ALLOCATIONS: FulfillmentAllocation[] = [
  {
    id: 'alloc_1',
    quotationId: 'quote_1042',
    productId: 'prod_1',
    productName: 'DealFlow Enterprise Edge AI Appliance X1',
    requestedQty: 8,
    allocatedQty: 8,
    warehouseId: 'wh-mumbai',
    warehouseName: 'Mumbai Central Logistics Hub',
    status: 'RESERVED',
    backorderRequired: false,
    backorderQty: 0,
    estimatedDeliveryDate: '2026-09-08',
  },
];

export const DEFAULT_FULFILLMENTS: Fulfillment[] = [
  {
    id: 'FUL-1024',
    quotationId: 'quote_1042',
    quotationNumber: 'Q-1042',
    dealId: 'deal-101',
    dealName: 'Acme Enterprise Hardware & SaaS Suite',
    customerId: 'cust_acme',
    customerName: 'Acme Corporation',
    status: 'processing',
    priority: 'high',
    totalItems: 12,
    allocatedItems: 8,
    primaryWarehouseId: 'wh-mumbai',
    primaryWarehouseName: 'Mumbai Central Logistics Hub',
    createdAt: '2026-09-04T10:30:00Z',
    updatedAt: '2026-09-05T08:15:00Z',
    shippingAddress: {
      street: '404 Innovation Way, Tech Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400051',
      country: 'India',
    },
    shipment: {
      carrier: 'DHL Express',
      trackingNumber: 'DHL-928372',
      shippingDate: '2026-09-05',
      expectedDelivery: '2026-09-08',
      status: 'in_transit',
      currentLocation: 'Bhiwandi Hub Facility (Manifest Picked Up)',
    },
    items: [
      {
        id: 'fi-1024-1',
        fulfillmentId: 'FUL-1024',
        productId: 'prod_laptop_pro',
        productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
        sku: 'LP-100',
        requiredQuantity: 8,
        allocatedQuantity: 8,
        availableQuantity: 30,
        remainingQuantity: 0,
        status: 'allocated',
        allocations: [
          { warehouseId: 'wh-mumbai', warehouseName: 'Mumbai Central Logistics Hub', quantity: 6 },
          { warehouseId: 'wh-delhi', warehouseName: 'Delhi NCR Distribution Center', quantity: 2 },
        ],
      },
      {
        id: 'fi-1024-2',
        fulfillmentId: 'FUL-1024',
        productId: 'prod_display_4k',
        productName: 'UltraDisplay 27" 4K HDR Color-Calibrated Monitor',
        sku: 'MN-24',
        requiredQuantity: 4,
        allocatedQuantity: 0,
        availableQuantity: 8,
        remainingQuantity: 4,
        status: 'available',
        allocations: [],
      },
    ],
    activities: [
      {
        id: 'act-1024-1',
        fulfillmentId: 'FUL-1024',
        action: 'Fulfillment order created from approved Quotation Q-1042',
        user: 'Rahul Sharma (Sales AE)',
        timestamp: '2026-09-04 10:30 AM',
        status: 'pending',
      },
      {
        id: 'act-1024-2',
        fulfillmentId: 'FUL-1024',
        action: 'Allocated 8x Laptop Pro across Mumbai Hub (6) and Delhi Depot (2)',
        user: 'Vikram Malhotra (Warehouse Ops)',
        timestamp: '2026-09-04 11:15 AM',
        status: 'allocated',
        note: 'Direct courier transfer scheduled for Delhi consignment',
      },
      {
        id: 'act-1024-3',
        fulfillmentId: 'FUL-1024',
        action: 'Packaging initiated and barcoded for DHL pickup',
        user: 'Warehouse Fulfillment Bot',
        timestamp: '2026-09-05 12:30 PM',
        status: 'processing',
      },
    ],
  },
  {
    id: 'FUL-1023',
    quotationId: 'quote_1040',
    quotationNumber: 'Q-1040',
    dealId: 'deal-102',
    dealName: 'XYZ Ltd Retail Systems Overhaul',
    customerId: 'cust_xyz',
    customerName: 'XYZ Ltd',
    status: 'ready',
    priority: 'normal',
    totalItems: 5,
    allocatedItems: 5,
    primaryWarehouseId: 'wh-delhi',
    primaryWarehouseName: 'Delhi NCR Distribution Center',
    createdAt: '2026-09-03T14:20:00Z',
    updatedAt: '2026-09-04T17:00:00Z',
    shippingAddress: {
      street: '12 Connaught Place, Inner Circle',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
    },
    shipment: {
      carrier: 'BlueDart Express',
      trackingNumber: 'BD-8492019',
      shippingDate: '2026-09-05',
      expectedDelivery: '2026-09-07',
      status: 'pending',
      currentLocation: 'Delhi Outbound Dock Bay 3',
    },
    items: [
      {
        id: 'fi-1023-1',
        fulfillmentId: 'FUL-1023',
        productId: 'prod_1',
        productName: 'DealFlow Enterprise Edge AI Appliance X1',
        sku: 'DF-EDGE-X1',
        requiredQuantity: 5,
        allocatedQuantity: 5,
        availableQuantity: 15,
        remainingQuantity: 0,
        status: 'allocated',
        allocations: [
          { warehouseId: 'wh-delhi', warehouseName: 'Delhi NCR Distribution Center', quantity: 5 },
        ],
      },
    ],
    activities: [
      {
        id: 'act-1023-1',
        fulfillmentId: 'FUL-1023',
        action: 'Order generated from Quote Q-1040',
        user: 'Priya Patel (Rep)',
        timestamp: '2026-09-03 02:20 PM',
        status: 'pending',
      },
      {
        id: 'act-1023-2',
        fulfillmentId: 'FUL-1023',
        action: 'Allocated 5x Edge AI Appliance from Delhi NCR Depot',
        user: 'Ananya Roy (Ops)',
        timestamp: '2026-09-04 10:00 AM',
        status: 'allocated',
      },
      {
        id: 'act-1023-3',
        fulfillmentId: 'FUL-1023',
        action: 'Quality check passed, crates sealed. Ready for dispatch.',
        user: 'Ananya Roy (Ops)',
        timestamp: '2026-09-04 05:00 PM',
        status: 'ready',
      },
    ],
  },
  {
    id: 'FUL-1025',
    quotationId: 'quote_1041',
    quotationNumber: 'Q-1041',
    dealId: 'deal-103',
    dealName: 'Beta Smart Factory Sensors & Edge Gateway',
    customerId: 'cust_beta',
    customerName: 'Beta Industries',
    status: 'pending',
    priority: 'high',
    totalItems: 15,
    allocatedItems: 0,
    primaryWarehouseId: 'wh-bangalore',
    primaryWarehouseName: 'Bangalore Tech Cargo Hub',
    createdAt: '2026-09-04T16:45:00Z',
    updatedAt: '2026-09-04T16:45:00Z',
    shippingAddress: {
      street: 'Plot 55, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560100',
      country: 'India',
    },
    items: [
      {
        id: 'fi-1025-1',
        fulfillmentId: 'FUL-1025',
        productId: 'prod_laptop_pro',
        productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
        sku: 'LP-100',
        requiredQuantity: 10,
        allocatedQuantity: 0,
        availableQuantity: 10,
        remainingQuantity: 10,
        status: 'partially_available',
        allocations: [],
      },
      {
        id: 'fi-1025-2',
        fulfillmentId: 'FUL-1025',
        productId: 'prod_dock_thunderbolt',
        productName: 'Thunderbolt 4 Quad-Display Workstation Dock',
        sku: 'DK-400',
        requiredQuantity: 5,
        allocatedQuantity: 0,
        availableQuantity: 6,
        remainingQuantity: 5,
        status: 'available',
        allocations: [],
      },
    ],
    activities: [
      {
        id: 'act-1025-1',
        fulfillmentId: 'FUL-1025',
        action: 'Quotation Q-1041 approved. Awaiting warehouse inventory allocation.',
        user: 'System Workflow Automator',
        timestamp: '2026-09-04 04:45 PM',
        status: 'pending',
      },
    ],
  },
  {
    id: 'FUL-1026',
    quotationId: 'quote_1038',
    quotationNumber: 'Q-1038',
    dealId: 'deal-105',
    dealName: 'Nexus Next-Gen Developer Workstations',
    customerId: 'cust_nexus',
    customerName: 'Nexus Dynamics',
    status: 'shipped',
    priority: 'critical',
    totalItems: 8,
    allocatedItems: 8,
    primaryWarehouseId: 'wh-pune',
    primaryWarehouseName: 'Pune Regional Fulfillment Node',
    createdAt: '2026-09-01T09:15:00Z',
    updatedAt: '2026-09-03T11:30:00Z',
    shippingAddress: {
      street: 'Cyber Tower 2, Magarpatta City',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411028',
      country: 'India',
    },
    shipment: {
      carrier: 'BlueDart Air',
      trackingNumber: 'BD-77192844',
      shippingDate: '2026-09-03',
      expectedDelivery: '2026-09-06',
      status: 'in_transit',
      currentLocation: 'In Transit: Pune Distribution Gateway',
    },
    items: [
      {
        id: 'fi-1026-1',
        fulfillmentId: 'FUL-1026',
        productId: 'prod_laptop_pro',
        productName: 'ThinkStation Pro Laptop X1 (32GB / 1TB SSD)',
        sku: 'LP-100',
        requiredQuantity: 8,
        allocatedQuantity: 8,
        availableQuantity: 8,
        remainingQuantity: 0,
        status: 'allocated',
        allocations: [
          { warehouseId: 'wh-pune', warehouseName: 'Pune Regional Fulfillment Node', quantity: 8 },
        ],
      },
    ],
    activities: [
      {
        id: 'act-1026-1',
        fulfillmentId: 'FUL-1026',
        action: 'Urgent developer workstations fulfillment launched',
        user: 'Alex Morgan',
        timestamp: '2026-09-01 09:15 AM',
        status: 'pending',
      },
      {
        id: 'act-1026-2',
        fulfillmentId: 'FUL-1026',
        action: 'Allocated 8 units directly from Pune Chakan facility',
        user: 'Pooja Deshmukh',
        timestamp: '2026-09-01 11:30 AM',
        status: 'allocated',
      },
      {
        id: 'act-1026-3',
        fulfillmentId: 'FUL-1026',
        action: 'Dispatched via BlueDart Priority Air. AWB generated.',
        user: 'Pooja Deshmukh',
        timestamp: '2026-09-03 11:30 AM',
        status: 'shipped',
      },
    ],
  },
  {
    id: 'FUL-1027',
    quotationId: 'quote_1036',
    quotationNumber: 'Q-1036',
    dealId: 'deal-104',
    dealName: 'OmniCorp Global Enterprise Multi-site Network',
    customerId: 'cust_omnicorp',
    customerName: 'OmniCorp Global',
    status: 'partially_delivered',
    priority: 'normal',
    totalItems: 20,
    allocatedItems: 10,
    primaryWarehouseId: 'wh-mumbai',
    primaryWarehouseName: 'Mumbai Central Logistics Hub',
    createdAt: '2026-08-29T11:00:00Z',
    updatedAt: '2026-09-04T15:20:00Z',
    shippingAddress: {
      street: 'OmniCorp Tower, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400051',
      country: 'India',
    },
    shipment: {
      carrier: 'Delhivery Surface',
      trackingNumber: 'DEL-4491028',
      shippingDate: '2026-09-01',
      expectedDelivery: '2026-09-07',
      status: 'in_transit',
      currentLocation: 'Consignment 1 Delivered; Consignment 2 in Transit',
    },
    items: [
      {
        id: 'fi-1027-1',
        fulfillmentId: 'FUL-1027',
        productId: 'prod_1',
        productName: 'DealFlow Enterprise Edge AI Appliance X1',
        sku: 'DF-EDGE-X1',
        requiredQuantity: 10,
        allocatedQuantity: 10,
        availableQuantity: 15,
        remainingQuantity: 0,
        status: 'allocated',
        allocations: [
          { warehouseId: 'wh-mumbai', warehouseName: 'Mumbai Central Logistics Hub', quantity: 10 },
        ],
      },
      {
        id: 'fi-1027-2',
        fulfillmentId: 'FUL-1027',
        productId: 'prod_keyboard_mech',
        productName: 'Tactile Silent Mechanical Keyboard (Hot-Swap)',
        sku: 'KB-10',
        requiredQuantity: 10,
        allocatedQuantity: 0,
        availableQuantity: 0,
        remainingQuantity: 10,
        status: 'out_of_stock',
        allocations: [],
      },
    ],
    activities: [
      {
        id: 'act-1027-1',
        fulfillmentId: 'FUL-1027',
        action: 'Created for OmniCorp 20-node deployment',
        user: 'Sales Admin',
        timestamp: '2026-08-29 11:00 AM',
        status: 'pending',
      },
      {
        id: 'act-1027-2',
        fulfillmentId: 'FUL-1027',
        action: 'Batch 1 (10 Edge Appliances) fulfilled and delivered on site',
        user: 'Vikram Malhotra',
        timestamp: '2026-09-02 04:10 PM',
        status: 'partially_delivered',
      },
    ],
  },
  {
    id: 'FUL-1028',
    quotationId: 'quote_1034',
    quotationNumber: 'Q-1034',
    dealId: 'deal-106',
    dealName: 'Quantum Cloud Hybrid Node Integration',
    customerId: 'cust_quantum',
    customerName: 'Quantum Dynamics',
    status: 'completed',
    priority: 'low',
    totalItems: 6,
    allocatedItems: 6,
    primaryWarehouseId: 'wh-chennai',
    primaryWarehouseName: 'Chennai Ocean Port Depot',
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-08-25T16:00:00Z',
    shippingAddress: {
      street: 'Old Mahabalipuram Road, IT Corridor',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600096',
      country: 'India',
    },
    shipment: {
      carrier: 'FedEx Logistics',
      trackingNumber: 'FDX-8839021',
      shippingDate: '2026-08-22',
      expectedDelivery: '2026-08-25',
      actualDelivery: '2026-08-25',
      status: 'delivered',
      currentLocation: 'Signed by: Security Reception, R. Venkatesh',
    },
    items: [
      {
        id: 'fi-1028-1',
        fulfillmentId: 'FUL-1028',
        productId: 'prod_1',
        productName: 'DealFlow Enterprise Edge AI Appliance X1',
        sku: 'DF-EDGE-X1',
        requiredQuantity: 6,
        allocatedQuantity: 6,
        availableQuantity: 18,
        remainingQuantity: 0,
        status: 'allocated',
        allocations: [
          { warehouseId: 'wh-chennai', warehouseName: 'Chennai Ocean Port Depot', quantity: 6 },
        ],
      },
    ],
    activities: [
      {
        id: 'act-1028-1',
        fulfillmentId: 'FUL-1028',
        action: 'Completed order delivered and customer proof-of-delivery captured',
        user: 'FedEx Integration',
        timestamp: '2026-08-25 04:00 PM',
        status: 'completed',
      },
    ],
  },
];

function loadStoredFulfillments(): Fulfillment[] {
  try {
    const raw = localStorage.getItem(FULFILLMENT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FULFILLMENT_STORAGE_KEY, JSON.stringify(DEFAULT_FULFILLMENTS));
      return DEFAULT_FULFILLMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FULFILLMENTS;
  }
}

function saveStoredFulfillments(fulfillments: Fulfillment[]): void {
  try {
    localStorage.setItem(FULFILLMENT_STORAGE_KEY, JSON.stringify(fulfillments));
  } catch (err) {
    console.error('Failed to persist fulfillment orders', err);
  }
}

export const fulfillmentApi = {
  async getFulfillments(filters?: FulfillmentFilterOptions): Promise<Fulfillment[]> {
    await new Promise((r) => setTimeout(r, 60));
    let list = loadStoredFulfillments();

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.id.toLowerCase().includes(q) ||
          f.customerName.toLowerCase().includes(q) ||
          (f.dealName && f.dealName.toLowerCase().includes(q)) ||
          (f.quotationNumber && f.quotationNumber.toLowerCase().includes(q)) ||
          f.items?.some((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((f) => f.status.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.warehouseId && filters.warehouseId !== 'all') {
      list = list.filter(
        (f) =>
          f.primaryWarehouseId === filters.warehouseId ||
          f.items?.some((i) => i.allocations?.some((a) => a.warehouseId === filters.warehouseId))
      );
    }

    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter((f) => f.priority.toLowerCase() === filters.priority!.toLowerCase());
    }

    return list;
  },

  async getFulfillment(id?: string): Promise<Fulfillment | null> {
    await new Promise((r) => setTimeout(r, 50));
    if (!id) return null;
    const list = loadStoredFulfillments();
    return list.find((f) => f.id === id || f.quotationId === id || f.dealId === id) || null;
  },

  async getFulfillmentStats(): Promise<FulfillmentStats> {
    await new Promise((r) => setTimeout(r, 50));
    const list = loadStoredFulfillments();

    let pending = 0;
    let processing = 0;
    let partial = 0;
    let readyToShip = 0;
    let completed = 0;
    let backordered = 0;
    let delayed = 0;
    let lowStockAlerts = 0;

    list.forEach((f) => {
      if (f.status === 'pending') pending++;
      else if (f.status === 'processing') processing++;
      else if (f.status === 'partially_delivered' || (f.allocatedItems > 0 && f.allocatedItems < f.totalItems)) partial++;
      else if (f.status === 'ready') readyToShip++;
      else if (f.status === 'completed' || f.status === 'delivered') completed++;

      if (f.priority === 'critical' && (f.status === 'pending' || f.status === 'processing')) {
        delayed++;
      }

      f.items?.forEach((i) => {
        if (i.status === 'backordered' || i.status === 'out_of_stock') {
          backordered++;
        }
        if (i.status === 'partially_available' || i.status === 'out_of_stock') {
          lowStockAlerts++;
        }
      });
    });

    return {
      pending: pending || 24,
      processing: processing || 18,
      partial: partial || 7,
      readyToShip: readyToShip || 12,
      completed: completed || 48,
      lowStockAlerts: lowStockAlerts || 5,
      backordered: backordered || 3,
      delayed: delayed || 2,
    };
  },

  async getFulfillmentItems(fulfillmentId: string): Promise<FulfillmentItem[]> {
    await new Promise((r) => setTimeout(r, 50));
    const order = await this.getFulfillment(fulfillmentId);
    return order?.items || [];
  },

  async getFulfillmentActivity(fulfillmentId: string): Promise<FulfillmentActivity[]> {
    await new Promise((r) => setTimeout(r, 50));
    const order = await this.getFulfillment(fulfillmentId);
    return order?.activities || [];
  },

  async allocateInventory(
    fulfillmentId: string,
    itemId: string,
    warehouseAllocations: { warehouseId: string; warehouseName: string; quantity: number }[],
    authorName: string = 'Operations Specialist',
    note?: string
  ): Promise<Fulfillment> {
    await new Promise((r) => setTimeout(r, 120));
    const list = loadStoredFulfillments();
    const idx = list.findIndex((f) => f.id === fulfillmentId);
    if (idx === -1) throw new Error('Fulfillment order not found');

    const order = list[idx];
    if (!order.items) order.items = [];

    const itemIdx = order.items.findIndex((i) => i.id === itemId);
    if (itemIdx === -1) throw new Error('Item not found in fulfillment order');

    const item = order.items[itemIdx];
    const totalAllocated = warehouseAllocations.reduce((acc, a) => acc + (Number(a.quantity) || 0), 0);

    // Apply stock deduction in target warehouses
    warehouseAllocations.forEach((alloc) => {
      if (alloc.quantity > 0) {
        warehousesApi.adjustWarehouseStock(alloc.warehouseId, item.sku, alloc.quantity);
      }
    });

    item.allocations = warehouseAllocations.filter((a) => a.quantity > 0);
    item.allocatedQuantity = totalAllocated;
    item.remainingQuantity = Math.max(0, item.requiredQuantity - totalAllocated);

    if (item.remainingQuantity === 0) {
      item.status = 'allocated';
    } else if (totalAllocated > 0) {
      item.status = 'partially_available';
    }

    order.items[itemIdx] = item;

    // Recalculate order allocated items
    const orderTotalAllocated = order.items.reduce((acc, i) => acc + i.allocatedQuantity, 0);
    order.allocatedItems = orderTotalAllocated;

    // If all items allocated, advance status to 'allocated' or 'processing'
    if (order.items.every((i) => i.remainingQuantity === 0)) {
      if (order.status === 'pending') {
        order.status = 'allocated';
      }
    }

    order.updatedAt = new Date().toISOString();

    const allocationSummaryText = warehouseAllocations
      .filter((a) => a.quantity > 0)
      .map((a) => `${a.quantity} from ${a.warehouseName}`)
      .join(', ');

    if (!order.activities) order.activities = [];
    order.activities.unshift({
      id: `act_${Date.now()}`,
      fulfillmentId,
      action: `Allocated ${totalAllocated} units of ${item.productName} (${allocationSummaryText})`,
      user: authorName,
      timestamp: 'Just now',
      status: order.status,
      note,
    });

    list[idx] = order;
    saveStoredFulfillments(list);
    return order;
  },

  async updateFulfillmentStatus(
    id: string,
    status: FulfillmentStatus,
    authorName: string = 'Operations Team',
    note?: string
  ): Promise<Fulfillment> {
    await new Promise((r) => setTimeout(r, 100));
    const list = loadStoredFulfillments();
    const idx = list.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error('Fulfillment order not found');

    const order = list[idx];
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (status === 'shipped' && !order.shipment) {
      order.shipment = {
        carrier: 'DHL Express Logistics',
        trackingNumber: `DHL-${Math.floor(100000 + Math.random() * 900000)}`,
        shippingDate: new Date().toISOString().split('T')[0],
        expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        status: 'in_transit',
        currentLocation: 'Hub Departure Gateway',
      };
    }

    if (!order.activities) order.activities = [];
    order.activities.unshift({
      id: `act_${Date.now()}`,
      fulfillmentId: id,
      action: `Order transitioned to ${status.toUpperCase().replace('_', ' ')}`,
      user: authorName,
      timestamp: 'Just now',
      status,
      note,
    });

    list[idx] = order;
    saveStoredFulfillments(list);
    return order;
  },

  async createFulfillment(payload: {
    quotationId: string;
    quotationNumber?: string;
    dealId: string;
    dealName?: string;
    customerId: string;
    customerName: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    items: {
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
    }[];
  }): Promise<Fulfillment> {
    await new Promise((r) => setTimeout(r, 120));
    const list = loadStoredFulfillments();

    // Check if one already exists for this quote
    const existing = list.find((f) => f.quotationId === payload.quotationId);
    if (existing) return existing;

    const newId = `FUL-${1030 + list.length}`;
    const totalItemsCount = payload.items.reduce((acc, i) => acc + i.quantity, 0);

    const fulfillmentItems: FulfillmentItem[] = payload.items.map((it, idx) => ({
      id: `fi-${newId}-${idx + 1}`,
      fulfillmentId: newId,
      productId: it.productId,
      productName: it.productName,
      sku: it.sku,
      requiredQuantity: it.quantity,
      allocatedQuantity: 0,
      availableQuantity: 25,
      remainingQuantity: it.quantity,
      status: 'available',
      allocations: [],
    }));

    const newFulfillment: Fulfillment = {
      id: newId,
      quotationId: payload.quotationId,
      quotationNumber: payload.quotationNumber || `Q-${payload.quotationId.replace(/\D/g, '')}`,
      dealId: payload.dealId,
      dealName: payload.dealName || 'Enterprise Commercial Deal',
      customerId: payload.customerId,
      customerName: payload.customerName,
      status: 'pending',
      priority: payload.priority || 'high',
      totalItems: totalItemsCount,
      allocatedItems: 0,
      primaryWarehouseId: 'wh-mumbai',
      primaryWarehouseName: 'Mumbai Central Logistics Hub',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: fulfillmentItems,
      activities: [
        {
          id: `act_${Date.now()}`,
          fulfillmentId: newId,
          action: `Fulfillment initialized from approved Quotation ${payload.quotationNumber || payload.quotationId}`,
          user: 'DealFlow360 Orchestration Engine',
          timestamp: 'Just now',
          status: 'pending',
        },
      ],
    };

    list.unshift(newFulfillment);
    saveStoredFulfillments(list);
    return newFulfillment;
  },
};

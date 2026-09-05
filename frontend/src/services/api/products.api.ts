import { apiClient } from './client';
import { Product, ProductFilterOptions, ApiResponse } from '@/types';

const STORAGE_KEY = 'dealflow_products_v2';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_laptop',
    sku: 'DF-LAPTOP-X1',
    name: 'ProLaptop X1',
    description: 'High-performance developer workstation with 32GB RAM and 1TB NVMe.',
    category: 'Hardware',
    type: 'PHYSICAL',
    basePrice: 1200,
    costPrice: 850,
    minGrossMarginPct: 20,
    maxAllowableDiscountPct: 15,
    leadTimeDays: 5,
    isActive: true,
    status: 'ACTIVE',
    currency: 'USD',
    taxRatePct: 18,
    stockQuantity: 142,
    warehouseStock: {
      'wh-1': 85,
      'wh-2': 32,
      'wh-3': 25,
    },
    tags: ['Computing', 'Workstation', 'Flagship'],
    variants: [
      {
        id: 'var_lap_32gb',
        sku: 'DF-LAPTOP-X1-32',
        name: '32GB RAM / 1TB SSD',
        attributes: { RAM: '32GB', Storage: '1TB' },
        price: 1200,
        costPrice: 850,
        minGrossMarginPct: 20,
        availableStock: 80,
      },
      {
        id: 'var_lap_64gb',
        sku: 'DF-LAPTOP-X1-64',
        name: '64GB RAM / 2TB SSD',
        attributes: { RAM: '64GB', Storage: '2TB' },
        price: 1650,
        costPrice: 1100,
        minGrossMarginPct: 25,
        availableStock: 62,
      },
    ],
    volumeTiers: [
      { minQty: 10, unitPrice: 1140, discountPct: 5 },
      { minQty: 25, unitPrice: 1080, discountPct: 10 },
    ],
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-03-01T11:20:00Z',
  },
  {
    id: 'prod_display',
    sku: 'DF-DISP-4K',
    name: 'UltraDisplay 4K',
    description: '27-inch 4K UHD color-accurate HDR monitor with USB-C power delivery.',
    category: 'Hardware',
    type: 'PHYSICAL',
    basePrice: 480,
    costPrice: 310,
    minGrossMarginPct: 25,
    maxAllowableDiscountPct: 15,
    leadTimeDays: 3,
    isActive: true,
    status: 'ACTIVE',
    currency: 'USD',
    taxRatePct: 18,
    stockQuantity: 78,
    warehouseStock: {
      'wh-1': 45,
      'wh-2': 18,
      'wh-3': 15,
    },
    tags: ['Display', '4K', 'Peripherals'],
    variants: [],
    volumeTiers: [],
    createdAt: '2026-01-16T10:00:00Z',
    updatedAt: '2026-02-28T14:45:00Z',
  },
  {
    id: 'prod_dock',
    sku: 'DF-DOCK-PRO',
    name: 'SecureDock Pro',
    description: 'Thunderbolt 4 docking station with hardware-level secure boot authentication.',
    category: 'Hardware',
    type: 'PHYSICAL',
    basePrice: 220,
    costPrice: 130,
    minGrossMarginPct: 30,
    maxAllowableDiscountPct: 15,
    leadTimeDays: 2,
    isActive: true,
    status: 'ACTIVE',
    currency: 'USD',
    taxRatePct: 18,
    stockQuantity: 110,
    warehouseStock: {
      'wh-1': 60,
      'wh-2': 30,
      'wh-3': 20,
    },
    tags: ['Docking', 'Thunderbolt', 'Peripherals'],
    variants: [],
    volumeTiers: [],
    createdAt: '2026-01-20T09:15:00Z',
    updatedAt: '2026-03-02T16:00:00Z',
  },
  {
    id: 'prod_usbc_dock',
    sku: 'DF-USBC-DOCK',
    name: 'USB-C Dock',
    description: 'Compact 8-in-1 multi-port adapter with dual HDMI and gigabit ethernet.',
    category: 'Hardware',
    type: 'PHYSICAL',
    basePrice: 200,
    costPrice: 120,
    minGrossMarginPct: 40,
    maxAllowableDiscountPct: 15,
    leadTimeDays: 1,
    isActive: true,
    status: 'ACTIVE',
    currency: 'USD',
    taxRatePct: 18,
    stockQuantity: 95,
    warehouseStock: {
      'wh-1': 50,
      'wh-2': 25,
      'wh-3': 20,
    },
    tags: ['Portable', 'Adapter', 'USB-C'],
    variants: [],
    volumeTiers: [],
    createdAt: '2026-01-22T11:00:00Z',
    updatedAt: '2026-02-15T10:30:00Z',
  },
  {
    id: 'prod_cloud',
    sku: 'DF-CLOUD-PRO',
    name: 'CloudBase Pro',
    description: 'Enterprise workflow intelligence SaaS subscription per seat per month.',
    category: 'Subscription',
    type: 'SUBSCRIPTION',
    basePrice: 299,
    costPrice: 80,
    minGrossMarginPct: 65,
    maxAllowableDiscountPct: 15,
    leadTimeDays: 0,
    isActive: true,
    status: 'ACTIVE',
    currency: 'USD',
    taxRatePct: 18,
    stockQuantity: 9999,
    warehouseStock: {},
    tags: ['SaaS', 'Workflow', 'Cloud'],
    variants: [
      {
        id: 'var_cloud_mo',
        sku: 'DF-CLOUD-PRO-MO',
        name: 'Monthly Billing',
        attributes: { Cadence: 'Monthly' },
        price: 299,
        costPrice: 80,
        minGrossMarginPct: 65,
        availableStock: 9999,
      },
      {
        id: 'var_cloud_yr',
        sku: 'DF-CLOUD-PRO-YR',
        name: 'Annual Billing (Save 15%)',
        attributes: { Cadence: 'Annual' },
        price: 3050,
        costPrice: 800,
        minGrossMarginPct: 70,
        availableStock: 9999,
      },
    ],
    volumeTiers: [
      { minQty: 20, unitPrice: 269, discountPct: 10 },
      { minQty: 50, unitPrice: 239, discountPct: 20 },
    ],
    createdAt: '2026-01-10T14:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'prod_analytics',
    sku: 'DF-ANALYTICS-ADD',
    name: 'Analytics Add-on',
    description: 'Predictive deal scoring and automated pipeline anomaly detection module.',
    category: 'Subscription',
    type: 'SUBSCRIPTION',
    basePrice: 99,
    costPrice: 25,
    minGrossMarginPct: 70,
    maxAllowableDiscountPct: 15,
    leadTimeDays: 0,
    isActive: true,
    status: 'ACTIVE',
    currency: 'USD',
    taxRatePct: 18,
    stockQuantity: 9999,
    warehouseStock: {},
    tags: ['AI', 'Analytics', 'Add-on'],
    variants: [],
    volumeTiers: [],
    createdAt: '2026-01-12T16:20:00Z',
    updatedAt: '2026-02-20T12:00:00Z',
  },
  {
    id: 'prod_deploy',
    sku: 'DF-SVC-SETUP',
    name: 'Setup & Deploy',
    description: 'Turnkey onboarding, directory federation, and Odoo ERP integration services.',
    category: 'Service',
    type: 'SERVICE',
    basePrice: 1800,
    costPrice: 1300,
    minGrossMarginPct: 15,
    maxAllowableDiscountPct: 10,
    leadTimeDays: 7,
    isActive: true,
    status: 'ACTIVE',
    currency: 'USD',
    taxRatePct: 18,
    stockQuantity: 50,
    warehouseStock: {},
    tags: ['Implementation', 'Integration', 'Professional Services'],
    variants: [],
    volumeTiers: [],
    createdAt: '2026-01-18T08:00:00Z',
    updatedAt: '2026-03-03T17:00:00Z',
  },
  {
    id: 'prod_warranty',
    sku: 'DF-WARR-1Y',
    name: 'Extended Warranty',
    description: 'Next-business-day on-site replacement and 24/7 hardware concierge coverage.',
    category: 'Hardware',
    type: 'SERVICE',
    basePrice: 60,
    costPrice: 20,
    minGrossMarginPct: 60,
    maxAllowableDiscountPct: 10,
    leadTimeDays: 0,
    isActive: true,
    status: 'ACTIVE',
    currency: 'USD',
    taxRatePct: 18,
    stockQuantity: 9999,
    warehouseStock: {},
    tags: ['Warranty', 'Support', 'SLA'],
    variants: [],
    volumeTiers: [],
    createdAt: '2026-01-15T12:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'prod_support',
    sku: 'DF-PREM-SUPPORT',
    name: 'Premium Support Plan',
    description: 'Dedicated technical account manager and 1-hour priority SLA response time.',
    category: 'Service',
    type: 'SERVICE',
    basePrice: 1800,
    costPrice: 800,
    minGrossMarginPct: 55,
    maxAllowableDiscountPct: 10,
    leadTimeDays: 0,
    isActive: true,
    status: 'ACTIVE',
    currency: 'USD',
    taxRatePct: 18,
    stockQuantity: 20,
    warehouseStock: {},
    tags: ['Premium', 'SLA', 'Enterprise'],
    variants: [],
    volumeTiers: [],
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-02-25T15:30:00Z',
  },
];

// Re-export mock products for backward compatibility
export const MOCK_PRODUCTS: Product[] = INITIAL_PRODUCTS;

function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products to localStorage:', err);
  }
}

export const productsApi = {
  async getAll(): Promise<Product[]> {
    try {
      const res = await apiClient.get<ApiResponse<Product[]>>('/products');
      return res.data.data;
    } catch {
      return getStoredProducts();
    }
  },

  async search(query: string, category?: string, filters?: ProductFilterOptions): Promise<Product[]> {
    const all = await productsApi.getAll();
    const q = query.toLowerCase().trim();

    return all.filter((p) => {
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q));

      const selectedCat = filters?.category || category;
      const matchesCat = !selectedCat || selectedCat === 'ALL' || p.category.toLowerCase() === selectedCat.toLowerCase();

      const matchesType = !filters?.type || filters.type === 'ALL' || p.type === filters.type;
      const matchesStatus =
        !filters?.status ||
        filters.status === 'ALL' ||
        (filters.status === 'ACTIVE' && p.isActive) ||
        (filters.status === 'INACTIVE' && !p.isActive);

      const matchesMinPrice = filters?.minPrice === undefined || p.basePrice >= filters.minPrice;
      const matchesMaxPrice = filters?.maxPrice === undefined || p.basePrice <= filters.maxPrice;

      return matchesQ && matchesCat && matchesType && matchesStatus && matchesMinPrice && matchesMaxPrice;
    });
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return res.data.data;
    } catch {
      const list = getStoredProducts();
      return list.find((p) => p.id === id || p.sku === id) || null;
    }
  },

  async create(payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const list = getStoredProducts();
    const newProduct: Product = {
      ...payload,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: payload.status || 'ACTIVE',
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      variants: payload.variants || [],
      volumeTiers: payload.volumeTiers || [],
      tags: payload.tags || [],
      warehouseStock: payload.warehouseStock || {},
    };

    const updated = [newProduct, ...list];
    saveStoredProducts(updated);
    return newProduct;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const list = getStoredProducts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const updatedProduct: Product = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[idx] = updatedProduct;
    saveStoredProducts(list);
    return updatedProduct;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const list = getStoredProducts();
    const filtered = list.filter((p) => p.id !== id);
    saveStoredProducts(filtered);
    return { success: true };
  },

  async getMetrics(): Promise<{
    totalProducts: number;
    activeCount: number;
    lowStockCount: number;
    categoriesCount: number;
    avgGrossMargin: number;
  }> {
    const list = await productsApi.getAll();
    const totalProducts = list.length;
    const activeCount = list.filter((p) => p.isActive).length;
    const lowStockCount = list.filter((p) => p.type === 'PHYSICAL' && (p.stockQuantity ?? 0) < 50).length;
    const categories = new Set(list.map((p) => p.category));
    const avgGrossMargin = Math.round(
      list.reduce((acc, p) => acc + p.minGrossMarginPct, 0) / (totalProducts || 1)
    );

    return {
      totalProducts,
      activeCount,
      lowStockCount,
      categoriesCount: categories.size,
      avgGrossMargin,
    };
  },
};

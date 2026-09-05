export type ProductType = 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>; // e.g. { color: 'Black', storage: '256GB' }
  price: number;
  costPrice: number;
  minGrossMarginPct: number;
  availableStock: number;
}

export interface VolumePricingTier {
  minQty: number;
  unitPrice: number;
  discountPct: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  type: ProductType;
  basePrice: number;
  costPrice: number;
  minGrossMarginPct: number;
  maxAllowableDiscountPct: number;
  variants: ProductVariant[];
  volumeTiers: VolumePricingTier[];
  isActive: boolean;
  status: ProductStatus;
  leadTimeDays: number;
  imageUrl?: string;
  stockQuantity?: number;
  taxRatePct?: number;
  currency?: string;
  tags?: string[];
  warehouseStock?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilterOptions {
  category?: string;
  type?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

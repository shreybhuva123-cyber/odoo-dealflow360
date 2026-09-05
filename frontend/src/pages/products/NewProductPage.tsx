import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateProduct, useProducts } from '@/hooks/useProducts';
import { ProductType, ProductStatus, VolumePricingTier, ProductVariant } from '@/types';
import {
  ProductBasicInfoForm,
  ProductPricingForm,
  ProductVariantsManager,
} from './components';
import { showToast } from '@/stores/toast.store';

export function NewProductPage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { data: existingProducts = [] } = useProducts();

  const categories = Array.from(
    new Set(existingProducts.map((p) => p.category))
  ).filter(Boolean);

  const [basicInfo, setBasicInfo] = useState({
    name: '',
    sku: '',
    category: 'Hardware',
    type: 'PHYSICAL' as ProductType,
    status: 'ACTIVE' as ProductStatus,
    description: '',
    leadTimeDays: 3,
    tagsInput: '',
  });

  const [pricingInfo, setPricingInfo] = useState({
    basePrice: 500,
    costPrice: 320,
    minGrossMarginPct: 20,
    maxAllowableDiscountPct: 15,
    taxRatePct: 18,
    volumeTiers: [] as VolumePricingTier[],
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const handleBasicChange = (field: string, value: any) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePricingChange = (field: string, value: any) => {
    setPricingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!basicInfo.name.trim() || !basicInfo.sku.trim()) {
      showToast('Product name and SKU are required', 'amber');
      return;
    }

    if (pricingInfo.basePrice <= 0) {
      showToast('Base price must be greater than zero', 'amber');
      return;
    }

    const tags = basicInfo.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createProduct.mutate(
      {
        name: basicInfo.name.trim(),
        sku: basicInfo.sku.trim().toUpperCase(),
        category: basicInfo.category.trim(),
        type: basicInfo.type,
        status: basicInfo.status,
        isActive: basicInfo.status === 'ACTIVE',
        description: basicInfo.description.trim(),
        leadTimeDays: basicInfo.leadTimeDays,
        tags,
        basePrice: pricingInfo.basePrice,
        costPrice: pricingInfo.costPrice,
        minGrossMarginPct: pricingInfo.minGrossMarginPct,
        maxAllowableDiscountPct: pricingInfo.maxAllowableDiscountPct,
        taxRatePct: pricingInfo.taxRatePct,
        volumeTiers: pricingInfo.volumeTiers,
        variants,
        stockQuantity: basicInfo.type === 'PHYSICAL' ? 50 : 9999,
        warehouseStock: basicInfo.type === 'PHYSICAL' ? { 'wh-1': 30, 'wh-2': 20 } : {},
      },
      {
        onSuccess: (newProd) => {
          navigate(`/app/products/${newProd.id}`);
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/app/products" className="hover:text-foreground">
              Products
            </Link>
            <span>/</span>
            <span>New Item</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Add Catalog Product</h1>
        </div>
        <Link to="/app/products" className="btn btn-ghost btn-sm text-xs">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <ProductBasicInfoForm
          formData={basicInfo}
          onChange={handleBasicChange}
          categories={categories}
        />

        <ProductPricingForm
          formData={pricingInfo}
          onChange={handlePricingChange}
        />

        <ProductVariantsManager
          variants={variants}
          basePrice={pricingInfo.basePrice}
          baseCost={pricingInfo.costPrice}
          onChange={setVariants}
        />

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Link to="/app/products" className="btn btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createProduct.isPending}
          >
            {createProduct.isPending ? 'Publishing...' : 'Publish Product to Catalog'}
          </button>
        </div>
      </form>
    </div>
  );
}

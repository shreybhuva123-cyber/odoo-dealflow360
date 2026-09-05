import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct, useUpdateProduct, useProducts } from '@/hooks/useProducts';
import { ProductType, ProductStatus, VolumePricingTier, ProductVariant } from '@/types';
import {
  ProductBasicInfoForm,
  ProductPricingForm,
  ProductVariantsManager,
} from './components';
import { showToast } from '@/stores/toast.store';

export function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(productId);
  const updateProduct = useUpdateProduct();
  const { data: allProducts = [] } = useProducts();

  const categories = Array.from(
    new Set(allProducts.map((p) => p.category))
  ).filter(Boolean);

  const [basicInfo, setBasicInfo] = useState({
    name: '',
    sku: '',
    category: 'Hardware',
    type: 'PHYSICAL' as ProductType,
    status: 'ACTIVE' as ProductStatus,
    description: '',
    leadTimeDays: 0,
    tagsInput: '',
  });

  const [pricingInfo, setPricingInfo] = useState({
    basePrice: 0,
    costPrice: 0,
    minGrossMarginPct: 20,
    maxAllowableDiscountPct: 15,
    taxRatePct: 18,
    volumeTiers: [] as VolumePricingTier[],
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    if (product) {
      setBasicInfo({
        name: product.name,
        sku: product.sku,
        category: product.category,
        type: product.type,
        status: product.status || (product.isActive ? 'ACTIVE' : 'INACTIVE'),
        description: product.description || '',
        leadTimeDays: product.leadTimeDays || 0,
        tagsInput: (product.tags || []).join(', '),
      });

      setPricingInfo({
        basePrice: product.basePrice,
        costPrice: product.costPrice,
        minGrossMarginPct: product.minGrossMarginPct,
        maxAllowableDiscountPct: product.maxAllowableDiscountPct,
        taxRatePct: product.taxRatePct ?? 18,
        volumeTiers: product.volumeTiers || [],
      });

      setVariants(product.variants || []);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground text-sm">
        Loading product data...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-base font-bold text-foreground">Product Not Found</h2>
        <Link to="/app/products" className="btn btn-primary btn-sm mt-3">
          Back to Catalog
        </Link>
      </div>
    );
  }

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

    const tags = basicInfo.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateProduct.mutate(
      {
        id: product.id,
        updates: {
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
        },
      },
      {
        onSuccess: () => {
          navigate(`/app/products/${product.id}`);
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/app/products" className="hover:text-foreground">
              Products
            </Link>
            <span>/</span>
            <Link to={`/app/products/${product.id}`} className="hover:text-foreground">
              {product.name}
            </Link>
            <span>/</span>
            <span>Edit</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Edit Product SKU: {product.sku}</h1>
        </div>
        <Link to={`/app/products/${product.id}`} className="btn btn-ghost btn-sm text-xs">
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

        <div className="flex items-center justify-end gap-3 mt-6">
          <Link to={`/app/products/${product.id}`} className="btn btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={updateProduct.isPending}
          >
            {updateProduct.isPending ? 'Saving...' : 'Save Product Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

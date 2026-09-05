import React from 'react';
import { ProductType, ProductStatus } from '@/types';

interface ProductBasicInfoFormProps {
  formData: {
    name: string;
    sku: string;
    category: string;
    type: ProductType;
    status: ProductStatus;
    description: string;
    leadTimeDays: number;
    tagsInput: string;
  };
  onChange: (field: string, value: any) => void;
  categories: string[];
}

export function ProductBasicInfoForm({
  formData,
  onChange,
  categories,
}: ProductBasicInfoFormProps) {
  return (
    <div className="card p-5 mb-6">
      <h3 className="font-semibold text-foreground text-sm mb-4">
        1. General & Classification
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="field-group">
          <label className="field-label">Product Name *</label>
          <input
            type="text"
            className="field-input"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g. UltraServer X10"
            required
          />
        </div>

        {/* SKU */}
        <div className="field-group">
          <label className="field-label">SKU Identifier *</label>
          <input
            type="text"
            className="field-input font-mono"
            value={formData.sku}
            onChange={(e) => onChange('sku', e.target.value.toUpperCase())}
            placeholder="e.g. DF-SRV-X10"
            required
          />
        </div>

        {/* Category */}
        <div className="field-group">
          <label className="field-label">Category *</label>
          <input
            type="text"
            list="category-suggestions"
            className="field-input"
            value={formData.category}
            onChange={(e) => onChange('category', e.target.value)}
            placeholder="Select or enter category"
            required
          />
          <datalist id="category-suggestions">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
            <option value="Hardware" />
            <option value="Subscription" />
            <option value="Service" />
            <option value="Software" />
            <option value="Accessories" />
          </datalist>
        </div>

        {/* Product Type */}
        <div className="field-group">
          <label className="field-label">Product Type *</label>
          <select
            className="field-input"
            value={formData.type}
            onChange={(e) => onChange('type', e.target.value as ProductType)}
          >
            <option value="PHYSICAL">Physical / Hardware (Requires Warehouse Fulfillment)</option>
            <option value="SUBSCRIPTION">Subscription / SaaS (Recurring Cadence)</option>
            <option value="SERVICE">Professional Service (Billable Hours / Milestones)</option>
          </select>
        </div>

        {/* Status */}
        <div className="field-group">
          <label className="field-label">Catalog Status</label>
          <select
            className="field-input"
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value as ProductStatus)}
          >
            <option value="ACTIVE">Active (Available for Quotations)</option>
            <option value="INACTIVE">Inactive (Hidden from Quotes)</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Lead Time Days */}
        <div className="field-group">
          <label className="field-label">Fulfillment Lead Time (Days)</label>
          <input
            type="number"
            min="0"
            className="field-input"
            value={formData.leadTimeDays}
            onChange={(e) => onChange('leadTimeDays', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        {/* Description */}
        <div className="field-group md:col-span-2">
          <label className="field-label">Description & Specification</label>
          <textarea
            rows={3}
            className="field-input"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Technical specs, performance envelope, standard inclusions..."
          />
        </div>

        {/* Tags */}
        <div className="field-group md:col-span-2">
          <label className="field-label">Tags (comma-separated)</label>
          <input
            type="text"
            className="field-input"
            value={formData.tagsInput}
            onChange={(e) => onChange('tagsInput', e.target.value)}
            placeholder="Workstation, Flagship, Thunderbolt, SaaS..."
          />
        </div>
      </div>
    </div>
  );
}

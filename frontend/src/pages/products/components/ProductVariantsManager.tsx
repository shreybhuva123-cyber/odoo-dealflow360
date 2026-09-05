import React, { useState } from 'react';
import { ProductVariant } from '@/types';
import { showToast } from '@/stores/toast.store';

interface ProductVariantsManagerProps {
  variants: ProductVariant[];
  basePrice: number;
  baseCost: number;
  onChange: (variants: ProductVariant[]) => void;
}

export function ProductVariantsManager({
  variants,
  basePrice,
  baseCost,
  onChange,
}: ProductVariantsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVarName, setNewVarName] = useState('');
  const [newVarSku, setNewVarSku] = useState('');
  const [newVarPrice, setNewVarPrice] = useState(basePrice || 100);
  const [newVarCost, setNewVarCost] = useState(baseCost || 70);
  const [newVarStock, setNewVarStock] = useState(25);
  const [attrKey, setAttrKey] = useState('Configuration');
  const [attrVal, setAttrVal] = useState('');

  const handleAddVariant = () => {
    if (!newVarName.trim() || !newVarSku.trim()) {
      showToast('Variant name and SKU are required', 'amber');
      return;
    }

    const marginAmt = newVarPrice - newVarCost;
    const minMargin = newVarPrice > 0 ? Math.round((marginAmt / newVarPrice) * 100) : 20;

    const newVariant: ProductVariant = {
      id: `var_${Date.now()}`,
      name: newVarName.trim(),
      sku: newVarSku.trim().toUpperCase(),
      price: newVarPrice,
      costPrice: newVarCost,
      minGrossMarginPct: minMargin,
      availableStock: newVarStock,
      attributes: attrVal.trim() ? { [attrKey.trim() || 'Option']: attrVal.trim() } : {},
    };

    onChange([...variants, newVariant]);
    setIsModalOpen(false);
    setNewVarName('');
    setNewVarSku('');
    setAttrVal('');
    showToast('Variant added', 'green');
  };

  const handleRemoveVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            3. Product Variants & Attributes
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure different SKUs, storage/color tiers, or packaging variants
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setNewVarPrice(basePrice || 100);
            setNewVarCost(baseCost || 70);
            setIsModalOpen(true);
          }}
        >
          + Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-6 bg-muted/20 border border-dashed border-border rounded-lg">
          <div className="text-xl mb-1">🏷️</div>
          <p className="text-xs text-muted-foreground">
            No variants created. This item will be ordered as a single SKU.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Variant Name</th>
                <th>SKU</th>
                <th>Attributes</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Margin</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => {
                const margin = v.price - v.costPrice;
                const marginPct = v.price > 0 ? Math.round((margin / v.price) * 100) : 0;

                return (
                  <tr key={v.id}>
                    <td className="font-medium text-foreground">{v.name}</td>
                    <td className="font-mono text-xs">{v.sku}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(v.attributes || {}).map(([key, val]) => (
                          <span
                            key={key}
                            className="badge badge-gray text-[10px] font-normal"
                          >
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="font-semibold">${v.price.toLocaleString()}</td>
                    <td className="font-mono text-xs text-muted-foreground">
                      ${v.costPrice.toLocaleString()}
                    </td>
                    <td className="text-xs text-emerald-500 font-semibold">{marginPct}%</td>
                    <td className="font-semibold text-xs">{v.availableStock}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-red-400 hover:text-red-500"
                        onClick={() => handleRemoveVariant(v.id)}
                      >
                        ✕ Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Variant Modal */}
      {isModalOpen && (
        <div className="modal-overlay open">
          <div className="modal max-w-md">
            <div className="modal-head">
              <div className="modal-title">Add Product Variant</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="field-group">
                <label className="field-label">Variant Name *</label>
                <input
                  type="text"
                  className="field-input"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  placeholder="e.g. 64GB RAM / 2TB SSD"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Variant SKU *</label>
                <input
                  type="text"
                  className="field-input font-mono"
                  value={newVarSku}
                  onChange={(e) => setNewVarSku(e.target.value.toUpperCase())}
                  placeholder="e.g. DF-LAPTOP-X1-64"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="field-group">
                  <label className="field-label">Attribute Key</label>
                  <input
                    type="text"
                    className="field-input text-xs"
                    value={attrKey}
                    onChange={(e) => setAttrKey(e.target.value)}
                    placeholder="e.g. RAM"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Attribute Value</label>
                  <input
                    type="text"
                    className="field-input text-xs"
                    value={attrVal}
                    onChange={(e) => setAttrVal(e.target.value)}
                    placeholder="e.g. 64GB"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="field-group">
                  <label className="field-label">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    className="field-input text-xs font-semibold"
                    value={newVarPrice}
                    onChange={(e) => setNewVarPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    className="field-input text-xs font-mono"
                    value={newVarCost}
                    onChange={(e) => setNewVarCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    className="field-input text-xs"
                    value={newVarStock}
                    onChange={(e) => setNewVarStock(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddVariant}
              >
                Save Variant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { ProductStatus, ProductType } from '@/types';

interface ProductStatusBadgeProps {
  status?: ProductStatus;
  isActive?: boolean;
}

export function ProductStatusBadge({ status, isActive }: ProductStatusBadgeProps) {
  const effectiveStatus = status || (isActive ? 'ACTIVE' : 'INACTIVE');

  if (effectiveStatus === 'ACTIVE') {
    return (
      <span className="badge badge-green inline-flex items-center gap-1.5 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  }

  if (effectiveStatus === 'ARCHIVED') {
    return (
      <span className="badge badge-gray inline-flex items-center gap-1 font-medium">
        Archived
      </span>
    );
  }

  return (
    <span className="badge badge-gray inline-flex items-center gap-1.5 font-medium opacity-75">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
      Inactive
    </span>
  );
}

export function ProductTypeBadge({ type }: { type: ProductType }) {
  switch (type) {
    case 'PHYSICAL':
      return (
        <span className="badge badge-blue inline-flex items-center gap-1 text-xs">
          📦 Hardware
        </span>
      );
    case 'SUBSCRIPTION':
      return (
        <span className="badge badge-purple inline-flex items-center gap-1 text-xs">
          🔁 SaaS / Sub
        </span>
      );
    case 'SERVICE':
      return (
        <span className="badge badge-green inline-flex items-center gap-1 text-xs">
          🛠️ Service
        </span>
      );
    default:
      return <span className="badge badge-gray text-xs">{type}</span>;
  }
}

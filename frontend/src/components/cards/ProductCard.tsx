import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/types';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" size="sm" className="font-mono text-[10px]">
            {product.sku}
          </Badge>
          <Badge variant={product.type === 'SUBSCRIPTION' ? 'purple' : 'info'} size="sm">
            {product.type}
          </Badge>
        </div>
        <CardTitle className="text-sm font-semibold mt-2 line-clamp-1">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-baseline justify-between border-t border-border/40 pt-2 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px]">List Price</span>
            <span className="font-bold text-foreground text-sm font-mono">{formatCurrency(product.basePrice)}</span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block text-[10px]">Min Target Margin</span>
            <span className="font-semibold text-emerald-400 font-mono">{formatPercent(product.minGrossMarginPct)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          onClick={() => onSelect?.(product)}
          variant="outline"
          size="sm"
          className="w-full text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add to Quotation
        </Button>
      </CardFooter>
    </Card>
  );
}

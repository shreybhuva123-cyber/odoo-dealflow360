import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FulfillmentAllocation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Warehouse, CheckCircle2, Clock } from 'lucide-react';

export function WarehouseAllocationCard({ allocation }: { allocation: FulfillmentAllocation }) {
  const isAllocated = allocation.allocatedQty >= allocation.requestedQty;

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-primary" />
          <CardTitle className="text-xs font-semibold">{allocation.warehouseName}</CardTitle>
        </div>
        <Badge variant={isAllocated ? 'success' : 'warning'} size="sm">
          {allocation.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between py-1 border-b border-border/40">
          <span className="text-muted-foreground">Product Item</span>
          <span className="font-medium text-foreground">{allocation.productName}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 py-1">
          <div>
            <span className="text-muted-foreground block text-[10px]">Requested</span>
            <span className="font-bold text-foreground">{allocation.requestedQty} Units</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">Reserved</span>
            <span className="font-bold text-emerald-400">{allocation.allocatedQty} Units</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-400" />
            Est. Delivery: {allocation.estimatedDeliveryDate}
          </span>
          {allocation.backorderRequired && (
            <span className="text-amber-400 font-medium">Backorder: {allocation.backorderQty}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

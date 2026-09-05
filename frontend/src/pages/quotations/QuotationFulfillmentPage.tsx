import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFulfillment } from '@/hooks/useFulfillment';
import { ROUTES } from '@/constants/routes';

export function QuotationFulfillmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: fulfillment } = useFulfillment(id);

  useEffect(() => {
    if (fulfillment) {
      navigate(ROUTES.APP.FULFILLMENT_DETAIL(fulfillment.id), { replace: true });
    } else {
      navigate(ROUTES.APP.FULFILLMENT_DETAIL('FUL-1024'), { replace: true });
    }
  }, [fulfillment, navigate]);

  return (
    <div className="p-12 max-w-md mx-auto text-center space-y-3">
      <div className="text-3xl animate-bounce">📦</div>
      <div className="text-sm font-semibold text-foreground">
        Connecting to Fulfillment Workspace...
      </div>
      <p className="text-xs text-muted-foreground">
        Routing quotation {id} to active physical dispatch and warehouse allocation record.
      </p>
    </div>
  );
}

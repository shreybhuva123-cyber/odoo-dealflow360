import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'app');

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  const breadcrumbNameMap: Record<string, string> = {
    quotations: 'Quotations',
    new: 'New Quotation',
    pipeline: 'Pipeline Board',
    approvals: 'Approvals Queue',
    customers: 'Customers',
    products: 'Products',
    warehouses: 'Warehouses',
    fulfillment: 'Fulfillment',
    billing: 'Billing & Invoices',
    invoices: 'Invoices',
    subscriptions: 'Subscriptions',
    'deal-health': 'Deal Health AI',
    reports: 'Reports & Analytics',
    admin: 'Admin Settings',
    approval: 'Approval Signoff',
  };

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground mb-4">
      <Link
        to={ROUTES.APP.DASHBOARD}
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {pathnames.map((segment, index) => {
        const routeTo = `/app/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbNameMap[segment] || segment;

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-xs">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-foreground transition-colors truncate max-w-xs">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

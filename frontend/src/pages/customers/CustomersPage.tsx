import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MOCK_CUSTOMERS } from '@/services/api/customers.api';
import { formatCurrency } from '@/utils/formatters';

export function CustomersPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">Customer Accounts & Credit Profiles</h1>
        <p className="text-xs text-muted-foreground">Enterprise accounts, credit line limits, payment terms, and deal exposure</p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Credit Limit</TableHead>
              <TableHead>Available Credit</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead>Risk Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_CUSTOMERS.map((cust) => (
              <TableRow key={cust.id}>
                <TableCell className="text-xs font-semibold text-foreground">
                  {cust.companyName}
                </TableCell>
                <TableCell>
                  <Badge variant={cust.tier === 'ENTERPRISE' ? 'purple' : 'info'} size="sm">
                    {cust.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{cust.industry}</TableCell>
                <TableCell className="font-mono text-xs font-bold text-foreground">
                  {formatCurrency(cust.creditProfile.creditLimit)}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-emerald-400">
                  {formatCurrency(cust.creditProfile.availableCredit)}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {cust.creditProfile.paymentTerms}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={cust.creditProfile.riskRating === 'LOW' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {cust.creditProfile.riskRating}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

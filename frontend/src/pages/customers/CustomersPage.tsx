import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import { formatCurrency } from '@/utils/formatters';
import { TableSkeleton } from '@/components/feedback/PageSkeleton';

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const { data: customers = [], isLoading } = useCustomers(search, tierFilter);

  const totalCredit = customers.reduce((sum, c) => sum + c.creditProfile.creditLimit, 0);
  const totalAvailable = customers.reduce((sum, c) => sum + c.creditProfile.availableCredit, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Customer Accounts & Credit Profiles</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enterprise accounts, credit line limits, payment terms, and deal exposure
          </p>
        </div>

        {/* Live Aggregated Credit Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg border border-border/70 bg-surface/60 text-right">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Total Credit Line</span>
            <span className="text-xs font-mono font-bold text-foreground">{formatCurrency(totalCredit)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-border/70 bg-surface/60 text-right">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Available Credit</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{formatCurrency(totalAvailable)}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border border-border bg-surface">
        <div className="flex-1 relative w-full">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by company, industry, or country..."
            className="w-full text-xs pl-8"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">🔍</span>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Customer Tiers' },
              { value: 'ENTERPRISE', label: 'Enterprise Tier' },
              { value: 'MID_MARKET', label: 'Mid-Market' },
              { value: 'SMB', label: 'SMB' },
            ]}
            className="text-xs w-full"
          />
        </div>
      </div>

      {/* Table / Loading State */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={7} />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs">
            No customer accounts found matching your filter criteria.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Available Credit</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Risk Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((cust) => (
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
                  <TableCell className="text-xs text-muted-foreground">{cust.country}</TableCell>
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
        )}
      </Card>
    </div>
  );
}

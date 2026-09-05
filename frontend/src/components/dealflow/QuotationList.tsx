import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Quotation, QuotationStatus as StatusType } from '@/types';
import { QuotationStatus } from './QuotationStatus';
import { ROUTES } from '@/constants/routes';
import { showToast } from '@/stores/toast.store';

interface QuotationListProps {
  quotations: Quotation[];
  onOpenQuotation?: (quote: Quotation) => void;
  className?: string;
}

export function QuotationList({
  quotations,
  onOpenQuotation,
  className = '',
}: QuotationListProps) {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'quoteNumber' | 'customer' | 'amount' | 'margin' | 'date'>('quoteNumber');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Extract unique customers for customer filter
  const uniqueCustomers = useMemo(() => {
    const set = new Set<string>();
    quotations.forEach((q) => {
      if (q.customerName) set.add(q.customerName);
    });
    return Array.from(set);
  }, [quotations]);

  // Filter logic
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      // Search
      const sq = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !sq ||
        q.quoteNumber.toLowerCase().includes(sq) ||
        q.customerName.toLowerCase().includes(sq) ||
        (q.title && q.title.toLowerCase().includes(sq));

      // Status
      const matchesStatus =
        selectedStatus === 'ALL' ||
        q.status.toUpperCase() === selectedStatus.toUpperCase() ||
        (selectedStatus === 'PENDING_APPROVAL' && (q.status === 'IN_REVIEW' || q.status === 'PENDING_APPROVAL'));

      // Customer
      const matchesCustomer =
        selectedCustomer === 'ALL' ||
        q.customerName.toLowerCase() === selectedCustomer.toLowerCase();

      // Date filter simulation
      let matchesDate = true;
      if (selectedDateFilter === 'THIS_MONTH') {
        matchesDate = q.createdAt ? q.createdAt.includes('2026-09') : true;
      } else if (selectedDateFilter === 'LAST_MONTH') {
        matchesDate = q.createdAt ? q.createdAt.includes('2026-08') : true;
      }

      return matchesSearch && matchesStatus && matchesCustomer && matchesDate;
    });
  }, [quotations, searchQuery, selectedStatus, selectedCustomer, selectedDateFilter]);

  // Sort logic
  const sortedQuotations = useMemo(() => {
    return [...filteredQuotations].sort((a, b) => {
      let valA: any = a.quoteNumber;
      let valB: any = b.quoteNumber;

      if (sortField === 'customer') {
        valA = a.customerName;
        valB = b.customerName;
      } else if (sortField === 'amount') {
        valA = a.summary.grandTotal;
        valB = b.summary.grandTotal;
      } else if (sortField === 'margin') {
        valA = a.summary.overallMarginPct;
        valB = b.summary.overallMarginPct;
      } else if (sortField === 'date') {
        valA = a.createdAt;
        valB = b.createdAt;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredQuotations, sortField, sortAsc]);

  // Pagination logic
  const totalPages = Math.ceil(sortedQuotations.length / itemsPerPage) || 1;
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedQuotations.slice(start, start + itemsPerPage);
  }, [sortedQuotations, currentPage]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleRowAction = (quote: Quotation) => {
    if (onOpenQuotation) {
      onOpenQuotation(quote);
    } else {
      navigate(ROUTES.APP.QUOTATION_DETAIL(quote.id));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters Bar */}
      <div
        className="card p-4"
        style={{
          background: 'var(--surface)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <input
            type="text"
            className="field-input"
            placeholder="🔍 Search quotations by #, customer, title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Status Dropdown */}
          <select
            className="field-input"
            style={{ width: 'auto', minWidth: '130px' }}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Status: All</option>
            <option value="DRAFT">🟡 Draft</option>
            <option value="PENDING_APPROVAL">🔵 Pending Approval</option>
            <option value="APPROVED">🟢 Approved</option>
            <option value="REJECTED">🔴 Rejected</option>
            <option value="NEGOTIATION">🟣 Negotiation</option>
            <option value="CONFIRMED">🟢 Confirmed</option>
            <option value="EXPIRED">⚪ Expired</option>
            <option value="CANCELLED">⚪ Cancelled</option>
          </select>

          {/* Customer Dropdown */}
          <select
            className="field-input"
            style={{ width: 'auto', minWidth: '140px' }}
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Customer: All</option>
            {uniqueCustomers.map((cust) => (
              <option key={cust} value={cust}>
                {cust}
              </option>
            ))}
          </select>

          {/* Date Filter Dropdown */}
          <select
            className="field-input"
            style={{ width: 'auto', minWidth: '120px' }}
            value={selectedDateFilter}
            onChange={(e) => {
              setSelectedDateFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Date: All</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
          </select>

          {(searchQuery || selectedStatus !== 'ALL' || selectedCustomer !== 'ALL' || selectedDateFilter !== 'ALL') && (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
                setSelectedCustomer('ALL');
                setSelectedDateFilter('ALL');
                setCurrentPage(1);
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden" style={{ background: 'var(--surface)' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('quoteNumber')}
                  title="Sort by quote #"
                >
                  Quote #{sortField === 'quoteNumber' ? (sortAsc ? ' ↑' : ' ↓') : ''}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('customer')}
                  title="Sort by customer"
                >
                  Customer {sortField === 'customer' ? (sortAsc ? ' ↑' : ' ↓') : ''}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('amount')}
                  title="Sort by amount"
                >
                  Amount {sortField === 'amount' ? (sortAsc ? ' ↑' : ' ↓') : ''}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('margin')}
                  title="Sort by margin"
                >
                  Margin {sortField === 'margin' ? (sortAsc ? ' ↑' : ' ↓') : ''}
                </th>
                <th>Status</th>
                <th>Rep</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No quotations found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((q) => (
                  <tr key={q.id}>
                    <td className="td-bold text-accent font-mono">{q.quoteNumber}</td>
                    <td>
                      <div className="font-semibold text-xs text-foreground">{q.customerName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {q.customerTier ? `${q.customerTier} Tier · ` : ''}
                        {q.summary.currency}
                      </div>
                    </td>
                    <td className="font-mono font-bold text-foreground">
                      ${q.summary.grandTotal.toLocaleString()}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            q.summary.overallMarginPct >= 25
                              ? 'var(--green)'
                              : q.summary.overallMarginPct >= 15
                              ? 'var(--amber)'
                              : 'var(--red)',
                        }}
                      >
                        {q.summary.overallMarginPct.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <QuotationStatus status={q.status} />
                    </td>
                    <td className="td-muted">{q.assignedRepName || 'A. Morgan'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleRowAction(q)}
                      >
                        Open Builder →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedQuotations.length)} of{' '}
            {sortedQuotations.length} quotes
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </button>
            <span style={{ padding: '2px 8px', alignSelf: 'center', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

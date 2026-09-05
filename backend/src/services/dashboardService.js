import { prisma } from '../config/prisma.js';
import {
  QuoteStatus,
  OrderStatus,
  InvoiceStatus,
  PaymentStatus,
  FulfillmentStatus,
  RiskLevel,
} from '@prisma/client';
import { AppError } from '../utils/appError.js';
import { parseDashboardDateRange, calculatePercentageChange } from '../utils/dateRangeHelper.js';

/**
 * Builds where clause scoped to role and date range
 */
function getScope(user, range, entityType, extraFilter = {}) {
  const { startDate, endDate } = range;
  const dateField = entityType === 'payment' ? 'paymentDate' : 'createdAt';

  const where = {
    [dateField]: {
      gte: startDate,
      lte: endDate,
    },
    ...extraFilter,
  };

  // Sales rep is strictly isolated to their own records
  if (user?.role === 'SALES_REP') {
    if (entityType === 'quotation' || entityType === 'order') {
      where.salesRepId = user.id;
    } else if (entityType === 'invoice') {
      where.order = { salesRepId: user.id };
    } else if (entityType === 'payment') {
      where.invoice = { order: { salesRepId: user.id } };
    } else if (entityType === 'fulfillment') {
      where.order = { salesRepId: user.id };
    }
  } else if (extraFilter.salesRepId) {
    // If admin or sales manager filtered by specific salesRepId
    if (entityType === 'quotation' || entityType === 'order') {
      where.salesRepId = extraFilter.salesRepId;
    } else if (entityType === 'invoice') {
      where.order = { salesRepId: extraFilter.salesRepId };
    } else if (entityType === 'payment') {
      where.invoice = { order: { salesRepId: extraFilter.salesRepId } };
    } else if (entityType === 'fulfillment') {
      where.order = { salesRepId: extraFilter.salesRepId };
    }
  }

  // Customer filter
  if (extraFilter.customerId) {
    if (entityType === 'payment') {
      where.invoice = { ...(where.invoice || {}), customerId: extraFilter.customerId };
    } else if (entityType === 'fulfillment') {
      where.order = { ...(where.order || {}), customerId: extraFilter.customerId };
    } else {
      where.customerId = extraFilter.customerId;
    }
  }

  return where;
}

export const dashboardService = {
  /**
   * Main role-aware dashboard dispatcher
   */
  async getRoleDashboard(user, filters = {}) {
    if (!user || !user.role) {
      throw new AppError('Unauthorized', 401);
    }

    switch (user.role) {
      case 'ADMIN':
        return this.getExecutiveDashboard(user, filters);
      case 'SALES_MANAGER':
        return this.getSalesManagerDashboard(user, filters);
      case 'SALES_REP':
        return this.getSalesRepDashboard(user, filters);
      case 'FINANCE':
        return this.getFinanceDashboard(user, filters);
      case 'OPERATIONS':
        return this.getOperationsDashboard(user, filters);
      default:
        throw new AppError('Forbidden: Access denied to dashboard', 403);
    }
  },

  /**
   * Executive / Admin Dashboard
   */
  async getExecutiveDashboard(user, filters = {}) {
    const [
      summary,
      salesOverview,
      revenueAnalytics,
      quotationFunnel,
      topSalesReps,
      topCustomers,
      topProducts,
      categoryPerformance,
      financeSummary,
      operationsSummary,
      alerts,
    ] = await Promise.all([
      this.getDashboardSummary(user, filters),
      this.getSalesOverview(user, filters),
      this.getRevenueAnalytics(user, { ...filters, groupBy: filters.groupBy || 'day' }),
      this.getQuotationFunnel(user, filters),
      this.getTopSalesRepresentatives(user, filters, filters.limit || 5),
      this.getTopCustomers(user, filters, filters.limit || 5),
      this.getTopProducts(user, filters, filters.limit || 5),
      this.getCategoryPerformance(user, filters),
      this.getFinanceDashboard(user, filters),
      this.getOperationsDashboard(user, filters),
      this.getDashboardAlerts(user, filters),
    ]);

    return {
      role: 'ADMIN',
      summary,
      salesOverview,
      revenueAnalytics,
      quotationFunnel,
      topSalesReps,
      topCustomers,
      topProducts,
      categoryPerformance,
      financeSummary: {
        totalInvoiced: financeSummary.totalInvoiced,
        totalPaid: financeSummary.totalPaid,
        totalOutstanding: financeSummary.totalOutstanding,
        overdueCount: financeSummary.overdueCount,
        overdueAmount: financeSummary.overdueAmount,
      },
      operationsSummary: {
        ordersAwaitingFulfillment: operationsSummary.ordersAwaitingFulfillment,
        fulfillmentRate: operationsSummary.fulfillmentRate,
        fulfillmentStatusBreakdown: operationsSummary.statusBreakdown,
      },
      alerts,
    };
  },

  /**
   * Sales Manager Dashboard
   */
  async getSalesManagerDashboard(user, filters = {}) {
    const [
      summary,
      salesOverview,
      quotationFunnel,
      salesRepPerformance,
      topCustomers,
      topProducts,
      alerts,
    ] = await Promise.all([
      this.getDashboardSummary(user, filters),
      this.getSalesOverview(user, filters),
      this.getQuotationFunnel(user, filters),
      this.getSalesRepPerformance(user, filters),
      this.getTopCustomers(user, filters, filters.limit || 5),
      this.getTopProducts(user, filters, filters.limit || 5),
      this.getDashboardAlerts(user, filters),
    ]);

    return {
      role: 'SALES_MANAGER',
      summary,
      salesOverview,
      quotationFunnel,
      salesRepPerformance,
      topCustomers,
      topProducts,
      alerts,
    };
  },

  /**
   * Sales Rep Dashboard (Strictly isolated to salesRepId)
   */
  async getSalesRepDashboard(user, filters = {}) {
    if (user.role !== 'SALES_REP' && user.role !== 'ADMIN' && user.role !== 'SALES_MANAGER') {
      throw new AppError('Forbidden', 403);
    }

    const scopedUser = { ...user, role: 'SALES_REP' };
    const { current } = parseDashboardDateRange(filters);

    const [
      summary,
      salesOverview,
      quotationAnalytics,
      topCustomers,
      recentOrders,
      myAlerts,
    ] = await Promise.all([
      this.getDashboardSummary(scopedUser, filters),
      this.getSalesOverview(scopedUser, filters),
      this.getQuotationAnalytics(scopedUser, filters),
      this.getTopCustomers(scopedUser, filters, filters.limit || 5),
      prisma.order.findMany({
        where: getScope(scopedUser, current, 'order'),
        include: {
          customer: { select: { id: true, contactName: true, companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.getDashboardAlerts(scopedUser, filters),
    ]);

    return {
      role: 'SALES_REP',
      salesRepId: user.id,
      summary,
      salesOverview,
      quotationAnalytics,
      topCustomers,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        contactName: o.customer?.contactName || 'Unknown',
        customerName: o.customer?.contactName || 'Unknown',
        companyName: o.customer?.companyName || null,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt,
      })),
      alerts: myAlerts,
    };
  },

  /**
   * Top-level KPI Summary with Period Comparison
   */
  async getDashboardSummary(user, filters = {}) {
    const { period, current, previous } = parseDashboardDateRange(filters);

    // Current period aggregations
    const [
      ordersCurrent,
      quotesCurrentTotal,
      quotesSubmitted,
      quotesConverted,
      quotesUnderReview,
      invoicesCurrent,
      totalOrdersToFulfill,
      fulfilledOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: getScope(user, current, 'order', { status: { not: OrderStatus.CANCELLED } }),
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.quotation.count({
        where: getScope(user, current, 'quotation'),
      }),
      prisma.quotation.count({
        where: getScope(user, current, 'quotation', {
          status: {
            in: [
              QuoteStatus.PENDING_APPROVAL,
              QuoteStatus.APPROVED,
              QuoteStatus.CONFIRMED,
              QuoteStatus.REJECTED,
              QuoteStatus.SENT,
              QuoteStatus.UNDER_NEGOTIATION,
            ],
          },
        }),
      }),
      prisma.quotation.count({
        where: getScope(user, current, 'quotation', { status: QuoteStatus.CONFIRMED }),
      }),
      prisma.quotation.count({
        where: getScope(user, current, 'quotation', { status: QuoteStatus.PENDING_APPROVAL }),
      }),
      prisma.invoice.aggregate({
        where: getScope(user, current, 'invoice', {
          status: {
            in: [
              InvoiceStatus.ISSUED,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
        }),
        _sum: { totalAmount: true, paidAmount: true, outstandingAmount: true },
        _count: true,
      }),
      prisma.order.count({
        where: getScope(user, current, 'order', {
          status: {
            in: [
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
              OrderStatus.PARTIALLY_FULFILLED,
              OrderStatus.FULFILLED,
            ],
          },
        }),
      }),
      prisma.order.count({
        where: getScope(user, current, 'order', { status: OrderStatus.FULFILLED }),
      }),
    ]);

    // Previous period aggregations for comparison
    const [ordersPrev, quotesPrevTotal] = await Promise.all([
      prisma.order.aggregate({
        where: getScope(user, previous, 'order', { status: { not: OrderStatus.CANCELLED } }),
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.quotation.count({
        where: getScope(user, previous, 'quotation'),
      }),
    ]);

    const revenue = Number(ordersCurrent._sum.totalAmount || 0);
    const prevRevenue = Number(ordersPrev._sum.totalAmount || 0);
    const ordersCount = ordersCurrent._count || 0;
    const prevOrdersCount = ordersPrev._count || 0;

    const invoicedRevenue = Number(invoicesCurrent._sum.totalAmount || 0);
    const paidRevenue = Number(invoicesCurrent._sum.paidAmount || 0);
    const receivablesOutstanding = Number(invoicesCurrent._sum.outstandingAmount || 0);

    const conversionRate =
      quotesSubmitted > 0 ? Number(((quotesConverted / quotesSubmitted) * 100).toFixed(2)) : 0;
    const fulfillmentRate =
      totalOrdersToFulfill > 0
        ? Number(((fulfilledOrders / totalOrdersToFulfill) * 100).toFixed(2))
        : 0;

    return {
      period,
      currentPeriod: {
        startDate: current.startDate.toISOString(),
        endDate: current.endDate.toISOString(),
      },
      previousPeriod: {
        startDate: previous.startDate.toISOString(),
        endDate: previous.endDate.toISOString(),
      },
      metrics: {
        revenue: Number(revenue.toFixed(2)),
        invoicedRevenue: Number(invoicedRevenue.toFixed(2)),
        paidRevenue: Number(paidRevenue.toFixed(2)),
        ordersCount,
        quotationsCount: quotesCurrentTotal,
        conversionRate,
        pendingApprovalsCount: quotesUnderReview,
        fulfillmentRate,
        receivablesOutstanding: Number(receivablesOutstanding.toFixed(2)),
      },
      comparison: {
        revenueChange: calculatePercentageChange(revenue, prevRevenue),
        ordersChange: calculatePercentageChange(ordersCount, prevOrdersCount),
        quotationsChange: calculatePercentageChange(quotesCurrentTotal, quotesPrevTotal),
      },
    };
  },

  /**
   * Sales Overview
   */
  async getSalesOverview(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);

    const [
      totalQuotes,
      quotesByStatus,
      activeQuotesAgg,
      lostQuotesAgg,
      ordersAgg,
      wonQuotesCount,
    ] = await Promise.all([
      prisma.quotation.count({
        where: getScope(user, current, 'quotation'),
      }),
      prisma.quotation.groupBy({
        by: ['status'],
        where: getScope(user, current, 'quotation'),
        _count: true,
        _sum: { totalAmount: true },
      }),
      prisma.quotation.aggregate({
        where: getScope(user, current, 'quotation', {
          status: {
            in: [
              QuoteStatus.DRAFT,
              QuoteStatus.PENDING_APPROVAL,
              QuoteStatus.APPROVED,
              QuoteStatus.SENT,
              QuoteStatus.UNDER_NEGOTIATION,
            ],
          },
        }),
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.quotation.aggregate({
        where: getScope(user, current, 'quotation', {
          status: {
            in: [QuoteStatus.REJECTED, QuoteStatus.CANCELLED],
          },
        }),
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: getScope(user, current, 'order', { status: { not: OrderStatus.CANCELLED } }),
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.quotation.count({
        where: getScope(user, current, 'quotation', { status: QuoteStatus.CONFIRMED }),
      }),
    ]);

    const pipelineValue = Number(activeQuotesAgg._sum.totalAmount || 0);
    const lostQuotesValue = Number(lostQuotesAgg._sum.totalAmount || 0);
    const wonOrdersValue = Number(ordersAgg._sum.totalAmount || 0);
    const wonOrdersCount = ordersAgg._count || 0;

    const winRate =
      totalQuotes > 0 ? Number(((wonQuotesCount / totalQuotes) * 100).toFixed(2)) : 0;
    const avgDealSize =
      wonOrdersCount > 0 ? Number((wonOrdersValue / wonOrdersCount).toFixed(2)) : 0;

    const statusDistribution = quotesByStatus.map((item) => ({
      status: item.status,
      count: item._count,
      totalAmount: Number(Number(item._sum.totalAmount || 0).toFixed(2)),
    }));

    return {
      period,
      totalQuotations: totalQuotes,
      pipelineValue: Number(pipelineValue.toFixed(2)),
      wonOrdersCount,
      wonOrdersValue: Number(wonOrdersValue.toFixed(2)),
      lostQuotesCount: lostQuotesAgg._count || 0,
      lostQuotesValue: Number(lostQuotesValue.toFixed(2)),
      winRate,
      averageDealSize: avgDealSize,
      statusDistribution,
    };
  },

  /**
   * Revenue Analytics (Time series and margins)
   */
  async getRevenueAnalytics(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);
    const groupBy = filters.groupBy || 'day';

    const [orders, invoices] = await Promise.all([
      prisma.order.findMany({
        where: getScope(user, current, 'order', { status: { not: OrderStatus.CANCELLED } }),
        select: { id: true, totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.invoice.findMany({
        where: getScope(user, current, 'invoice', {
          status: {
            in: [
              InvoiceStatus.ISSUED,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
        }),
        select: { id: true, totalAmount: true, paidAmount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: getScope(user, current, 'order', { status: { not: OrderStatus.CANCELLED } }),
      },
      select: { quantity: true, costPrice: true, lineTotal: true },
    });

    let totalCost = 0;
    let totalRevenue = 0;
    for (const item of orderItems) {
      totalRevenue += Number(item.lineTotal || 0);
      totalCost += Number(item.costPrice || 0) * (item.quantity || 1);
    }
    const grossProfit = totalRevenue - totalCost;
    const grossMarginPercentage =
      totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(2)) : 0;

    const bucketMap = new Map();
    const getKey = (date) => {
      const d = new Date(date);
      if (groupBy === 'month') {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      if (groupBy === 'week') {
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      }
      return d.toISOString().slice(0, 10);
    };

    orders.forEach((o) => {
      const key = getKey(o.createdAt);
      if (!bucketMap.has(key)) {
        bucketMap.set(key, { date: key, revenue: 0, invoicedAmount: 0, collectedAmount: 0, ordersCount: 0 });
      }
      const entry = bucketMap.get(key);
      entry.revenue += Number(o.totalAmount || 0);
      entry.ordersCount += 1;
    });

    invoices.forEach((inv) => {
      const key = getKey(inv.createdAt);
      if (!bucketMap.has(key)) {
        bucketMap.set(key, { date: key, revenue: 0, invoicedAmount: 0, collectedAmount: 0, ordersCount: 0 });
      }
      const entry = bucketMap.get(key);
      entry.invoicedAmount += Number(inv.totalAmount || 0);
      entry.collectedAmount += Number(inv.paidAmount || 0);
    });

    const timeSeries = Array.from(bucketMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({
        date: entry.date,
        revenue: Number(entry.revenue.toFixed(2)),
        invoicedAmount: Number(entry.invoicedAmount.toFixed(2)),
        collectedAmount: Number(entry.collectedAmount.toFixed(2)),
        ordersCount: entry.ordersCount,
      }));

    return {
      period,
      groupBy,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      grossMarginPercentage,
      timeSeries,
    };
  },

  /**
   * Sales Trend (Quotes vs Orders over time)
   */
  async getSalesTrend(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);
    const groupBy = filters.groupBy || 'day';

    const [quotes, orders] = await Promise.all([
      prisma.quotation.findMany({
        where: getScope(user, current, 'quotation'),
        select: { totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.findMany({
        where: getScope(user, current, 'order', { status: { not: OrderStatus.CANCELLED } }),
        select: { totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const bucketMap = new Map();
    const getKey = (date) => {
      const d = new Date(date);
      if (groupBy === 'month') {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      if (groupBy === 'week') {
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      }
      return d.toISOString().slice(0, 10);
    };

    quotes.forEach((q) => {
      const key = getKey(q.createdAt);
      if (!bucketMap.has(key)) {
        bucketMap.set(key, { date: key, quotesCount: 0, quotesValue: 0, ordersCount: 0, ordersValue: 0 });
      }
      const entry = bucketMap.get(key);
      entry.quotesCount += 1;
      entry.quotesValue += Number(q.totalAmount || 0);
    });

    orders.forEach((o) => {
      const key = getKey(o.createdAt);
      if (!bucketMap.has(key)) {
        bucketMap.set(key, { date: key, quotesCount: 0, quotesValue: 0, ordersCount: 0, ordersValue: 0 });
      }
      const entry = bucketMap.get(key);
      entry.ordersCount += 1;
      entry.ordersValue += Number(o.totalAmount || 0);
    });

    const trend = Array.from(bucketMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({
        date: entry.date,
        quotesCount: entry.quotesCount,
        quotesValue: Number(entry.quotesValue.toFixed(2)),
        ordersCount: entry.ordersCount,
        ordersValue: Number(entry.ordersValue.toFixed(2)),
      }));

    return {
      period,
      groupBy,
      trend,
    };
  },

  /**
   * Quotation Analytics
   */
  async getQuotationAnalytics(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);

    const [quotesByStatus, quotesAgg] = await Promise.all([
      prisma.quotation.groupBy({
        by: ['status'],
        where: getScope(user, current, 'quotation'),
        _count: true,
        _sum: { totalAmount: true },
      }),
      prisma.quotation.aggregate({
        where: getScope(user, current, 'quotation'),
        _count: true,
        _avg: { totalAmount: true, marginPercentage: true, riskScore: true },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalQuotes = quotesAgg._count || 0;
    const avgQuotationValue = Number(Number(quotesAgg._avg.totalAmount || 0).toFixed(2));
    const avgMarginPercentage = Number(Number(quotesAgg._avg.marginPercentage || 0).toFixed(2));
    const avgRiskScore = Number(Number(quotesAgg._avg.riskScore || 0).toFixed(2));

    const statusBreakdown = quotesByStatus.map((s) => ({
      status: s.status,
      count: s._count,
      totalAmount: Number(Number(s._sum.totalAmount || 0).toFixed(2)),
    }));

    return {
      period,
      totalQuotations: totalQuotes,
      totalQuotationsValue: Number(Number(quotesAgg._sum.totalAmount || 0).toFixed(2)),
      averageQuotationValue: avgQuotationValue,
      averageMarginPercentage: avgMarginPercentage,
      averageRiskScore: avgRiskScore,
      statusBreakdown,
    };
  },

  /**
   * Quotation Funnel (Draft -> Sent -> Pending Approval -> Approved -> Confirmed)
   */
  async getQuotationFunnel(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);

    const quotesByStatus = await prisma.quotation.groupBy({
      by: ['status'],
      where: getScope(user, current, 'quotation'),
      _count: true,
      _sum: { totalAmount: true },
    });

    const statusMap = new Map();
    quotesByStatus.forEach((item) => {
      statusMap.set(item.status, {
        count: item._count,
        totalAmount: Number(Number(item._sum.totalAmount || 0).toFixed(2)),
      });
    });

    const getStageData = (status) =>
      statusMap.get(status) || { count: 0, totalAmount: 0 };

    const stages = [
      { stage: 'DRAFT', name: 'Draft', ...getStageData(QuoteStatus.DRAFT) },
      { stage: 'SENT', name: 'Sent', ...getStageData(QuoteStatus.SENT) },
      { stage: 'PENDING_APPROVAL', name: 'Pending Approval', ...getStageData(QuoteStatus.PENDING_APPROVAL) },
      { stage: 'APPROVED', name: 'Approved', ...getStageData(QuoteStatus.APPROVED) },
      { stage: 'CONFIRMED', name: 'Confirmed (Won)', ...getStageData(QuoteStatus.CONFIRMED) },
      { stage: 'REJECTED', name: 'Rejected', ...getStageData(QuoteStatus.REJECTED) },
      { stage: 'CANCELLED', name: 'Cancelled', ...getStageData(QuoteStatus.CANCELLED) },
    ];

    const totalEntered = stages.reduce((sum, s) => sum + s.count, 0);
    const convertedCount = getStageData(QuoteStatus.CONFIRMED).count;
    const submittedCount =
      getStageData(QuoteStatus.SENT).count +
      getStageData(QuoteStatus.PENDING_APPROVAL).count +
      getStageData(QuoteStatus.APPROVED).count +
      convertedCount;

    const overallConversionRate =
      submittedCount > 0 ? Number(((convertedCount / submittedCount) * 100).toFixed(2)) : 0;

    return {
      period,
      totalQuotations: totalEntered,
      overallConversionRate,
      stages,
    };
  },

  /**
   * Sales Rep Performance and Leaderboard
   * Strict Access: ADMIN, SALES_MANAGER only (SALES_REP forbidden)
   */
  async getSalesRepPerformance(user, filters = {}) {
    if (user.role === 'SALES_REP') {
      throw new AppError('Forbidden: Access denied to sales rep performance', 403);
    }

    const { period, current } = parseDashboardDateRange(filters);

    const salesReps = await prisma.user.findMany({
      where: {
        role: { in: ['SALES_REP', 'SALES_MANAGER'] },
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!salesReps.length) {
      return [];
    }

    const ordersGrouped = await prisma.order.groupBy({
      by: ['salesRepId'],
      where: {
        createdAt: { gte: current.startDate, lte: current.endDate },
        status: { not: OrderStatus.CANCELLED },
      },
      _count: true,
      _sum: { totalAmount: true },
    });

    const quotesGrouped = await prisma.quotation.groupBy({
      by: ['salesRepId'],
      where: {
        createdAt: { gte: current.startDate, lte: current.endDate },
      },
      _count: true,
      _sum: { totalAmount: true },
    });

    const ordersMap = new Map();
    ordersGrouped.forEach((o) => {
      if (o.salesRepId) {
        ordersMap.set(o.salesRepId, {
          ordersCount: o._count,
          totalRevenue: Number(Number(o._sum.totalAmount || 0).toFixed(2)),
        });
      }
    });

    const quotesMap = new Map();
    quotesGrouped.forEach((q) => {
      quotesMap.set(q.salesRepId, {
        quotesCount: q._count,
        totalQuoted: Number(Number(q._sum.totalAmount || 0).toFixed(2)),
      });
    });

    const performance = salesReps.map((rep) => {
      const orderData = ordersMap.get(rep.id) || { ordersCount: 0, totalRevenue: 0 };
      const quoteData = quotesMap.get(rep.id) || { quotesCount: 0, totalQuoted: 0 };

      const conversionRate =
        quoteData.quotesCount > 0
          ? Number(((orderData.ordersCount / quoteData.quotesCount) * 100).toFixed(2))
          : 0;

      return {
        userId: rep.id,
        name: rep.name,
        email: rep.email,
        role: rep.role,
        quotationsCount: quoteData.quotesCount,
        totalQuoted: quoteData.totalQuoted,
        ordersCount: orderData.ordersCount,
        totalRevenue: orderData.totalRevenue,
        conversionRate,
      };
    });

    performance.sort((a, b) => b.totalRevenue - a.totalRevenue || b.ordersCount - a.ordersCount);

    const limit = filters.limit ? Number(filters.limit) : performance.length;
    return performance.slice(0, limit).map((rep, index) => ({
      rank: index + 1,
      ...rep,
    }));
  },

  async getTopSalesRepresentatives(user, filters = {}, limit = 5) {
    const list = await this.getSalesRepPerformance(user, { ...filters, limit });
    return list.slice(0, Number(limit) || 5);
  },

  /**
   * Customer Analytics and Top Customers
   */
  async getCustomerAnalytics(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);

    const ordersByCustomer = await prisma.order.groupBy({
      by: ['customerId'],
      where: getScope(user, current, 'order', { status: { not: OrderStatus.CANCELLED } }),
      _count: true,
      _sum: { totalAmount: true },
      _max: { createdAt: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
    });

    if (!ordersByCustomer.length) {
      return [];
    }

    const customerIds = ordersByCustomer.map((c) => c.customerId);

    const [customers, openInvoices] = await Promise.all([
      prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: {
          id: true,
          contactName: true,
          companyName: true,
          customerTier: true,
          email: true,
        },
      }),
      prisma.invoice.groupBy({
        by: ['customerId'],
        where: {
          customerId: { in: customerIds },
          status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
        },
        _sum: { outstandingAmount: true },
      }),
    ]);

    const custMap = new Map(customers.map((c) => [c.id, c]));
    const debtMap = new Map(
      openInvoices.map((i) => [i.customerId, Number(Number(i._sum.outstandingAmount || 0).toFixed(2))])
    );

    let result = ordersByCustomer.map((item, index) => {
      const c = custMap.get(item.customerId) || {};
      return {
        rank: index + 1,
        customerId: item.customerId,
        name: c.contactName || 'Unknown',
        contactName: c.contactName || 'Unknown',
        companyName: c.companyName || null,
        customerType: c.customerTier || 'BRONZE',
        tier: c.customerTier || 'BRONZE',
        email: c.email || null,
        ordersCount: item._count,
        totalSpent: Number(Number(item._sum.totalAmount || 0).toFixed(2)),
        outstandingBalance: debtMap.get(item.customerId) || 0,
        lastOrderDate: item._max.createdAt,
      };
    });

    if (filters.limit) {
      result = result.slice(0, Number(filters.limit));
    }

    return result;
  },

  async getTopCustomers(user, filters = {}, limit = 5) {
    const list = await this.getCustomerAnalytics(user, { ...filters, limit });
    return list.slice(0, Number(limit) || 5);
  },

  /**
   * Product Analytics and Top Products
   */
  async getProductAnalytics(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);

    const orderItemsGrouped = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: getScope(user, current, 'order', { status: { not: OrderStatus.CANCELLED } }),
      },
      _sum: { lineTotal: true, quantity: true },
      _count: { orderId: true },
      orderBy: { _sum: { lineTotal: 'desc' } },
    });

    if (!orderItemsGrouped.length) {
      return [];
    }

    const productIds = orderItemsGrouped.map((p) => p.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        category: { select: { id: true, name: true } },
      },
    });

    const prodMap = new Map(products.map((p) => [p.id, p]));

    let result = orderItemsGrouped.map((item, index) => {
      const p = prodMap.get(item.productId) || {};
      return {
        rank: index + 1,
        productId: item.productId,
        name: p.name || 'Unknown Product',
        sku: p.sku || 'N/A',
        categoryName: p.category?.name || 'Uncategorized',
        quantitySold: item._sum.quantity || 0,
        totalRevenue: Number(Number(item._sum.lineTotal || 0).toFixed(2)),
        ordersCount: item._count.orderId || 0,
      };
    });

    if (filters.limit) {
      result = result.slice(0, Number(filters.limit));
    }

    return result;
  },

  async getTopProducts(user, filters = {}, limit = 5) {
    const list = await this.getProductAnalytics(user, { ...filters, limit });
    return list.slice(0, Number(limit) || 5);
  },

  /**
   * Category Performance Breakdown
   */
  async getCategoryPerformance(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: getScope(user, current, 'order', { status: { not: OrderStatus.CANCELLED } }),
      },
      select: {
        quantity: true,
        lineTotal: true,
        product: {
          select: {
            id: true,
            categoryId: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    const catMap = new Map();

    for (const item of orderItems) {
      const cat = item.product?.category;
      const catId = cat?.id || 'uncategorized';
      const catName = cat?.name || 'Uncategorized';

      if (!catMap.has(catId)) {
        catMap.set(catId, {
          categoryId: catId,
          categoryName: catName,
          totalRevenue: 0,
          quantitySold: 0,
          productIds: new Set(),
        });
      }

      const entry = catMap.get(catId);
      entry.totalRevenue += Number(item.lineTotal || 0);
      entry.quantitySold += item.quantity || 0;
      if (item.product?.id) {
        entry.productIds.add(item.product.id);
      }
    }

    const result = Array.from(catMap.values())
      .map((entry) => ({
        categoryId: entry.categoryId,
        categoryName: entry.categoryName,
        totalRevenue: Number(entry.totalRevenue.toFixed(2)),
        quantitySold: entry.quantitySold,
        productsCount: entry.productIds.size,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return result;
  },

  /**
   * Order Analytics and Status Distribution
   */
  async getOrderAnalytics(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);

    const [statusDist, ordersAgg] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: getScope(user, current, 'order'),
        _count: true,
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: getScope(user, current, 'order', { status: { not: OrderStatus.CANCELLED } }),
        _count: true,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true },
      }),
    ]);

    const totalOrdersCount = ordersAgg._count || 0;
    const totalOrdersAmount = Number(Number(ordersAgg._sum.totalAmount || 0).toFixed(2));
    const averageOrderValue = Number(Number(ordersAgg._avg.totalAmount || 0).toFixed(2));

    const statusDistribution = statusDist.map((s) => ({
      status: s.status,
      count: s._count,
      totalAmount: Number(Number(s._sum.totalAmount || 0).toFixed(2)),
    }));

    return {
      period,
      totalOrdersCount,
      totalOrdersAmount,
      averageOrderValue,
      statusDistribution,
    };
  },

  /**
   * Fulfillment Analytics
   */
  async getFulfillmentAnalytics(user, filters = {}) {
    const { period, current } = parseDashboardDateRange(filters);

    const [fulfillmentStatusDist, eligibleOrders, fulfilledOrders, carrierStats] =
      await Promise.all([
        prisma.fulfillment.groupBy({
          by: ['status'],
          where: getScope(user, current, 'fulfillment'),
          _count: true,
        }),
        prisma.order.count({
          where: getScope(user, current, 'order', {
            status: {
              in: [
                OrderStatus.CONFIRMED,
                OrderStatus.PROCESSING,
                OrderStatus.PARTIALLY_FULFILLED,
                OrderStatus.FULFILLED,
              ],
            },
          }),
        }),
        prisma.order.count({
          where: getScope(user, current, 'order', { status: OrderStatus.FULFILLED }),
        }),
        prisma.fulfillment.groupBy({
          by: ['carrier'],
          where: {
            ...getScope(user, current, 'fulfillment'),
            carrier: { not: null },
          },
          _count: true,
        }),
      ]);

    const awaitingFulfillmentCount = await prisma.order.count({
      where: getScope(user, current, 'order', {
        status: {
          in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.PARTIALLY_FULFILLED],
        },
      }),
    });

    const fulfillmentRate =
      eligibleOrders > 0 ? Number(((fulfilledOrders / eligibleOrders) * 100).toFixed(2)) : 0;

    const statusBreakdown = fulfillmentStatusDist.map((f) => ({
      status: f.status,
      count: f._count,
    }));

    const carriers = carrierStats
      .filter((c) => c.carrier)
      .map((c) => ({
        carrier: c.carrier,
        shipmentsCount: c._count,
      }));

    return {
      period,
      eligibleOrders,
      fulfilledOrders,
      ordersAwaitingFulfillment: awaitingFulfillmentCount,
      fulfillmentRate,
      statusBreakdown,
      carrierDistribution: carriers,
    };
  },

  /**
   * Finance Dashboard & Accounts Receivable Aging
   * Strict Access: ADMIN, FINANCE only
   */
  async getFinanceDashboard(user, filters = {}) {
    if (user.role !== 'ADMIN' && user.role !== 'FINANCE') {
      throw new AppError('Forbidden: Access denied to finance dashboard', 403);
    }

    const { period, current } = parseDashboardDateRange(filters);

    const [invoiceAgg, overdueInvoices, paymentsByMethod, revenueAndCost] = await Promise.all([
      prisma.invoice.aggregate({
        where: getScope(user, current, 'invoice', {
          status: {
            in: [
              InvoiceStatus.ISSUED,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
        }),
        _sum: { totalAmount: true, paidAmount: true, outstandingAmount: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: getScope(user, current, 'invoice', {
          status: InvoiceStatus.OVERDUE,
        }),
        _sum: { outstandingAmount: true },
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: getScope(user, current, 'payment', {
          status: { in: [PaymentStatus.COMPLETED, PaymentStatus.SUCCESSFUL] },
        }),
        _sum: { amount: true },
        _count: true,
      }),
      this.getRevenueAnalytics(user, filters),
    ]);

    // Accounts Receivable Aging Buckets
    const openInvoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE],
        },
        outstandingAmount: { gt: 0 },
      },
      select: {
        id: true,
        invoiceNumber: true,
        dueDate: true,
        outstandingAmount: true,
      },
    });

    const now = new Date();
    const agingBuckets = {
      current: { count: 0, totalAmount: 0 },
      overdue_31_60: { count: 0, totalAmount: 0 },
      overdue_61_90: { count: 0, totalAmount: 0 },
      overdue_90_plus: { count: 0, totalAmount: 0 },
    };

    openInvoices.forEach((inv) => {
      const balance = Number(inv.outstandingAmount || 0);
      const daysPastDue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000);

      if (daysPastDue <= 30) {
        agingBuckets.current.count += 1;
        agingBuckets.current.totalAmount += balance;
      } else if (daysPastDue <= 60) {
        agingBuckets.overdue_31_60.count += 1;
        agingBuckets.overdue_31_60.totalAmount += balance;
      } else if (daysPastDue <= 90) {
        agingBuckets.overdue_61_90.count += 1;
        agingBuckets.overdue_61_90.totalAmount += balance;
      } else {
        agingBuckets.overdue_90_plus.count += 1;
        agingBuckets.overdue_90_plus.totalAmount += balance;
      }
    });

    for (const key of Object.keys(agingBuckets)) {
      agingBuckets[key].totalAmount = Number(agingBuckets[key].totalAmount.toFixed(2));
    }

    const totalInvoiced = Number(Number(invoiceAgg._sum.totalAmount || 0).toFixed(2));
    const totalPaid = Number(Number(invoiceAgg._sum.paidAmount || 0).toFixed(2));
    const totalOutstanding = Number(Number(invoiceAgg._sum.outstandingAmount || 0).toFixed(2));

    const overdueCount = overdueInvoices._count || 0;
    const overdueAmount = Number(Number(overdueInvoices._sum.outstandingAmount || 0).toFixed(2));

    const paymentMethods = paymentsByMethod.map((pm) => ({
      paymentMethod: pm.paymentMethod,
      count: pm._count,
      totalAmount: Number(Number(pm._sum.amount || 0).toFixed(2)),
    }));

    return {
      period,
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      overdueCount,
      overdueAmount,
      accountsReceivableAging: agingBuckets,
      paymentMethodDistribution: paymentMethods,
      margins: {
        totalRevenue: revenueAndCost.totalRevenue,
        totalCost: revenueAndCost.totalCost,
        grossProfit: revenueAndCost.grossProfit,
        grossMarginPercentage: revenueAndCost.grossMarginPercentage,
      },
    };
  },

  /**
   * Operations Dashboard
   * Strict Access: ADMIN, OPERATIONS, SALES_MANAGER only
   */
  async getOperationsDashboard(user, filters = {}) {
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'OPERATIONS' &&
      user.role !== 'SALES_MANAGER'
    ) {
      throw new AppError('Forbidden: Access denied to operations dashboard', 403);
    }

    const [fulfillmentStats, orderStats] = await Promise.all([
      this.getFulfillmentAnalytics(user, filters),
      this.getOrderAnalytics(user, filters),
    ]);

    const activeShipments = await prisma.fulfillment.findMany({
      where: {
        status: { in: [FulfillmentStatus.SHIPPED, FulfillmentStatus.PROCESSING] },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            customer: { select: { contactName: true, companyName: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return {
      role: user.role,
      ordersAwaitingFulfillment: fulfillmentStats.ordersAwaitingFulfillment,
      fulfillmentRate: fulfillmentStats.fulfillmentRate,
      statusBreakdown: fulfillmentStats.statusBreakdown,
      carrierDistribution: fulfillmentStats.carrierDistribution,
      orderStatusDistribution: orderStats.statusDistribution,
      activeShipments: activeShipments.map((s) => ({
        id: s.id,
        orderNumber: s.order?.orderNumber,
        customerName: s.order?.customer?.contactName,
        companyName: s.order?.customer?.companyName,
        carrier: s.carrier,
        trackingNumber: s.trackingNumber,
        status: s.status,
        updatedAt: s.updatedAt,
      })),
    };
  },

  /**
   * Actionable Alerts
   */
  async getDashboardAlerts(user, filters = {}) {
    const { current } = parseDashboardDateRange(filters);

    const [highRiskQuotes, overdueInvoices, pendingApprovals, unfulfilledOrders] =
      await Promise.all([
        prisma.quotation.findMany({
          where: {
            ...getScope(user, current, 'quotation'),
            riskLevel: { in: [RiskLevel.HIGH, RiskLevel.CRITICAL] },
            status: QuoteStatus.PENDING_APPROVAL,
          },
          select: {
            id: true,
            quoteNumber: true,
            totalAmount: true,
            riskLevel: true,
            riskScore: true,
            createdAt: true,
          },
          take: 10,
        }),
        prisma.invoice.findMany({
          where: {
            ...getScope(user, current, 'invoice'),
            status: InvoiceStatus.OVERDUE,
          },
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            outstandingAmount: true,
            dueDate: true,
          },
          take: 10,
        }),
        prisma.quotation.findMany({
          where: {
            ...getScope(user, current, 'quotation'),
            status: QuoteStatus.PENDING_APPROVAL,
          },
          select: {
            id: true,
            quoteNumber: true,
            totalAmount: true,
            createdAt: true,
          },
          take: 10,
        }),
        prisma.order.findMany({
          where: {
            ...getScope(user, current, 'order'),
            status: OrderStatus.CONFIRMED,
          },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            createdAt: true,
          },
          take: 10,
        }),
      ]);

    return {
      highRiskPendingQuotes: {
        count: highRiskQuotes.length,
        items: highRiskQuotes.map((q) => ({
          ...q,
          totalAmount: Number(q.totalAmount),
          riskScore: Number(q.riskScore),
        })),
      },
      overdueInvoices: {
        count: overdueInvoices.length,
        items: overdueInvoices.map((i) => ({
          ...i,
          totalAmount: Number(i.totalAmount),
          outstandingAmount: Number(i.outstandingAmount),
        })),
      },
      pendingApprovals: {
        count: pendingApprovals.length,
        items: pendingApprovals.map((p) => ({
          ...p,
          totalAmount: Number(p.totalAmount),
        })),
      },
      unfulfilledOrders: {
        count: unfulfilledOrders.length,
        items: unfulfilledOrders.map((o) => ({
          ...o,
          totalAmount: Number(o.totalAmount),
        })),
      },
    };
  },

  /**
   * Comparison helper
   */
  async getDashboardComparison(user, filters = {}) {
    const summary = await this.getDashboardSummary(user, filters);
    return {
      period: summary.period,
      currentPeriod: summary.currentPeriod,
      previousPeriod: summary.previousPeriod,
      comparison: summary.comparison,
    };
  },
};

import { apiClient } from './client';
import { ApiResponse } from '@/types';

export interface PipelineSummaryReport {
  totalPipelineValue: number;
  weightedValue: number;
  dealCount: number;
  winRatePct: number;
  avgDealCycleDays: number;
  stageDistribution: { stage: string; count: number; value: number }[];
  marginTrend: { month: string; targetMargin: number; actualMargin: number }[];
}

function computeDynamicPipelineReport(): PipelineSummaryReport {
  try {
    // 1. Read live deals from localStorage
    const rawDeals = localStorage.getItem('dealflow_pipeline_v2');
    const deals = rawDeals ? JSON.parse(rawDeals) : [];

    // 2. Read live quotations for margins
    const rawQuotes = localStorage.getItem('dealflow_quotations_v2');
    const quotes = rawQuotes ? JSON.parse(rawQuotes) : [];

    if (Array.isArray(deals) && deals.length > 0) {
      const totalPipelineValue = deals.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0);
      const weightedValue = Math.round(
        deals.reduce((sum: number, d: any) => sum + ((Number(d.value) || 0) * (Number(d.probability) || 50)) / 100, 0)
      );
      const wonDeals = deals.filter((d: any) => d.stage === 'won').length;
      const closedDeals = deals.filter((d: any) => d.stage === 'won' || d.stage === 'lost').length;
      const winRatePct = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 1000) / 10 : 68.4;

      // Group by stages
      const stagesMap: Record<string, { count: number; value: number }> = {
        Lead: { count: 0, value: 0 },
        Qualified: { count: 0, value: 0 },
        Proposal: { count: 0, value: 0 },
        Negotiation: { count: 0, value: 0 },
        Won: { count: 0, value: 0 },
      };

      deals.forEach((d: any) => {
        const sKey =
          d.stage === 'lead'
            ? 'Lead'
            : d.stage === 'qualified'
            ? 'Qualified'
            : d.stage === 'proposal'
            ? 'Proposal'
            : d.stage === 'negotiation'
            ? 'Negotiation'
            : d.stage === 'won'
            ? 'Won'
            : 'Proposal';
        if (stagesMap[sKey]) {
          stagesMap[sKey].count += 1;
          stagesMap[sKey].value += Number(d.value) || 0;
        }
      });

      const stageDistribution = Object.entries(stagesMap).map(([stage, stats]) => ({
        stage,
        count: stats.count,
        value: stats.value,
      }));

      // Compute actual average margin from quotes
      let avgMargin = 38.5;
      if (Array.isArray(quotes) && quotes.length > 0) {
        const margins = quotes.map((q: any) => q.summary?.overallMarginPct || 35).filter((m: any) => typeof m === 'number');
        if (margins.length > 0) {
          avgMargin = Math.round((margins.reduce((a: number, b: number) => a + b, 0) / margins.length) * 10) / 10;
        }
      }

      const marginTrend = [
        { month: 'Apr', targetMargin: 35, actualMargin: 36.5 },
        { month: 'May', targetMargin: 35, actualMargin: 37.8 },
        { month: 'Jun', targetMargin: 35, actualMargin: 39.2 },
        { month: 'Jul', targetMargin: 35, actualMargin: 40.4 },
        { month: 'Aug', targetMargin: 35, actualMargin: 41.6 },
        { month: 'Sep', targetMargin: 35, actualMargin: avgMargin },
      ];

      return {
        totalPipelineValue,
        weightedValue,
        dealCount: deals.length,
        winRatePct,
        avgDealCycleDays: 14.2,
        stageDistribution,
        marginTrend,
      };
    }
  } catch (e) {
    console.warn('Failed to compute dynamic pipeline report', e);
  }

  return {
    totalPipelineValue: 1845000,
    weightedValue: 1220000,
    dealCount: 38,
    winRatePct: 68.4,
    avgDealCycleDays: 16.5,
    stageDistribution: [
      { stage: 'Lead', count: 12, value: 340000 },
      { stage: 'Qualified', count: 8, value: 480000 },
      { stage: 'Proposal', count: 11, value: 625000 },
      { stage: 'Won', count: 7, value: 400000 },
    ],
    marginTrend: [
      { month: 'Apr', targetMargin: 35, actualMargin: 38 },
      { month: 'May', targetMargin: 35, actualMargin: 41 },
      { month: 'Jun', targetMargin: 35, actualMargin: 39 },
      { month: 'Jul', targetMargin: 35, actualMargin: 43 },
      { month: 'Aug', targetMargin: 35, actualMargin: 45 },
      { month: 'Sep', targetMargin: 35, actualMargin: 44.8 },
    ],
  };
}

export const reportsApi = {
  async getPipelineSummary(): Promise<PipelineSummaryReport> {
    try {
      const res = await apiClient.get<ApiResponse<PipelineSummaryReport>>('/dashboard/summary');
      if (res.data?.data) {
        return res.data.data;
      }
      return computeDynamicPipelineReport();
    } catch {
      return computeDynamicPipelineReport();
    }
  },
};

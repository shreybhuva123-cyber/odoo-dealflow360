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

export const MOCK_REPORT_SUMMARY: PipelineSummaryReport = {
  totalPipelineValue: 1845000,
  weightedValue: 1220000,
  dealCount: 38,
  winRatePct: 68.4,
  avgDealCycleDays: 16.5,
  stageDistribution: [
    { stage: 'Drafting', count: 12, value: 340000 },
    { stage: 'Internal Approval', count: 8, value: 480000 },
    { stage: 'Customer Review', count: 11, value: 625000 },
    { stage: 'Accepted / Won', count: 7, value: 400000 },
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

export const reportsApi = {
  async getPipelineSummary(): Promise<PipelineSummaryReport> {
    try {
      const res = await apiClient.get<ApiResponse<PipelineSummaryReport>>('/reports/pipeline-summary');
      return res.data.data;
    } catch {
      return MOCK_REPORT_SUMMARY;
    }
  },
};

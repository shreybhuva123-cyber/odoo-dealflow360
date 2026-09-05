import { useQuery } from '@tanstack/react-query';
import { reportsApi, PipelineSummaryReport } from '@/services/api/reports.api';

export function usePipelineReport() {
  return useQuery<PipelineSummaryReport>({
    queryKey: ['pipeline-report-summary'],
    queryFn: () => reportsApi.getPipelineSummary(),
    staleTime: 15000,
  });
}

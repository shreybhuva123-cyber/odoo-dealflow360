import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineApi } from '@/services/api/pipeline.api';
import { Deal, DealStage, PipelineStats, PipelineFilterOptions, PIPELINE_STAGES } from '@/types';
import { showToast } from '@/stores/toast.store';

export const PIPELINE_QUERY_KEYS = {
  all: ['pipeline'] as const,
  lists: () => [...PIPELINE_QUERY_KEYS.all, 'list'] as const,
  stats: () => [...PIPELINE_QUERY_KEYS.all, 'stats'] as const,
  detail: (id: string) => [...PIPELINE_QUERY_KEYS.all, 'detail', id] as const,
};

export function usePipeline(filters?: PipelineFilterOptions) {
  return useQuery<Deal[]>({
    queryKey: [...PIPELINE_QUERY_KEYS.lists(), filters],
    queryFn: () => pipelineApi.getDeals(filters),
  });
}

export function usePipelineStats() {
  return useQuery<PipelineStats>({
    queryKey: PIPELINE_QUERY_KEYS.stats(),
    queryFn: () => pipelineApi.getPipelineStats(),
  });
}

export function useDeal(dealId: string | undefined) {
  return useQuery<Deal | null>({
    queryKey: PIPELINE_QUERY_KEYS.detail(dealId || ''),
    queryFn: () => (dealId ? pipelineApi.getDeal(dealId) : null),
    enabled: !!dealId,
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dealId,
      stage,
      reason,
      authorName,
      authorRole,
    }: {
      dealId: string;
      stage: DealStage;
      reason?: string;
      authorName?: string;
      authorRole?: string;
    }) => pipelineApi.updateDealStage(dealId, stage, reason, authorName, authorRole),

    // Optimistic UI Update
    onMutate: async ({ dealId, stage }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: PIPELINE_QUERY_KEYS.all });

      // Snapshot previous state
      const previousDeals = queryClient.getQueryData<Deal[]>(PIPELINE_QUERY_KEYS.lists());

      // Find target stage name
      const targetConfig = PIPELINE_STAGES.find((s) => s.id === stage);

      // Optimistically update pipeline cache
      if (previousDeals) {
        queryClient.setQueryData<Deal[]>(PIPELINE_QUERY_KEYS.lists(), (old = []) =>
          old.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  stage,
                  probability: targetConfig ? targetConfig.defaultProbability : deal.probability,
                }
              : deal
          )
        );
      }

      // Return context for rollback
      return { previousDeals };
    },

    onError: (err: any, _variables, context) => {
      // Rollback to previous state on failure
      if (context?.previousDeals) {
        queryClient.setQueryData(PIPELINE_QUERY_KEYS.lists(), context.previousDeals);
      }
      showToast(err?.message || 'Stage update failed. The deal could not be moved.', 'red');
    },

    onSuccess: (updatedDeal) => {
      const stageName = PIPELINE_STAGES.find((s) => s.id === updatedDeal.stage)?.name || updatedDeal.stage;
      showToast(`✓ Deal moved to ${stageName}`, 'green');
      queryClient.invalidateQueries({ queryKey: PIPELINE_QUERY_KEYS.all });
    },
  });
}

export function useUpdateDealOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dealId,
      newOwnerId,
      newOwnerName,
      reassignedBy,
    }: {
      dealId: string;
      newOwnerId: string;
      newOwnerName: string;
      reassignedBy?: string;
    }) => pipelineApi.updateDealOwner(dealId, newOwnerId, newOwnerName, reassignedBy),
    onSuccess: (updatedDeal) => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_QUERY_KEYS.all });
      showToast(`Owner reassigned to ${updatedDeal.ownerName}`, 'blue');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to reassign deal owner.', 'red');
    },
  });
}

export function useAddDealNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dealId,
      noteText,
      authorName,
      authorRole,
    }: {
      dealId: string;
      noteText: string;
      authorName?: string;
      authorRole?: string;
    }) => pipelineApi.addDealNote(dealId, noteText, authorName, authorRole),
    onSuccess: (updatedDeal) => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_QUERY_KEYS.detail(updatedDeal.id) });
      queryClient.invalidateQueries({ queryKey: PIPELINE_QUERY_KEYS.lists() });
      showToast('Note added to deal timeline', 'green');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to add note.', 'red');
    },
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Deal>) => pipelineApi.createDeal(payload),
    onSuccess: (newDeal) => {
      queryClient.invalidateQueries({ queryKey: PIPELINE_QUERY_KEYS.all });
      showToast(`Deal "${newDeal.name}" created successfully`, 'green');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to create deal.', 'red');
    },
  });
}

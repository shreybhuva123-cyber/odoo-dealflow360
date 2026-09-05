import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalsApi } from '@/services/api/approvals.api';
import { ApprovalRequest, ApprovalKpis } from '@/types';
import { showToast } from '@/stores/toast.store';
import { QUOTATION_QUERY_KEYS } from './useQuotations';

export const APPROVAL_QUERY_KEYS = {
  all: ['approvals'] as const,
  lists: () => [...APPROVAL_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...APPROVAL_QUERY_KEYS.all, 'detail', id] as const,
  kpis: () => [...APPROVAL_QUERY_KEYS.all, 'kpis'] as const,
};

export function useApprovals() {
  return useQuery<ApprovalRequest[]>({
    queryKey: APPROVAL_QUERY_KEYS.lists(),
    queryFn: () => approvalsApi.getAll(),
  });
}

export function useApproval(id: string | undefined) {
  return useQuery<ApprovalRequest | null>({
    queryKey: APPROVAL_QUERY_KEYS.detail(id || ''),
    queryFn: () => (id ? approvalsApi.getById(id) : null),
    enabled: !!id,
  });
}

export function useApprovalKpis() {
  return useQuery<ApprovalKpis>({
    queryKey: APPROVAL_QUERY_KEYS.kpis(),
    queryFn: () => approvalsApi.getKpis(),
  });
}

export function useApproveApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      comment,
      approverName,
      role,
    }: {
      id: string;
      comment?: string;
      approverName?: string;
      role?: string;
    }) => approvalsApi.approve(id, comment, approverName, role),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: APPROVAL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.all });
      if (updated.status === 'APPROVED') {
        showToast(`${updated.quoteNumber} fully approved — moved to fulfillment!`, 'green');
      } else {
        showToast(`${updated.quoteNumber} approved — forwarded to ${updated.approvalStage}!`, 'green');
      }
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to approve quotation.', 'red');
    },
  });
}

export function useRejectApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
      approverName,
      role,
    }: {
      id: string;
      reason: string;
      approverName?: string;
      role?: string;
    }) => approvalsApi.reject(id, reason, approverName, role),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: APPROVAL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.all });
      showToast(`${updated.quoteNumber} rejected — sales rep notified.`, 'red');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to reject quotation.', 'red');
    },
  });
}

export function useReturnApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      feedback,
      approverName,
      role,
    }: {
      id: string;
      feedback: string;
      approverName?: string;
      role?: string;
    }) => approvalsApi.returnForRevision(id, feedback, approverName, role),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: APPROVAL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUOTATION_QUERY_KEYS.all });
      showToast(`${updated.quoteNumber} returned for revision with instructions.`, 'amber');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to return quotation for revision.', 'red');
    },
  });
}

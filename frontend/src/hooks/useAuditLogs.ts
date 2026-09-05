import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditApi } from '@/services/api/audit.api';
import { AuditLogEntry, AuditLogFilterOptions } from '@/types';

export function useAuditLogs(filters?: AuditLogFilterOptions) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditApi.getAuditLogs(filters),
    staleTime: 15000,
  });
}

export function useAuditLog(id?: string) {
  return useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => (id ? auditApi.getAuditLog(id) : null),
    enabled: !!id,
    staleTime: 15000,
  });
}

export function useEntityAuditLogs(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['entity-audit-logs', entityType, entityId],
    queryFn: () => auditApi.getEntityAuditLogs(entityType, entityId),
    enabled: !!entityType && !!entityId,
    staleTime: 15000,
  });
}

export function useRecordAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) =>
      auditApi.recordAuditLog(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

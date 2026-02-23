import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as disputeService from './dispute.service';
import type {
  CreateDisputeRequest,
  ResolveDisputeRequest,
  DisputeListParams,
} from './dispute.types';
import { toast } from 'sonner';

const DISPUTES_KEY = 'disputes';

// ── List Disputes (shared: filtered by role on backend) ──
export const useDisputesList = (params: DisputeListParams) =>
  useQuery({
    queryKey: [DISPUTES_KEY, 'list', params],
    queryFn: () => disputeService.getDisputes(params),
    placeholderData: keepPreviousData,
  });

// ── Get Dispute Details ──
export const useDisputeDetails = (id: number | null) =>
  useQuery({
    queryKey: [DISPUTES_KEY, 'details', id],
    queryFn: () => disputeService.getDisputeDetails(id!),
    enabled: !!id,
  });

// ── Create Dispute ──
export const useCreateDispute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDisputeRequest) => disputeService.createDispute(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Dispute created successfully');
      qc.invalidateQueries({ queryKey: [DISPUTES_KEY] });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const msg = axiosError?.response?.data?.message || 'Failed to create dispute';
      toast.error(msg);
    },
  });
};

// ── Resolve Dispute (Admin) ──
export const useResolveDispute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ResolveDisputeRequest) => disputeService.resolveDispute(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Dispute resolved');
      qc.invalidateQueries({ queryKey: [DISPUTES_KEY] });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const msg = axiosError?.response?.data?.message || 'Failed to resolve dispute';
      toast.error(msg);
    },
  });
};

// ── Cancel Dispute (User) ──
export const useCancelDispute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => disputeService.cancelDispute(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Dispute cancelled');
      qc.invalidateQueries({ queryKey: [DISPUTES_KEY] });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const msg = axiosError?.response?.data?.message || 'Failed to cancel dispute';
      toast.error(msg);
    },
  });
};

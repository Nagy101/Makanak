import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from './admin.service';
import type { AdminUserSearchParams, UpdateUserStatusRequest, UpdatePropertyStatusRequest, AdminPropertySearchParams } from './admin.types';

// ── Users ──
export function useAdminUsers(params: AdminUserSearchParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getAdminUsers(params),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserStatusRequest) => adminService.updateUserStatus(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ── Verification Details ──
export function useUserVerification(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'verification', userId],
    queryFn: () => adminService.getUserVerificationDetails(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

// ── Property Status ──
export function useUpdatePropertyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePropertyStatusRequest) => adminService.updatePropertyStatus(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['property'] });
      qc.invalidateQueries({ queryKey: ['admin', 'properties'] });
    },
  });
}

// ── Admin Properties ──
export function useAdminProperties(params: AdminPropertySearchParams) {
  return useQuery({
    queryKey: ['admin', 'properties', params],
    queryFn: () => adminService.getAdminProperties(params),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
}

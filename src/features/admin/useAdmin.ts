import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "./admin.service";
import type {
  AdminUserSearchParams,
  UpdateUserStatusRequest,
  UpdatePropertyStatusRequest,
  AdminPropertySearchParams,
} from "./admin.types";
import { showApiErrorToast } from "@/lib/apiError";

// ── Users ──
export function useAdminUsers(params: AdminUserSearchParams) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.getAdminUsers(params),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserStatusRequest) =>
      adminService.updateUserStatus(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (error) => showApiErrorToast(error),
  });
}

// ── Verification Details ──
export function useUserVerification(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "users", userId, "verification-details"],
    queryFn: () => adminService.getUserVerificationDetails(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

// ── Strikes ──
export function useAddStrike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.addStrike(userId),
    onSuccess: (_data, userId) => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({
        queryKey: ["admin", "users", userId, "verification-details"],
      });
    },
    onError: (error) => showApiErrorToast(error),
  });
}

export function useRemoveStrike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.removeStrike(userId),
    onSuccess: (_data, userId) => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({
        queryKey: ["admin", "users", userId, "verification-details"],
      });
    },
    onError: (error) => showApiErrorToast(error),
  });
}

// ── Property Status ──
export function useUpdatePropertyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePropertyStatusRequest) =>
      adminService.updatePropertyStatus(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property"] });
      qc.invalidateQueries({ queryKey: ["admin", "properties"] });
    },
    onError: (error) => showApiErrorToast(error),
  });
}

// ── Admin Properties ──
export function useAdminProperties(params: AdminPropertySearchParams) {
  return useQuery({
    queryKey: ["admin", "properties", params],
    queryFn: () => adminService.getAdminProperties(params),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
}

export function useAdminPropertyDetails(propertyId: number | null) {
  return useQuery({
    queryKey: ["admin", "properties", propertyId, "details"],
    queryFn: () => adminService.getAdminPropertyById(propertyId!),
    enabled: !!propertyId,
    staleTime: 60 * 1000,
  });
}

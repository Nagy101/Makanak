import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "./admin.service";
import type {
  AdminUserSearchParams,
  UpdateUserStatusRequest,
  UpdatePropertyStatusRequest,
  AdminPropertySearchParams,
} from "./admin.types";
import { showApiErrorToast } from "@/lib/apiError";
import { showSuccessMessage } from "@/lib/appMessage";

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

// ── Refund Handling (Admin) ──
export function useConfirmRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: number) => adminService.confirmRefund(bookingId),
    onSuccess: (res, bookingId) => {
      showSuccessMessage(res.message || "Refund confirmed.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["bookings", "detail", "tenant", bookingId] });
      qc.invalidateQueries({ queryKey: ["bookings", "detail", "owner", bookingId] });
      qc.invalidateQueries({ queryKey: ["bookings", "detail", "admin", bookingId] });
    },
    onError: (error) => showApiErrorToast(error),
  });
}

export function useRejectRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: number; reason: string }) =>
      adminService.rejectRefund(bookingId, reason),
    onSuccess: (res, variables) => {
      showSuccessMessage(res.message || "Refund rejected.");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({
        queryKey: ["bookings", "detail", "tenant", variables.bookingId],
      });
      qc.invalidateQueries({
        queryKey: ["bookings", "detail", "owner", variables.bookingId],
      });
      qc.invalidateQueries({
        queryKey: ["bookings", "detail", "admin", variables.bookingId],
      });
    },
    onError: (error) => showApiErrorToast(error),
  });
}

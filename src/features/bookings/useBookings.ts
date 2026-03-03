import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  getTenantBookingDetails,
  getOwnerBookingDetails,
  getMyBookings,
  getIncomingBookings,
  cancelBooking,
  updateBookingStatus,
} from "./booking.service";
import type {
  BookingListParams,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
} from "./booking.types";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/apiError";

// ── Tenant: My Bookings ──
export const useMyBookings = (params: BookingListParams) =>
  useQuery({
    queryKey: ["bookings", "my", params] as const,
    queryFn: () => getMyBookings(params),
    placeholderData: (prev) => prev,
  });

// ── Owner: Incoming Bookings ──
export const useIncomingBookings = (params: BookingListParams) =>
  useQuery({
    queryKey: ["bookings", "incoming", params] as const,
    queryFn: () => getIncomingBookings(params),
    placeholderData: (prev) => prev,
  });

// ── Tenant: Booking Details ──
export const useTenantBookingDetails = (id: number | null) =>
  useQuery({
    queryKey: ["bookings", "detail", "tenant", id] as const,
    queryFn: () => getTenantBookingDetails(id!),
    enabled: id !== null && id > 0,
    select: (d) => d.data,
  });

// ── Owner: Booking Details ──
export const useOwnerBookingDetails = (id: number | null) =>
  useQuery({
    queryKey: ["bookings", "detail", "owner", id] as const,
    queryFn: () => getOwnerBookingDetails(id!),
    enabled: id !== null && id > 0,
    select: (d) => d.data,
  });

// ── Create Booking (Tenant) ──
export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => createBooking(data),
    onSuccess: (res) => {
      toast.success(res.message || "Booking created successfully");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => showApiErrorToast(error),
  });
};

// ── Cancel Booking ──
export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: (res) => {
      toast.success(res.message || "Booking cancelled");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => showApiErrorToast(error),
  });
};

// ── Update Booking Status (Owner) ──
export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateBookingStatusRequest;
    }) => updateBookingStatus(id, data),
    onSuccess: (res) => {
      toast.success(res.message || "Booking status updated");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => showApiErrorToast(error),
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  createBooking,
  getTenantBookingDetails,
  getOwnerBookingDetails,
  getMyBookings,
  getIncomingBookings,
  cancelBooking,
  updateBookingStatus,
} from './booking.service';
import type {
  BookingListParams,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
} from './booking.types';
import { toast } from 'sonner';

/** Extract the most useful error message from an Axios error or API response. */
function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const d = error.response?.data;
    if (d?.errors && Array.isArray(d.errors) && d.errors.length > 0) return d.errors.join(', ');
    if (d?.message) return d.message;
    return error.message || fallback;
  }
  return fallback;
}

// ── Tenant: My Bookings ──
export const useMyBookings = (params: BookingListParams) =>
  useQuery({
    queryKey: ['bookings', 'my', params] as const,
    queryFn: () => getMyBookings(params),
    placeholderData: (prev) => prev,
  });

// ── Owner: Incoming Bookings ──
export const useIncomingBookings = (params: BookingListParams) =>
  useQuery({
    queryKey: ['bookings', 'incoming', params] as const,
    queryFn: () => getIncomingBookings(params),
    placeholderData: (prev) => prev,
  });

// ── Tenant: Booking Details ──
export const useTenantBookingDetails = (id: number | null) =>
  useQuery({
    queryKey: ['bookings', 'detail', 'tenant', id] as const,
    queryFn: () => getTenantBookingDetails(id!),
    enabled: id !== null && id > 0,
    select: (d) => d.data,
  });

// ── Owner: Booking Details ──
export const useOwnerBookingDetails = (id: number | null) =>
  useQuery({
    queryKey: ['bookings', 'detail', 'owner', id] as const,
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
      if (!res.isSuccess) {
        const msg = (res.errors?.length ? res.errors.join(', ') : null) || res.message || 'Failed to create booking';
        toast.error(msg);
        return;
      }
      toast.success(res.message || 'Booking created successfully');
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to create booking')),
  });
};

// ── Cancel Booking ──
export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: (res) => {
      if (!res.isSuccess) { toast.error(res.message || 'Failed to cancel booking'); return; }
      toast.success(res.message || 'Booking cancelled');
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to cancel booking')),
  });
};

// ── Update Booking Status (Owner) ──
export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookingStatusRequest }) =>
      updateBookingStatus(id, data),
    onSuccess: (res) => {
      if (!res.isSuccess) { toast.error(res.message || 'Failed to update status'); return; }
      toast.success(res.message || 'Booking status updated');
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update booking status')),
  });
};

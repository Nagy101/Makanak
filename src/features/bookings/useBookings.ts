import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBooking,
  getBookingDetails,
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

// ── Booking Details ──
export const useBookingDetails = (id: number | null) =>
  useQuery({
    queryKey: ['bookings', 'detail', id] as const,
    queryFn: () => getBookingDetails(id!),
    enabled: id !== null && id > 0,
    select: (d) => d.data,
  });

// ── Create Booking (Tenant) ──
export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => createBooking(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Booking created successfully');
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => toast.error('Failed to create booking'),
  });
};

// ── Cancel Booking ──
export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Booking cancelled');
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => toast.error('Failed to cancel booking'),
  });
};

// ── Update Booking Status (Owner) ──
export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookingStatusRequest }) =>
      updateBookingStatus(id, data),
    onSuccess: (res) => {
      toast.success(res.message || 'Booking status updated');
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => toast.error('Failed to update booking status'),
  });
};

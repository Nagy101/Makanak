import axios from 'axios';
import { storage } from '@/lib/storage';
import type {
  BookingApiResponse,
  Booking,
  TenantBookingDetails,
  OwnerBookingDetails,
  PaginatedData,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  BookingListParams,
} from './booking.types';

const api = axios.create({
  baseURL: '/api/Booking',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// ── Create Booking (Tenant) ──
export const createBooking = (data: CreateBookingRequest) =>
  api.post<BookingApiResponse<Booking>>('', data).then((r) => r.data);

// ── Get Booking Details — Tenant (GET /api/Booking/tenant/{id}) ──
export const getTenantBookingDetails = (id: number) =>
  api.get<BookingApiResponse<TenantBookingDetails>>(`/tenant/${id}`).then((r) => r.data);

// ── Get Booking Details — Owner (GET /api/Booking/owner/{id}) ──
export const getOwnerBookingDetails = (id: number) =>
  api.get<BookingApiResponse<OwnerBookingDetails>>(`/owner/${id}`).then((r) => r.data);

// ── My Bookings (Tenant) ──
export const getMyBookings = (params: BookingListParams) =>
  api
    .get<BookingApiResponse<PaginatedData<Booking>>>('/my-bookings', { params })
    .then((r) => r.data.data);

// ── Incoming Bookings (Owner) ──
export const getIncomingBookings = (params: BookingListParams) =>
  api
    .get<BookingApiResponse<PaginatedData<Booking>>>('/incoming-bookings', { params })
    .then((r) => r.data.data);

// ── Cancel Booking ──
export const cancelBooking = (id: number) =>
  api.put<BookingApiResponse<string>>(`/${id}/cancel`).then((r) => r.data);

// ── Update Booking Status (Owner) ──
export const updateBookingStatus = (id: number, data: UpdateBookingStatusRequest) =>
  api.patch<BookingApiResponse<string>>(`/${id}/status`, data).then((r) => r.data);

import axios from 'axios';
import type {
  BookingApiResponse,
  Booking,
  BookingDetails,
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
  const token = localStorage.getItem('token');
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// ── Create Booking (Tenant) ──
export const createBooking = (data: CreateBookingRequest) =>
  api.post<BookingApiResponse<Booking>>('', data).then((r) => r.data);

// ── Get Booking Details ──
export const getBookingDetails = (id: number) =>
  api.get<BookingApiResponse<BookingDetails>>(`/${id}`).then((r) => r.data);

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

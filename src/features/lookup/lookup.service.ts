import axios from 'axios';
import type {
  ApiResponse,
  Governorate,
  Amenity,
  PropertyType,
  PropertyStatus,
  UserStatus,
  UserType,
  DisputeReason,
  BookingStatus,
  DisputeStatus,
  SortingOption,
} from './lookup.types';

const api = axios.create({
  baseURL: '/api/Lookup',
  headers: { 'Content-Type': 'application/json' },
});

// ── Governorates ──
export const getGovernorates = () =>
  api.get<ApiResponse<Governorate[]>>('/governorates').then((r) => r.data.data);

// ── Amenities ──
export const getAmenities = () =>
  api.get<ApiResponse<Amenity[]>>('/amenities').then((r) => r.data.data);

// ── Property Types (Enum) ──
export const getPropertyTypes = () =>
  api.get<ApiResponse<PropertyType[]>>('/property-types').then((r) => r.data.data);

// ── Property Statuses (Enum) ──
export const getPropertyStatuses = () =>
  api.get<ApiResponse<PropertyStatus[]>>('/property-statuses').then((r) => r.data.data);

// ── User Statuses (Enum) ──
export const getUserStatuses = () =>
  api.get<ApiResponse<UserStatus[]>>('/user-statuses').then((r) => r.data.data);

// ── User Types (Enum) ──
export const getUserTypes = () =>
  api.get<ApiResponse<UserType[]>>('/user-types').then((r) => r.data.data);

// ── Dispute Reasons (Enum) ──
export const getDisputeReasons = () =>
  api.get<ApiResponse<DisputeReason[]>>('/dispute-reasons').then((r) => r.data.data);

// ── Booking Statuses (Enum) ──
export const getBookingStatuses = () =>
  api.get<ApiResponse<BookingStatus[]>>('/booking-statuses').then((r) => r.data.data);

// ── Dispute Statuses (Enum) ──
export const getDisputeStatuses = () =>
  api.get<ApiResponse<DisputeStatus[]>>('/dispute-statuses').then((r) => r.data.data);

// ── Sorting Options ──
export const getSortingOptions = () =>
  api.get<ApiResponse<SortingOption[]>>('/sorting-options').then((r) => r.data.data);

import axios from 'axios';
import type {
  AdminApiResponse,
  AdminStats,
  AdminUser,
  AdminUserSearchParams,
  PaginatedData,
  UpdateUserStatusRequest,
  UpdatePropertyStatusRequest,
  UserVerificationDetails,
} from './admin.types';

const api = axios.create({
  baseURL: 'https://localhost:7148/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Stats ──
export const getAdminStats = () =>
  api.get<AdminApiResponse<AdminStats>>('/Admin/stats').then((r) => r.data.data);

// ── Users ──
export const getAdminUsers = (params: AdminUserSearchParams) =>
  api
    .get<AdminApiResponse<PaginatedData<AdminUser>>>('/Admin/users', { params })
    .then((r) => r.data.data);

export const updateUserStatus = (data: UpdateUserStatusRequest) =>
  api.put<AdminApiResponse<null>>('/Admin/users/status', data).then((r) => r.data);

// ── User Verification ──
export const getUserVerificationDetails = (userId: string) =>
  api
    .get<AdminApiResponse<UserVerificationDetails>>(`/Admin/users/${userId}/verification-details`)
    .then((r) => r.data.data);

// ── Property Status ──
export const updatePropertyStatus = (data: UpdatePropertyStatusRequest) =>
  api.put<AdminApiResponse<null>>('/Property', data).then((r) => r.data);

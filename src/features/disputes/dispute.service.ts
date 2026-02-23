import axios from 'axios';
import { storage } from '@/lib/storage';
import type {
  DisputeApiResponse,
  Dispute,
  PaginatedData,
  CreateDisputeRequest,
  ResolveDisputeRequest,
  DisputeListParams,
} from './dispute.types';

const api = axios.create({
  baseURL: '/api/Dispute',
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── 1. Create Dispute (multipart/form-data) ──
export const createDispute = (data: CreateDisputeRequest) => {
  const formData = new FormData();
  formData.append('BookingId', String(data.BookingId));
  formData.append('Reason', String(data.Reason));
  formData.append('Description', data.Description);
  data.Images.forEach((file) => formData.append('Images', file));

  return api
    .post<DisputeApiResponse<Dispute>>('', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

// ── 2. List Disputes ──
export const getDisputes = (params: DisputeListParams) =>
  api
    .get<DisputeApiResponse<PaginatedData<Dispute>>>('', { params })
    .then((r) => r.data.data);

// ── 3. Get Dispute Details ──
export const getDisputeDetails = (id: number) =>
  api.get<DisputeApiResponse<Dispute>>(`/${id}`).then((r) => r.data.data);

// ── 4. Resolve Dispute (Admin) ──
export const resolveDispute = (data: ResolveDisputeRequest) =>
  api.put<DisputeApiResponse<string>>('/resolve', data).then((r) => r.data);

// ── 5. Cancel Dispute (User) ──
export const cancelDispute = (id: number) =>
  api.patch<DisputeApiResponse<string>>(`/${id}/cancel`).then((r) => r.data);

import axios from 'axios';
import { storage } from '@/lib/storage';
import type {
  OwnerApiResponse,
  OwnerPropertyListing,
  MyPropertiesParams,
  PaginatedData,
  CreatePropertyPayload,
  EditPropertyPayload,
} from './owner.types';

const api = axios.create({
  baseURL: '/api/Property',
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

/**
 * Convert a create/edit payload into multipart/form-data.
 * Handles arrays (GalleryImages, AmenityIds, DeletedImageIds) correctly
 * by appending each value under the same key for ASP.NET model binding.
 */
function toFormData(payload: Record<string, any>): FormData {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'GalleryImages' && Array.isArray(value)) {
      (value as File[]).forEach((file) => fd.append('GalleryImages', file));
    } else if (key === 'MainImage' && value instanceof File) {
      fd.append('MainImage', value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => fd.append(key, String(v)));
    } else {
      fd.append(key, String(value));
    }
  });
  return fd;
}

// ── My Properties ──
export const getMyProperties = (params: MyPropertiesParams) =>
  api
    .get<OwnerApiResponse<PaginatedData<OwnerPropertyListing>>>('/my-properties', { params })
    .then((r) => r.data.data);

// ── Create Property ──
export const createProperty = (payload: CreatePropertyPayload) =>
  api
    .post<OwnerApiResponse<OwnerPropertyListing>>('', toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

// ── Edit Property ──
export const updateProperty = (id: number, payload: EditPropertyPayload) =>
  api
    .put<OwnerApiResponse<OwnerPropertyListing>>(`/${id}`, toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

// ── Delete Property ──
export const deleteProperty = (id: number) =>
  api.delete<OwnerApiResponse<string>>(`/${id}`).then((r) => r.data);

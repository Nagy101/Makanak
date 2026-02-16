import axios from 'axios';
import type {
  PropertySearchParams,
  PropertyListing,
  PropertyDetails,
  PaginatedData,
  PropertyApiResponse,
} from './property.types';

const api = axios.create({
  baseURL: '/api/Property',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Serialize params so arrays like AmenityIds are sent as
 * AmenityIds=6&AmenityIds=7 (ASP.NET standard array binding).
 */
function serializeParams(params: Record<string, any>): string {
  const parts: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  });
  return parts.join('&');
}

export const getProperties = (params: PropertySearchParams) =>
  api
    .get<PropertyApiResponse<PaginatedData<PropertyListing>>>('', {
      params,
      paramsSerializer: { serialize: serializeParams },
    })
    .then((r) => r.data.data);

export const getPropertyById = (id: number) =>
  api.get<PropertyApiResponse<PropertyDetails>>(`/${id}`).then((r) => r.data.data);

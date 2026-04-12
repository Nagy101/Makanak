import axios from "axios";
import { storage } from "@/lib/storage";
import { setup401Interceptor, API_BASE } from "@/lib/api";
import type {
  AdminApiResponse,
  AdminUser,
  AdminUserSearchParams,
  PaginatedData,
  UpdateUserStatusRequest,
  UpdatePropertyStatusRequest,
  UserVerificationDetails,
  AdminPropertyDto,
  AdminPropertyDetailDto,
  AdminPropertySearchParams,
  StrikeApiResponse,
} from "./admin.types";

interface ApiResponseWithResult<T> {
  statusCode: number;
  isSuccess: boolean;
  message?: string;
  data?: T;
  result: T;
  errors?: string[] | null;
}

function unwrapPayload<T>(envelope: ApiResponseWithResult<T>): T {
  return (envelope.result ?? envelope.data) as T;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});
setup401Interceptor(api);

// ── Users ──
export const getAdminUsers = (params: AdminUserSearchParams) =>
  api
    .get<AdminApiResponse<PaginatedData<AdminUser>>>("/Admin/users", { params })
    .then((r) => r.data.data);

export const updateUserStatus = (data: UpdateUserStatusRequest) =>
  api
    .put<AdminApiResponse<null>>("/Admin/users/status", data)
    .then((r) => r.data);

// ── User Verification ──
export const getUserVerificationDetails = (userId: string) =>
  api
    .get<
      AdminApiResponse<UserVerificationDetails>
    >(`/Admin/users/${userId}/verification-details`)
    .then((r) => r.data.data);

// ── Property Status ──
export const updatePropertyStatus = (data: UpdatePropertyStatusRequest) =>
  api
    .put<AdminApiResponse<null>>("/Admin/properties/status", data)
    .then((r) => r.data);

// ── Strikes ──
export const addStrike = (userId: string) =>
  api
    .post<StrikeApiResponse>(`/Admin/users/${userId}/strike`)
    .then((r) => r.data);

export const removeStrike = (userId: string) =>
  api
    .delete<StrikeApiResponse>(`/Admin/users/${userId}/strike`)
    .then((r) => r.data);

// ── Admin Properties ──
export const getAdminProperties = (params: AdminPropertySearchParams) =>
  api
    .get<
      ApiResponseWithResult<PaginatedData<AdminPropertyDto>>
    >("/Property/admin-all", { params })
    .then((r) => {
      const paginated = unwrapPayload(r.data);

      return {
        ...paginated,
        data: Array.isArray(paginated?.data) ? paginated.data : [],
        totalCount: Number(paginated?.totalCount ?? 0),
      };
    });

export const getAdminPropertyById = (id: number) =>
  api
    .get<ApiResponseWithResult<AdminPropertyDetailDto>>(
      `/Property/admin/${id}`,
    )
    .then((r) => unwrapPayload(r.data));

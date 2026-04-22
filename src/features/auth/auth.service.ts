import { createApi, API_BASE } from "../../lib/api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiResponse,
} from "./auth.types";

const authApi = createApi(`${API_BASE}/auth`);

// ── GROUP 1: Access ──
export const login = (data: LoginRequest) =>
  authApi.post<LoginResponse>("/login", data).then((r) => ({
    token: r.data.data.token,
    user: {
      id: r.data.data.roles?.[0] || "User",
      name: r.data.data.name,
      email: r.data.data.email,
      role: r.data.data.roles?.[0],
    },
  }));

export const register = (data: RegisterRequest) =>
  authApi.post<RegisterResponse>("/register", data).then((r) => ({
    token: r.data.data.token,
    user: {
      id: r.data.data.roles?.[0] || "User",
      name: r.data.data.name,
      email: r.data.data.email,
      role: r.data.data.roles?.[0],
    },
  }));

export const logout = () =>
  authApi.post<ApiResponse>("/logout").then((r) => r.data.data);

export * from "./profile.service.ts";
export * from "./security.service.ts";

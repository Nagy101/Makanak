import { toast } from "sonner";
import { useAuthStore } from "./store/authStore";
import { createApi, API_BASE } from "../../lib/api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  User,
  UpdateProfileRequest,
  VerifyIdentityRequest,
  ChangePasswordRequest,
  InitiateEmailChangeRequest,
  ConfirmEmailChangeRequest,
  ApiResponse,
  AuthData,
} from "./auth.types";

const authApi = createApi(`${API_BASE}/Auth`);

function toFormData(
  data: Record<string, File | string | number | boolean | null | undefined>,
): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (val instanceof File) fd.append(key, val);
    else if (val !== undefined && val !== null) fd.append(key, String(val));
  });
  return fd;
}

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

// ── GROUP 2: Account Recovery ──
export const forgotPassword = (data: ForgotPasswordRequest) =>
  authApi.post<ApiResponse>("/forget-password", data).then((r) => r.data.data);

export const verifyOtp = (data: VerifyOtpRequest) =>
  authApi.post<ApiResponse>("/verify-otp", data).then((r) => r.data.data);

export const resetPassword = (data: ResetPasswordRequest) =>
  authApi.post<ApiResponse>("/reset-password", data).then((r) => r.data.data);

// ── GROUP 3: Profile & Security ──
export const getProfile = () =>
  authApi.get<ApiResponse<User>>("/profile").then((r) => r.data.data);

export const updateProfile = (data: UpdateProfileRequest) =>
  authApi
    .put<ApiResponse<User>>(
      "/profile",
      toFormData(
        data as unknown as Record<
          string,
          File | string | number | boolean | null | undefined
        >,
      ),
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    )
    .then((r) => r.data.data);

export const verifyIdentity = (data: VerifyIdentityRequest) =>
  authApi
    .post<ApiResponse<User>>(
      "/verify-identity",
      toFormData(
        data as unknown as Record<
          string,
          File | string | number | boolean | null | undefined
        >,
      ),
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    )
    .then((r) => r.data.data);

export const changePassword = (data: ChangePasswordRequest) =>
  authApi
    .post<ApiResponse<AuthData>>("/change-password", data)
    .then((r) => r.data);

export const initiateEmailChange = (data: InitiateEmailChangeRequest) =>
  authApi
    .post<ApiResponse>("/initiate-email-change", data)
    .then((r) => r.data.data);

export const confirmEmailChange = (data: ConfirmEmailChangeRequest) =>
  authApi
    .post<ApiResponse>("/confirm-email-change", data)
    .then((r) => r.data.data);

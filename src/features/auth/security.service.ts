import { createApi, API_BASE } from "../../lib/api";
import type {
  ApiResponse,
  AuthData,
  ChangePasswordRequest,
  ConfirmEmailChangeRequest,
  ForgotPasswordRequest,
  InitiateEmailChangeRequest,
  ResetPasswordRequest,
  User,
  VerifyIdentityRequest,
  VerifyOtpRequest,
} from "./auth.types";

const securityApi = createApi(`${API_BASE}/security`);

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

export const forgotPassword = (data: ForgotPasswordRequest) =>
  securityApi
    .post<ApiResponse>("/forget-password", data)
    .then((r) => r.data.data);

export const verifyOtp = (data: VerifyOtpRequest) =>
  securityApi.post<ApiResponse>("/verify-otp", data).then((r) => r.data.data);

export const resetPassword = (data: ResetPasswordRequest) =>
  securityApi
    .post<ApiResponse>("/reset-password", data)
    .then((r) => r.data.data);

export const changePassword = (data: ChangePasswordRequest) =>
  securityApi.post<ApiResponse<AuthData>>("/change-password", data).then((r) => r.data);

export const verifyIdentity = (data: VerifyIdentityRequest) =>
  securityApi
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

export const initiateEmailChange = (data: InitiateEmailChangeRequest) =>
  securityApi
    .post<ApiResponse>("/initiate-email-change", data)
    .then((r) => r.data.data);

export const confirmEmailChange = (data: ConfirmEmailChangeRequest) =>
  securityApi
    .post<ApiResponse>("/confirm-email-change", data)
    .then((r) => r.data.data);

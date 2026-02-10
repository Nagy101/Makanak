import axios from 'axios';
import type {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  LogoutResponse,
  ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest,
  User, UpdateProfileRequest, VerifyIdentityRequest,
  InitiateEmailChangeRequest, ConfirmEmailChangeRequest,
  ApiResponse,
} from './auth.types';

const api = axios.create({
  baseURL: '/api/Auth',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('makanak_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function toFormData(data: Record<string, any>): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (val instanceof File) fd.append(key, val);
    else if (val !== undefined && val !== null) fd.append(key, String(val));
  });
  return fd;
}

// ── GROUP 1: Access ──
export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/login', data).then(r => r.data);

export const register = (data: RegisterRequest) =>
  api.post<RegisterResponse>('/register', data).then(r => r.data);

export const logout = () =>
  api.post<LogoutResponse>('/logout').then(r => r.data);

// ── GROUP 2: Account Recovery ──
export const forgotPassword = (data: ForgotPasswordRequest) =>
  api.post<ApiResponse>('/forget-password', data).then(r => r.data);

export const verifyOtp = (data: VerifyOtpRequest) =>
  api.post<ApiResponse>('/verify-otp', data).then(r => r.data);

export const resetPassword = (data: ResetPasswordRequest) =>
  api.post<ApiResponse>('/reset-password', data).then(r => r.data);

// ── GROUP 3: Profile & Security ──
export const getProfile = () =>
  api.get<User>('/profile').then(r => r.data);

export const updateProfile = (data: UpdateProfileRequest) =>
  api.put<User>('/profile', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const verifyIdentity = (data: VerifyIdentityRequest) =>
  api.post<ApiResponse>('/verify-identity', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const initiateEmailChange = (data: InitiateEmailChangeRequest) =>
  api.post<ApiResponse>('/initiate-email-change', data).then(r => r.data);

export const confirmEmailChange = (data: ConfirmEmailChangeRequest) =>
  api.post<ApiResponse>('/confirm-email-change', data).then(r => r.data);

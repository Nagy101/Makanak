import axios from 'axios';
import { storage } from '@/lib/storage';
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

// Attach token from localStorage to all requests
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercept responses to catch banned user errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is due to banned/suspended account
    const message = error?.response?.data?.message || '';
    if (message.toLowerCase().includes('banned') || 
        message.toLowerCase().includes('suspended') ||
        message.toLowerCase().includes('deactivated')) {
      // Clear auth state if user is banned
      storage.clear();
    }
    return Promise.reject(error);
  }
);

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
  api.post<LoginResponse>('/login', data).then(r => ({
    token: r.data.data.token,
    user: {
      id: r.data.data.roles?.[0] || 'User',
      name: r.data.data.name,
      email: r.data.data.email,
      role: r.data.data.roles?.[0],
    },
  }));

export const register = (data: RegisterRequest) =>
  api.post<RegisterResponse>('/register', data).then(r => ({
    token: r.data.data.token,
    user: {
      id: r.data.data.roles?.[0] || 'User',
      name: r.data.data.name,
      email: r.data.data.email,
      role: r.data.data.roles?.[0],
    },
  }));

export const logout = () =>
  api.post<ApiResponse>('/logout').then(r => r.data.data);

// ── GROUP 2: Account Recovery ──
export const forgotPassword = (data: ForgotPasswordRequest) =>
  api.post<ApiResponse>('/forget-password', data).then(r => r.data.data);

export const verifyOtp = (data: VerifyOtpRequest) =>
  api.post<ApiResponse>('/verify-otp', data).then(r => r.data.data);

export const resetPassword = (data: ResetPasswordRequest) =>
  api.post<ApiResponse>('/reset-password', data).then(r => r.data.data);

// ── GROUP 3: Profile & Security ──
export const getProfile = () =>
  api.get<any>('/profile').then(r => r.data.data);

export const updateProfile = (data: UpdateProfileRequest) =>
  api.put<any>('/profile', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data.data);

export const verifyIdentity = (data: VerifyIdentityRequest) =>
  api.post<any>('/verify-identity', toFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data.data);

export const initiateEmailChange = (data: InitiateEmailChangeRequest) =>
  api.post<any>('/initiate-email-change', data).then(r => r.data.data);

export const confirmEmailChange = (data: ConfirmEmailChangeRequest) =>
  api.post<any>('/confirm-email-change', data).then(r => r.data.data);

// ── Shared ──
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  nationalId?: string;
  nationalIdImageFrontUrl?: string;
  nationalIdImageBackUrl?: string;
  isIdentityVerified?: boolean;
  emailVerified?: boolean;
  role?: string;
}

// ── Auth ──
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

// ── Account Recovery ──
export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  otp: string;
  email: string;
}

export interface ResetPasswordRequest {
  confirmPassword: string;
  email: string;
  newPassword: string;
  otp: string;
}

// ── Profile ──
export interface UpdateProfileRequest {
  Name: string;
  PhoneNumber: string;
  ProfilePicture?: File;
}

// ── Identity Verification ──
export interface VerifyIdentityRequest {
  NationalId: string;
  NationalIdImageFrontUrl: File;
  NationalIdImageBackUrl: File;
}

// ── Email Change ──
export interface InitiateEmailChangeRequest {
  newEmail: string;
}

export interface ConfirmEmailChangeRequest {
  otp: string;
  newEmail: string;
}

// ── Generic API Response ──
export interface ApiResponse<T = void> {
  data?: T;
  message?: string;
  success: boolean;
}

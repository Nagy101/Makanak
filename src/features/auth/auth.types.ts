// ── Shared ──
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  address?: string;
  age?: number;
  nationalId?: string;
  nationalIdImageFrontUrl?: string;
  nationalIdImageBackUrl?: string;
  strikeCount?: number;
  userType?: string;
  userStatus?: string;
  rejectedReason?: string;
  joinAt?: string;
  isIdentityVerified?: boolean;
  emailVerified?: boolean;
  role?: string;
}

// ── Auth ──
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthData {
  message: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
  token: string;
  expiresOn: string;
  roles: string[];
}

export interface LoginResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: AuthData;
  errors: null | any;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  userType: 'Tenant' | 'Owner';
  dateOfBirth: string;
}

export interface RegisterResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: AuthData;
  errors: null | any;
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
  currentPassword: string;
}

export interface ConfirmEmailChangeRequest {
  otp: string;
  Email: string;
}

// ── Generic API Response ──
export interface ApiResponse<T = void> {
  data?: T;
  message?: string;
  success: boolean;
}

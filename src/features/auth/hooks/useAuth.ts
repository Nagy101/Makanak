import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as authService from '../auth.service';
import { useAuthStore } from '../store/authStore';
import type {
  LoginRequest, RegisterRequest,
  ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest,
  UpdateProfileRequest, VerifyIdentityRequest,
  InitiateEmailChangeRequest, ConfirmEmailChangeRequest,
} from '../auth.types';

// ── Profile Query ──
export function useProfile() {
  const { token, setUser } = useAuthStore();
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const user = await authService.getProfile();
      setUser(user);
      return user;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Login ──
export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res: any) => {
      setAuth(res.user, res.token);
      toast.success('Welcome back!');
      navigate('/profile');
    },
    onError: () => toast.error('Invalid email or password.'),
  });
}

// ── Register ──
export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (res: any) => {
      setAuth(res.user, res.token);
      toast.success('Account created successfully!');
      navigate('/profile');
    },
    onError: () => toast.error('Registration failed. Please try again.'),
  });
}

// ── Logout ──
export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      qc.clear();
      toast.success('Logged out successfully.');
      navigate('/login');
    },
  });
}

// ── Forgot Password ──
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
    onSuccess: () => toast.success('OTP sent to your email. Please check your inbox.'),
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || error?.response?.data?.errors?.[Object.keys(error.response.data.errors)[0]]?.[0];
      toast.error(errorMsg || 'Could not send OTP. Please check your email address and try again.');
    },
  });
}

// ── Verify OTP ──
export function useVerifyOtp() {
  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: () => toast.success('OTP verified!'),
    onError: () => toast.error('Invalid OTP. Please try again.'),
  });
}

// ── Reset Password ──
export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully!');
      navigate('/login');
    },
    onError: () => toast.error('Could not reset password.'),
  });
}

// ── Update Profile ──
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
      qc.invalidateQueries({ queryKey: ['auth', 'profile'] });
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Profile update failed.'),
  });
}

// ── Verify Identity ──
export function useVerifyIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VerifyIdentityRequest) => authService.verifyIdentity(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'profile'] });
      toast.success('Identity verification submitted!');
    },
    onError: () => toast.error('Identity verification failed.'),
  });
}

// ── Initiate Email Change ──
export function useInitiateEmailChange() {
  return useMutation({
    mutationFn: (data: InitiateEmailChangeRequest) => authService.initiateEmailChange(data),
    onSuccess: () => toast.success('Verification code sent to your new email.'),
    onError: () => toast.error('Could not initiate email change.'),
  });
}

// ── Confirm Email Change ──
export function useConfirmEmailChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ConfirmEmailChangeRequest) => authService.confirmEmailChange(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'profile'] });
      toast.success('Email changed successfully!');
    },
    onError: () => toast.error('Could not confirm email change.'),
  });
}

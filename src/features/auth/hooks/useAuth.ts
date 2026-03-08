import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import * as authService from "../auth.service";
import { useAuthStore } from "../store/authStore";

import type {
  LoginRequest,
  RegisterRequest,
  User,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  VerifyIdentityRequest,
  InitiateEmailChangeRequest,
  ConfirmEmailChangeRequest,
} from "../auth.types";

// Type for auth response
interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

// ── Profile Query ──
export function useProfile() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["auth", "profile"],
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
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (res: AuthResponse) => {
      // First set the auth to get the token for profile request
      setAuth(res.user, res.token);

      // Fetch full profile to get userType, userStatus, etc.
      try {
        const profile = await authService.getProfile();
        const userStatus = (profile?.userStatus || "").toString().toLowerCase();

        // Check if user is banned
        if (
          userStatus === "banned" ||
          userStatus === "suspended" ||
          userStatus === "deactivated"
        ) {
          clearAuth();
          qc.clear();
          toast.error("Your account has been banned. Please contact support.");
          return;
        }

        // Store full profile data (includes userType: "Owner" / "Tenant")
        setAuth(profile, res.token);

        const role = (profile?.role || profile?.userType || "").toLowerCase();

        // Admins must use the dedicated admin portal — block them here.
        if (role === "admin" || role === "administrator") {
          clearAuth();
          qc.clear();
          // Security: intentionally generic message for admin accounts
          toast.error("Invalid email or password.");
          return;
        }

        toast.success("Welcome back!");
        if (role === "owner") navigate("/owner", { replace: true });
        else navigate("/", { replace: true });
      } catch (error) {
        // If profile fetch fails, still navigate home
        console.error("Failed to fetch profile:", error);
        toast.success("Welcome back!");
        navigate("/", { replace: true });
      }
    },
  });
}

// ── Register ──
export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (res: AuthResponse) => {
      setAuth(res.user, res.token);
      toast.success("Account created successfully!");
      navigate("/profile");
    },
  });
}

// ── Logout ──
export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      qc.clear();
      toast.success("Logged out successfully.");
      navigate("/login");
    },
  });
}

// ── Forgot Password ──
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    onSuccess: () =>
      toast.success("OTP sent to your email. Please check your inbox."),
  });
}

// ── Verify OTP ──
export function useVerifyOtp() {
  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: () => toast.success("OTP verified!"),
  });
}

// ── Reset Password ──
export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully!");
      navigate("/login");
    },
  });
}

// ── Update Profile ──
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (user: User) => {
      useAuthStore.getState().setUser(user);
      qc.invalidateQueries({ queryKey: ["auth", "profile"] });
      toast.success("Profile updated!");
    },
  });
}

// ── Verify Identity ──
export function useVerifyIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VerifyIdentityRequest) =>
      authService.verifyIdentity(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "profile"] });
      toast.success("Identity verification submitted!");
    },
  });
}

// ── Initiate Email Change ──
export function useInitiateEmailChange() {
  return useMutation({
    mutationFn: (data: InitiateEmailChangeRequest) =>
      authService.initiateEmailChange(data),
    onSuccess: () => toast.success("Verification code sent to your new email."),
  });
}

// ── Confirm Email Change ──
export function useConfirmEmailChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ConfirmEmailChangeRequest) =>
      authService.confirmEmailChange(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "profile"] });
      toast.success("Email changed successfully!");
    },
  });
}

// ── Monitor Banned User Status ──
export function useBannedUserCheck() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const userStatus = (user?.userStatus || "").toString().toLowerCase();

    if (
      userStatus === "banned" ||
      userStatus === "suspended" ||
      userStatus === "deactivated"
    ) {
      toast.error("Your account has been banned. Please contact support.", {
        duration: 5000,
      });
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [user?.userStatus, isAuthenticated, user, clearAuth, navigate]);
}

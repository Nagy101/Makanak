// ═══════════════════════════════════════════════════════════════
//  AdminLoginPage — Dedicated admin-only login portal.
//
//  Security:
//    • If the credentials belong to a non-admin user, auth is
//      immediately cleared and "Invalid email or password" is
//      shown — the same generic message as a real wrong password.
//    • On success, navigates to /admin only if role is admin.
//    • No "Forgot password" or "Register" links (security hygiene).
// ═══════════════════════════════════════════════════════════════
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as authService from "@/features/auth/auth.service";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { LoginRequest } from "@/features/auth/auth.types";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

const GENERIC_ERROR = "Invalid email or password.";

const AdminLoginPage = memo(() => {
  const { t } = useTranslation();
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending } = useMutation({
    // Wrap call so the raw backend error message is NEVER exposed
    mutationFn: async (data: FormData) => {
      try {
        return await authService.login(data as LoginRequest);
      } catch {
        // Discard the real error — prevents TanStack Query / interceptors
        // from leaking backend messages (e.g. "User not found")
        throw new Error(GENERIC_ERROR);
      }
    },
    onSuccess: async (res) => {
      // Temporarily store token to fetch full profile
      setAuth(res.user, res.token);
      try {
        const profile = await authService.getProfile();
        const role = (profile?.role || profile?.userType || "").toLowerCase();

        if (role !== "admin" && role !== "administrator") {
          // Non-admin credentials — block and show generic error
          clearAuth();
          qc.clear();
          setFormError(GENERIC_ERROR);
          toast.error(GENERIC_ERROR);
          return;
        }

        setAuth(profile, res.token);
        navigate("/admin", { replace: true });
      } catch {
        clearAuth();
        qc.clear();
        setFormError(GENERIC_ERROR);
        toast.error(GENERIC_ERROR);
      }
    },
    onError: () => {
      setFormError(GENERIC_ERROR);
    },
  });

  const onSubmit = useCallback(
    (d: FormData) => {
      setFormError(null);
      mutate(d);
    },
    [mutate],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* ── Brand header ──────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-card">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.adminPortal")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("admin.restrictedAccess")}
          </p>
        </div>

        {/* ── Form ──────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Inline error banner */}
          {formError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="admin-email">{t("auth.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                className="pl-10"
                autoComplete="username"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">{t("auth.password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("admin.adminSignIn")
            )}
          </Button>
        </form>
      </div>
    </div>
  );
});

AdminLoginPage.displayName = "AdminLoginPage";
export default AdminLoginPage;

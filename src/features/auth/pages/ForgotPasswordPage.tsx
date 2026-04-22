import { useState, useCallback, memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, KeyRound, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { getApiErrorMessage } from "@/lib/apiError";
import { ApiError } from "@/lib/apiTypes";
import AuthLayout from "../components/AuthLayout";
import PasswordStrengthIndicator, {
  PASSWORD_REGEX,
} from "../components/PasswordStrengthIndicator";
import {
  useForgotPassword,
  useVerifyOtp,
  useResetPassword,
} from "../hooks/useAuth";

type Step = "email" | "otp" | "reset";

const emailSchema = z.object({
  email: z.string().min(1).email("Enter a valid email"),
});

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(PASSWORD_REGEX, "Password does not meet requirements"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const ForgotPasswordPage = memo(() => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpBlocked, setOtpBlocked] = useState(false);
  const [otpLockUntil, setOtpLockUntil] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const forgot = useForgotPassword();
  const verify = useVerifyOtp();
  const reset = useResetPassword();

  const emailForm = useForm<z.output<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  });
  const resetForm = useForm<z.output<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = resetForm.watch("newPassword");
  const otpRemainingSeconds = otpLockUntil
    ? Math.max(0, Math.ceil((otpLockUntil - nowMs) / 1000))
    : 0;

  useEffect(() => {
    if (!otpBlocked || otpRemainingSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpBlocked, otpRemainingSeconds]);

  useEffect(() => {
    if (otpBlocked && otpRemainingSeconds <= 0) {
      setOtpBlocked(false);
      setOtpLockUntil(null);
    }
  }, [otpBlocked, otpRemainingSeconds]);

  const handleEmailSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      emailForm.handleSubmit((d) => {
        setEmail(d.email);
        setOtp("");
        setOtpError("");
        setOtpBlocked(false);
        setOtpLockUntil(null);
        forgot.mutate({ email: d.email }, { onSuccess: () => setStep("otp") });
      })(e);
    },
    [emailForm, forgot],
  );

  const handleOtpSubmit = useCallback(() => {
    verify.mutate(
      { otp, email },
      {
        onSuccess: () => {
          setOtpError("");
          setOtpBlocked(false);
          setOtpLockUntil(null);
          setStep("reset");
        },
        onError: (error) => {
          const msg = getApiErrorMessage(error);

          if (error instanceof ApiError && error.statusCode === 429) {
            setOtp("");
            setOtpError(msg);
            setOtpBlocked(true);
            setOtpLockUntil(Date.now() + 2 * 60 * 1000);
            return;
          }

          if (error instanceof ApiError && error.statusCode === 400) {
            setOtp("");
            setOtpError("Invalid OTP. Please check and try again.");
            setOtpBlocked(false);
            setOtpLockUntil(null);
            return;
          }

          setOtpError(msg);
        },
      },
    );
  }, [verify, otp, email]);

  const handleResetSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      resetForm.handleSubmit((d) => {
        reset.mutate({
          confirmPassword: d.confirmPassword!,
          newPassword: d.newPassword!,
          email,
          otp,
        });
      })(e);
    },
    [resetForm, reset, email, otp],
  );

  const handleResendOtp = useCallback(() => {
    setOtp("");
    setOtpError("");
    setOtpBlocked(false);
    setOtpLockUntil(null);
    forgot.mutate({ email });
  }, [forgot, email]);

  const handleChangeEmail = useCallback(() => {
    setStep("email");
  }, []);

  const titles: Record<Step, { title: string; subtitle: string }> = {
    email: {
      title: t("auth.forgotPasswordTitle"),
      subtitle: t("auth.forgotPasswordSubtitle"),
    },
    otp: {
      title: t("auth.checkYourEmail"),
      subtitle: t("auth.codeSentTo", { email }),
    },
    reset: {
      title: t("auth.setNewPassword"),
      subtitle: t("auth.setNewPasswordSubtitle"),
    },
  };

  return (
    <AuthLayout title={titles[step].title} subtitle={titles[step].subtitle}>
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.emailAddress")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                {...emailForm.register("email")}
              />
            </div>
            {emailForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full h-12 font-semibold"
            disabled={forgot.isPending}
          >
            {forgot.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("auth.sendCode")
            )}
          </Button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("auth.backToSignIn")}
          </Link>
        </form>
      )}

      {step === "otp" && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={otpBlocked}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {otpError && (
            <p className="text-sm text-destructive text-center">{otpError}</p>
          )}
          {otpBlocked && otpRemainingSeconds > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Try again in {Math.floor(otpRemainingSeconds / 60)
                .toString()
                .padStart(2, "0")}
              :{(otpRemainingSeconds % 60).toString().padStart(2, "0")}
            </p>
          )}
          <Button
            onClick={handleOtpSubmit}
            className="w-full h-12 font-semibold"
            disabled={otp.length < 6 || verify.isPending || otpBlocked}
          >
            {verify.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("auth.verifyCode")
            )}
          </Button>
          <Button
            type="button"
            variant={otpBlocked ? "default" : "ghost"}
            onClick={handleResendOtp}
            className={`w-full h-10 font-semibold gap-2 ${
              otpBlocked
                ? "animate-pulse"
                : ""
            }`}
            disabled={forgot.isPending || otpBlocked}
          >
            {forgot.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {t("auth.resendCode")}
          </Button>
          <button
            onClick={handleChangeEmail}
            className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("auth.changeEmail")}
          </button>
        </div>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="pl-10"
                {...resetForm.register("newPassword")}
              />
            </div>
            <PasswordStrengthIndicator password={newPasswordValue} />
            {resetForm.formState.errors.newPassword && (
              <p className="text-sm text-destructive">
                {resetForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="pl-10"
                {...resetForm.register("confirmPassword")}
              />
            </div>
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full h-12 font-semibold"
            disabled={reset.isPending}
          >
            {reset.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("auth.resetPassword")
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
});

ForgotPasswordPage.displayName = "ForgotPasswordPage";
export default ForgotPasswordPage;

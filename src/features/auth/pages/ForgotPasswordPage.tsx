import { useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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

  const forgot = useForgotPassword();
  const verify = useVerifyOtp();
  const reset = useResetPassword();

  const emailForm = useForm<z.output<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const resetForm = useForm<z.output<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = resetForm.watch("newPassword");

  const handleEmailSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      emailForm.handleSubmit((d) => {
        setEmail(d.email);
        forgot.mutate({ email: d.email }, { onSuccess: () => setStep("otp") });
      })(e);
    },
    [emailForm, forgot],
  );

  const handleOtpSubmit = useCallback(() => {
    verify.mutate({ otp, email }, { onSuccess: () => setStep("reset") });
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
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            onClick={handleOtpSubmit}
            className="w-full h-12 font-semibold"
            disabled={otp.length < 6 || verify.isPending}
          >
            {verify.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("auth.verifyCode")
            )}
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

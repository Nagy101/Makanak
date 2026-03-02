import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "../components/AuthLayout";
import { useLogin } from "../hooks/useAuth";

const createSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.emailRequired"))
      .email(t("auth.enterValidEmail")),
    password: z.string().min(6, t("auth.passwordMinChars")),
  });
type LoginFormData = z.infer<ReturnType<typeof createSchema>>;

const LoginPage = memo(() => {
  const { t } = useTranslation();
  const schema = createSchema(t);
  const [showPw, setShowPw] = useState(false);
  const { mutate, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const togglePasswordVisibility = useCallback(() => {
    setShowPw((prev) => !prev);
  }, []);

  const onSubmit = useCallback(
    (d: LoginFormData) => {
      if (d.email && d.password) {
        mutate({ email: d.email, password: d.password });
      }
    },
    [mutate],
  );

  return (
    <AuthLayout
      title={t("auth.welcomeBackTitle")}
      subtitle={t("auth.signInSubtitle")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={
                showPw ? t("auth.hidePassword") : t("auth.showPassword")
              }
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
            t("common.signIn")
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            {t("auth.createOne")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
});

LoginPage.displayName = "LoginPage";
export default LoginPage;

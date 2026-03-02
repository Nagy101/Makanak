import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  Home,
  Users,
} from "lucide-react";
import { useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "../components/AuthLayout";
import { useRegister } from "../hooks/useAuth";

const createSchema = (t: TFunction) =>
  z
    .object({
      name: z.string().min(2, t("auth.nameRequired")).max(100),
      email: z
        .string()
        .min(1, t("auth.emailRequired"))
        .email(t("auth.enterValidEmail")),
      phoneNumber: z.string().optional(),
      password: z.string().min(6, t("auth.atLeast6Chars")),
      confirmPassword: z.string().min(1, t("auth.confirmYourPassword")),
      userType: z.enum(["Tenant", "Owner"], {
        message: t("auth.selectUserType"),
      }),
      dateOfBirth: z.string().min(1, t("auth.dobRequired")),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t("auth.passwordsMustMatch"),
      path: ["confirmPassword"],
    })
    .transform((d) => ({
      name: d.name,
      email: d.email,
      phoneNumber: d.phoneNumber || "",
      password: d.password,
      confirmPassword: d.confirmPassword,
      userType: d.userType,
      dateOfBirth: d.dateOfBirth,
    }));
type RegisterFormData = z.output<ReturnType<typeof createSchema>>;

const RegisterPage = memo(() => {
  const { t } = useTranslation();
  const schema = createSchema(t);
  const [showPw, setShowPw] = useState(false);
  const { mutate, isPending } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      userType: "Tenant",
      dateOfBirth: "",
    },
  });
  const selectedUserType = watch("userType");

  const togglePasswordVisibility = useCallback(() => {
    setShowPw((prev) => !prev);
  }, []);

  const onSubmit = useCallback(
    (d: RegisterFormData) => {
      mutate(d);
    },
    [mutate],
  );

  return (
    <AuthLayout
      title={t("auth.createAccount")}
      subtitle={t("auth.joinSubtitle")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth.fullName")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder={t("auth.namePlaceholder")}
              className="pl-10"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t("auth.phoneOptional")}</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="+1 234 567 890"
              className="pl-10"
              {...register("phoneNumber")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("auth.chooseAccountType")}</Label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-150 ${
                selectedUserType === "Tenant"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-secondary/50"
              }`}
            >
              <input
                type="radio"
                value="Tenant"
                {...register("userType")}
                className="w-4 h-4"
              />
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="font-medium">{t("auth.tenantLabel")}</span>
              </div>
            </label>
            <label
              className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-150 ${
                selectedUserType === "Owner"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-secondary/50"
              }`}
            >
              <input
                type="radio"
                value="Owner"
                {...register("userType")}
                className="w-4 h-4"
              />
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span className="font-medium">{t("auth.ownerLabel")}</span>
              </div>
            </label>
          </div>
          {errors.userType && (
            <p className="text-sm text-destructive">
              {errors.userType.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">{t("auth.dateOfBirth")}</Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10"
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            t("auth.createAccount")
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            {t("auth.signInLink")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
});

RegisterPage.displayName = "RegisterPage";
export default RegisterPage;

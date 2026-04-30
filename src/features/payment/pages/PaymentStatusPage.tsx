import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PaymentState = "success" | "failure" | "pending";

const normalize = (value: string | null) => value?.trim().toLowerCase() || "";

const resolvePaymentState = (search: string): PaymentState => {
  const params = new URLSearchParams(search);
  const rawStatus = normalize(
    params.get("status") ??
      params.get("success") ??
      params.get("transaction_status") ??
      params.get("result") ??
      params.get("payment_status"),
  );

  if (["success", "succeeded", "paid", "approved", "completed", "true"].includes(rawStatus)) {
    return "success";
  }

  if (["failed", "failure", "declined", "canceled", "cancelled", "expired", "false"].includes(rawStatus)) {
    return "failure";
  }

  return "pending";
};

export default function PaymentStatusPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const status = useMemo(
    () => resolvePaymentState(location.search),
    [location.search],
  );

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const paymentIntentId =
    params.get("PaymentIntentId") ??
    params.get("paymentIntentId") ??
    params.get("payment_intent_id") ??
    params.get("payment_id") ??
    params.get("transaction_id") ??
    params.get("id");

  const bookingId = params.get("bookingId") ?? params.get("booking_id");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const titleKey =
    status === "success"
      ? "paymentStatus.successTitle"
      : status === "failure"
        ? "paymentStatus.failureTitle"
        : "paymentStatus.pendingTitle";

  const descriptionKey =
    status === "success"
      ? "paymentStatus.successDescription"
      : status === "failure"
        ? "paymentStatus.failureDescription"
        : "paymentStatus.pendingDescription";

  const Icon =
    status === "success"
      ? CheckCircle2
      : status === "failure"
        ? AlertCircle
        : Clock3;

  const iconClassName =
    status === "success"
      ? "text-emerald-600"
      : status === "failure"
        ? "text-destructive"
        : "text-amber-600";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Button
          type="button"
          variant="ghost"
          className="w-fit gap-2 px-0 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.backToHome")}
        </Button>

        <Card className="border-border/60 bg-card/95 shadow-xl shadow-black/5 backdrop-blur">
          <CardContent className="space-y-6 p-8 text-center sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Icon className={`h-8 w-8 ${iconClassName}`} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t(titleKey)}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                {t(descriptionKey)}
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-left text-sm text-muted-foreground sm:grid-cols-2">
              {bookingId && (
                <div className="flex items-start gap-3">
                  <ReceiptText className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">{t("paymentStatus.bookingId")}</div>
                    <div>{bookingId}</div>
                  </div>
                </div>
              )}

              {paymentIntentId && (
                <div className="flex items-start gap-3">
                  <ReceiptText className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">{t("paymentStatus.intentId")}</div>
                    <div className="break-all">{paymentIntentId}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => navigate("/my-bookings")}>{t("paymentStatus.backToBookings")}</Button>
              <Button variant="outline" onClick={() => navigate("/properties")}>{t("paymentStatus.browseProperties")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
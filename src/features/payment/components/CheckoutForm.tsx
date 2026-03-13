import { memo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useMockPayBooking } from "../usePayment";

interface CheckoutFormProps {
  bookingId: number;
  onSuccess: (bookingId: number) => void;
}

const CheckoutForm = memo(({ bookingId, onSuccess }: CheckoutFormProps) => {
  const { t } = useTranslation();
  const payMutation = useMockPayBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Uncomment this block when the real payment gateway is integrated.
  // const stripe = useStripe();
  // const elements = useElements();
  // const [success, setSuccess] = useState(false);
  //
  // if (success) {
  //   return (
  //     <div className="flex flex-col items-center gap-3 py-8 text-center">
  //       <CheckCircle2 className="h-12 w-12 text-success" />
  //       <h3 className="text-lg font-semibold text-foreground">
  //         {t("payment.paymentSuccessful")}
  //       </h3>
  //       <p className="text-sm text-muted-foreground">
  //         {t("payment.bookingConfirmed")}
  //       </p>
  //     </div>
  //   );
  // }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setLoading(true);
      setError(null);

      // TODO: Uncomment this block when the real payment gateway is integrated.
      // if (!stripe || !elements) return;
      //
      // const { error: stripeError } = await stripe.confirmPayment({
      //   elements,
      //   confirmParams: {
      //     return_url: `${window.location.origin}/my-bookings`,
      //   },
      //   redirect: "if_required",
      // });
      //
      // if (stripeError) {
      //   setError(stripeError.message ?? "Payment failed");
      //   setLoading(false);
      // } else {
      //   setSuccess(true);
      //   setLoading(false);
      //   onSuccess();
      // }

      try {
        const result = await payMutation.mutateAsync(bookingId);
        if (result.status === "PaymentReceived") {
          toast.success("Payment successful (Test Mode)");
          onSuccess(result.bookingId);
          return;
        }
        setError(t("payment.failedToInitialize"));
      } catch {
        setError(t("payment.failedToInitialize"));
      } finally {
        setLoading(false);
      }
    },
    [bookingId, onSuccess, payMutation, t],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TODO: Uncomment this block when the real payment gateway is integrated. */}
      {/*
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      */}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-base font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {t("payment.processing")}
          </>
        ) : (
          t("bookings.payNow")
        )}
      </Button>
    </form>
  );
});

CheckoutForm.displayName = "CheckoutForm";
export default CheckoutForm;

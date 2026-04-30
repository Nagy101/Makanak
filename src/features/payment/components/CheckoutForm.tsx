import { memo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useCreatePaymentIntent } from "../usePayment";

interface CheckoutFormProps {
  bookingId: number;
}

const CheckoutForm = memo(({ bookingId }: CheckoutFormProps) => {
  const { t } = useTranslation();
  const payMutation = useCreatePaymentIntent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setLoading(true);
      setError(null);

      try {
        const paymobPublicKey = import.meta.env.VITE_PAYMOB_PUBLIC_KEY?.trim();

        if (!paymobPublicKey) {
          setError(t("payment.missingPublicKey"));
          return;
        }

        const result = await payMutation.mutateAsync(bookingId);
        if (!result.isSuccess) {
          setError(result.message || t("payment.failedToInitialize"));
          return;
        }

        const clientSecret = result.data?.clientSecret;
        if (!clientSecret) {
          setError(t("payment.failedToInitialize"));
          return;
        }

        window.location.assign(
          `https://accept.paymob.com/unifiedcheckout/?publicKey=${encodeURIComponent(paymobPublicKey)}&clientSecret=${encodeURIComponent(clientSecret)}`,
        );
      } catch {
        setError(t("payment.failedToInitialize"));
      } finally {
        setLoading(false);
      }
    },
    [bookingId, payMutation, t],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

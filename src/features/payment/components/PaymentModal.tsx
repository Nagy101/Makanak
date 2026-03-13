import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CheckoutForm from "./CheckoutForm";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentModalProps {
  bookingId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentModal = memo(
  ({ bookingId, open, onOpenChange }: PaymentModalProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const qc = useQueryClient();

    const handleSuccess = useCallback((paidBookingId: number) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      onOpenChange(false);
      navigate("/my-bookings", {
        replace: true,
        state: { openBookingId: paidBookingId },
      });
    }, [qc, onOpenChange, navigate]);

    // TODO: Uncomment this block when the real payment gateway is integrated.
    // Stripe publishable key — safe to store in client code
    // const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
    // const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;
    // const mutation = useCreatePaymentIntent();
    //
    // // Trigger payment intent creation when modal opens
    // useEffect(() => {
    //   if (open && bookingId && !mutation.data && !mutation.isPending) {
    //     mutation.mutate(bookingId);
    //   }
    //   // Reset when modal closes
    //   if (!open) {
    //     mutation.reset();
    //   }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [open, bookingId]);
    //
    // const handleSuccess = useCallback(() => {
    //   qc.invalidateQueries({ queryKey: ["bookings"] });
    //   setTimeout(() => onOpenChange(false), 2000);
    // }, [qc, onOpenChange]);
    //
    // const intentData = mutation.data?.isSuccess ? mutation.data.data : null;
    //
    // const stripeOptions = useMemo(
    //   () =>
    //     intentData?.clientSecret
    //       ? {
    //           clientSecret: intentData.clientSecret,
    //           appearance: {
    //             theme: "stripe" as const,
    //             variables: {
    //               colorPrimary: "hsl(210 75% 42%)",
    //               borderRadius: "0.75rem",
    //             },
    //           },
    //         }
    //       : null,
    //   [intentData?.clientSecret],
    // );

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("payment.completePayment")}</DialogTitle>
            <DialogDescription>
              {t("payment.initializingPayment")}
            </DialogDescription>
          </DialogHeader>

          {bookingId ? (
            <CheckoutForm bookingId={bookingId} onSuccess={handleSuccess} />
          ) : (
            <div className="py-8 text-center text-sm text-destructive">
              {t("payment.failedToInitialize")}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

PaymentModal.displayName = "PaymentModal";
export default PaymentModal;

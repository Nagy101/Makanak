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

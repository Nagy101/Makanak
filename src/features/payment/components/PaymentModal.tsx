import { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CheckoutForm from "./CheckoutForm";

interface PaymentModalProps {
  bookingId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentModal = memo(
  ({ bookingId, open, onOpenChange }: PaymentModalProps) => {
    const { t } = useTranslation();

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
            <CheckoutForm bookingId={bookingId} />
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

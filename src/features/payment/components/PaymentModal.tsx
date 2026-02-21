import { memo, useCallback, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreatePaymentIntent } from '../usePayment';
import CheckoutForm from './CheckoutForm';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

// Stripe publishable key — safe to store in client code
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

interface PaymentModalProps {
  bookingId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentModal = memo(({ bookingId, open, onOpenChange }: PaymentModalProps) => {
  const mutation = useCreatePaymentIntent();
  const qc = useQueryClient();

  // Trigger payment intent creation when modal opens
  useEffect(() => {
    if (open && bookingId && !mutation.data && !mutation.isPending) {
      mutation.mutate(bookingId);
    }
    // Reset when modal closes
    if (!open) {
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bookingId]);

  const handleSuccess = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['bookings'] });
    setTimeout(() => onOpenChange(false), 2000);
  }, [qc, onOpenChange]);

  const intentData = mutation.data?.isSuccess ? mutation.data.data : null;

  const stripeOptions = useMemo(
    () =>
      intentData?.clientSecret
        ? {
            clientSecret: intentData.clientSecret,
            appearance: {
              theme: 'stripe' as const,
              variables: {
                colorPrimary: 'hsl(210 75% 42%)',
                borderRadius: '0.75rem',
              },
            },
          }
        : null,
    [intentData?.clientSecret],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {intentData
              ? `Total: ${intentData.totalAmount.toLocaleString()} EGP`
              : 'Initializing secure payment…'}
          </DialogDescription>
        </DialogHeader>

        {!stripePromise ? (
          <div className="py-8 text-center text-sm text-destructive">
            Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY.
          </div>
        ) : mutation.isPending ? (
          <div className="space-y-4 py-6">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : mutation.isError || (mutation.data && !mutation.data.isSuccess) ? (
          <div className="py-8 text-center text-sm text-destructive">
            {mutation.data?.message || 'Failed to initialize payment. Please try again.'}
          </div>
        ) : stripeOptions ? (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <CheckoutForm
              totalAmount={intentData!.totalAmount}
              onSuccess={handleSuccess}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
});

PaymentModal.displayName = 'PaymentModal';
export default PaymentModal;

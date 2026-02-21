import { memo, useState, useCallback } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface CheckoutFormProps {
  totalAmount: number;
  onSuccess: () => void;
}

const CheckoutForm = memo(({ totalAmount, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setLoading(true);
      setError(null);

      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/my-bookings`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message ?? 'Payment failed');
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        onSuccess();
      }
    },
    [stripe, elements, onSuccess],
  );

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <h3 className="text-lg font-semibold text-foreground">Payment Successful!</h3>
        <p className="text-sm text-muted-foreground">Your booking has been confirmed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full h-12 text-base font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing…
          </>
        ) : (
          `Pay ${totalAmount.toLocaleString()} EGP`
        )}
      </Button>
    </form>
  );
});

CheckoutForm.displayName = 'CheckoutForm';
export default CheckoutForm;

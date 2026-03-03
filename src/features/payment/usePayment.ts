import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentIntent, scanQrCode } from "./payment.service";
import type { ScanQrRequest } from "./payment.types";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/apiError";

/** Tenant: create a Stripe payment intent for a booking */
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: (bookingId: number) => createPaymentIntent(bookingId),
    onError: (err) => showApiErrorToast(err),
  });
};

/** Owner: scan a QR code for check-in */
export const useScanQrCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ScanQrRequest) => scanQrCode(data),
    onSuccess: (res) => {
      toast.success(res.message || "Check-in confirmed!");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => showApiErrorToast(err),
  });
};

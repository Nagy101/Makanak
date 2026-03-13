import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentIntent, payBooking, scanQrCode } from "./payment.service";
import type { MockPaymentData, ScanQrRequest } from "./payment.types";
import { toast } from "sonner";

/** Tenant: create a Stripe payment intent for a booking */
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: (bookingId: number) => createPaymentIntent(bookingId),
  });
};

/** Tenant: temporary mocked payment completion (test mode) */
export const useMockPayBooking = () => {
  return useMutation<MockPaymentData, Error, number>({
    mutationFn: (bookingId: number) => payBooking(bookingId),
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
  });
};

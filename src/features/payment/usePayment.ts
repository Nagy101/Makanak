import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentIntent, scanQrCode } from "./payment.service";
import type { ScanQrRequest } from "./payment.types";
import { showApiErrorToast } from "@/lib/apiError";
import { showSuccessMessage } from "@/lib/appMessage";

/** Tenant: initiate Paymob payment for a booking */
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: (bookingId: number) => createPaymentIntent(bookingId),
    onError: (error) => showApiErrorToast(error),
  });
};

/** Owner: scan a QR code for check-in */
export const useScanQrCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ScanQrRequest) => scanQrCode(data),
    onSuccess: (res) => {
      showSuccessMessage(res.message || "messages.checkInConfirmed");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => showApiErrorToast(error),
  });
};

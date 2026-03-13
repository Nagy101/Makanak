import axios from "axios";
import { storage } from "@/lib/storage";
import { setup401Interceptor, API_BASE } from "@/lib/api";
import type {
  PaymentApiResponse,
  PaymentIntentData,
  MockPaymentData,
  ScanQrRequest,
  QrScanBookingData,
} from "./payment.types";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});
setup401Interceptor(api);

/** POST /api/Booking/{bookingId}/payment — create Stripe PaymentIntent */
export const createPaymentIntent = (bookingId: number) =>
  api
    .post<
      PaymentApiResponse<PaymentIntentData>
    >(`/Booking/${bookingId}/payment`)
    .then((r) => r.data);

/**
 * POST /api/Booking/{bookingId}/payment — mocked server-side payment completion
 * Temporary testing path: backend returns PaymentReceived immediately.
 */
export const payBooking = (bookingId: number) =>
  api.post<PaymentApiResponse<MockPaymentData> | MockPaymentData>(
    `/Booking/${bookingId}/payment`,
  )
  .then((r) => r.data)
  .then((payload) => {
    if (
      typeof payload === "object" &&
      payload !== null &&
      "isSuccess" in payload &&
      "data" in payload
    ) {
      const wrapped = payload as PaymentApiResponse<MockPaymentData>;
      return wrapped.data;
    }
    return payload as MockPaymentData;
  });

/** POST /api/Booking/scan-qr — owner scans tenant QR */
export const scanQrCode = (data: ScanQrRequest) =>
  api
    .post<PaymentApiResponse<QrScanBookingData>>("/Booking/scan-qr", data)
    .then((r) => r.data);

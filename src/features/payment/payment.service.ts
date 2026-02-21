import axios from 'axios';
import type {
  PaymentApiResponse,
  PaymentIntentData,
  ScanQrRequest,
  QrScanBookingData,
} from './payment.types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

/** POST /api/Booking/{bookingId}/payment — create Stripe PaymentIntent */
export const createPaymentIntent = (bookingId: number) =>
  api
    .post<PaymentApiResponse<PaymentIntentData>>(`/Booking/${bookingId}/payment`)
    .then((r) => r.data);

/** POST /api/Booking/scan-qr — owner scans tenant QR */
export const scanQrCode = (data: ScanQrRequest) =>
  api
    .post<PaymentApiResponse<QrScanBookingData>>('/Booking/scan-qr', data)
    .then((r) => r.data);

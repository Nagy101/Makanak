// ── Payment API Response Wrapper ──
export interface PaymentApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// ── Payment Intent Data ──
export interface PaymentIntentData {
  bookingId: number;
  paymentIntentId: string;
  clientSecret: string;
  totalAmount: number;
  status: string;
}

// ── QR Scan Request ──
export interface ScanQrRequest {
  qrCode: string;
}

// ── QR Scan Response Data (Booking Details) ──
export interface QrScanBookingData {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  totalDays: number;
  status: string;
  totalPrice: number;
  commissionPaid: number;
  amountToPayToOwner: number;
  propertyId: number;
  propertyName: string;
  propertyMainImage: string;
  tenantName: string;
  tenantImage: string;
}

// ── Booking Status Enum ──
export const BookingStatus = {
  PendingOwnerApproval: 'PendingOwnerApproval',
  RejectedByOwner: 'RejectedByOwner',
  PendingPayment: 'PendingPayment',
  PaymentFailed: 'PaymentFailed',
  PaymentReceived: 'PaymentReceived',
  Cancelled: 'Cancelled',
  CheckedIn: 'CheckedIn',
  Completed: 'Completed',
  Disputed: 'Disputed',
} as const;

export type BookingStatusType = (typeof BookingStatus)[keyof typeof BookingStatus];

// ── Sort Enum ──
export const BookingSort = {
  NameAsc: 'NameAsc',
  NameDesc: 'NameDesc',
  DateCreatedAsc: 'DateCreatedAsc',
  DateCreatedDesc: 'DateCreatedDesc',
  PriceAsc: 'PriceAsc',
  PriceDesc: 'PriceDesc',
} as const;

export type BookingSortType = (typeof BookingSort)[keyof typeof BookingSort];

// ── API Response Wrapper ──
export interface BookingApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// ── Booking Data (list item) ──
export interface Booking {
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

// ── Booking Details (single booking, all fields) ──
export interface BookingDetails extends Booking {
  pricePerNight: number;
  galleryImages: string[];
  numberOfGuests: number;
  specialRequests: string | null;
  checkInQrCode: string | null;
  isQrScanned: boolean;
  ownerPhoneNumber: string | null;
  checkInInstructions: string | null;
  exactLocationUrl: string | null;
}

// ── Paginated Data ──
export interface PaginatedData<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

// ── Create Booking Request ──
export interface CreateBookingRequest {
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

// ── Update Booking Status Request (Owner) ──
export interface UpdateBookingStatusRequest {
  bookingId: number;
  status: BookingStatusType;
}

// ── List Params ──
export interface BookingListParams {
  Status?: BookingStatusType;
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  Sort?: BookingSortType;
}

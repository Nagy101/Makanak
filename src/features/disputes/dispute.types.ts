// ── Dispute Status Enum ──
export const DisputeStatus = {
  Pending: 'Pending',
  Resolved: 'Resolved',
  Rejected: 'Rejected',
  Cancelled: 'Cancelled',
} as const;

export type DisputeStatusType = (typeof DisputeStatus)[keyof typeof DisputeStatus];

// ── Dispute Sort Enum ──
export const DisputeSort = {
  DateAsc: 'DateAsc',
  DateDesc: 'DateDesc',
  StatusAsc: 'StatusAsc',
} as const;

export type DisputeSortType = (typeof DisputeSort)[keyof typeof DisputeSort];

// ── Dispute Decision (for admin resolve) ──
export const DisputeDecision = {
  Pending: 'Pending',
  Resolved: 'Resolved',
  Rejected: 'Rejected',
} as const;

export type DisputeDecisionType = (typeof DisputeDecision)[keyof typeof DisputeDecision];

// ── API Response Wrapper ──
export interface DisputeApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// ── Dispute Data ──
export interface Dispute {
  id: number;
  bookingId: number;
  propertyName: string;
  complainantName: string;
  defendantName: string;
  status: string;
  reason: string;
  description: string;
  adminComment: string | null;
  createdAt: string;
  resolvedAt: string | null;
  images: string[];
}

// ── Paginated Data ──
export interface PaginatedData<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

// ── Create Dispute Request (FormData) ──
export interface CreateDisputeRequest {
  BookingId: number;
  Reason: number;
  Description: string;
  Images: File[];
}

// ── Resolve Dispute Request ──
export interface ResolveDisputeRequest {
  disputeId: number;
  decision: DisputeDecisionType;
  adminComment: string;
}

// ── List Params ──
export interface DisputeListParams {
  Status?: DisputeStatusType;
  BookingId?: number;
  Sort?: DisputeSortType;
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
}

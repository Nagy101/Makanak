// ── Admin API Response Envelope ──
export interface AdminApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message?: string;
  data: T;
  errors?: string[] | null;
}

// ── User Management ──
export type UserStatus = "New" | "Pending" | "Active" | "Rejected" | "Banned";
export type UserType = "Tenant" | "Owner" | "Admin";

export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  userType: UserType;
  userStatus: UserStatus;
  joinAt: string;
  strikeCount: number;
}

// ── Strike API Response ──
export interface StrikeApiResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: string;
  errors: string[];
}

export interface AdminUserSearchParams {
  Status?: UserStatus;
  Type?: UserType;
  Search?: string;
  PageIndex?: number;
  PageSize?: number;
  Sort?: string;
}

export interface PaginatedData<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

export interface UpdateUserStatusRequest {
  userId: string;
  newStatus: UserStatus;
  rejectedReason?: string;
}

// ── Property Status Update ──
export type PropertyStatus = "Pending" | "Accepted" | "Rejected" | "Banned";

export interface UpdatePropertyStatusRequest {
  propertyId: number;
  newStatus: PropertyStatus;
  rejectedReason?: string;
}

// ── User Verification Details (KYC) ──
export interface UserVerificationDetails {
  nationalId: string | null;
  nationalIdImageFrontUrl: string | null;
  nationalIdImageBackUrl: string | null;
  dateOfBirth: string | null;
  address: string | null;
  strikeCount: number;
  profilePictureUrl: string | null;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  userType: UserType;
  userStatus: UserStatus;
  joinAt: string;
}

// ── Admin Property Management ──
export interface AdminPropertyListing {
  id: number;
  title: string;
  mainImageUrl: string;
  pricePerNight: number;
  governorateName: string;
  propertyStatus: string;
  propertyType: string;
  averageRating: number;
  createdAt: string;
  isAvailable: boolean;
}

export interface AdminPropertySearchParams {
  Status?: PropertyStatus;
  Type?: string;
  GovernorateId?: number;
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  Sort?: string;
}

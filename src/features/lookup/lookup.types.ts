/**
 * Generic API Response Wrapper
 */
export interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[];
}

/**
 * Governorates Lookup
 */
export interface Governorate {
  id: number;
  nameEn: string | null;
  nameAr: string | null;
}

/**
 * Amenities Lookup
 */
export interface Amenity {
  id: number;
  name?: string | null;
  nameEn?: string | null;
  nameAr?: string | null;
  icon?: string | null;
}

/**
 * Property Types (Enum based)
 */
export interface PropertyType {
  id: number;
  name: string;
}

/**
 * Dispute Reasons (Enum based)
 */
export interface DisputeReason {
  id: number;
  name: string;
}

/**
 * Booking Statuses (Enum based)
 */
export interface BookingStatus {
  id: number;
  name: string;
}

/**
 * Dispute Statuses (Enum based)
 */
export interface DisputeStatus {
  id: number;
  name: string;
}

/**
 * Property Statuses (Enum based)
 */
export interface PropertyStatus {
  id: number;
  name: string;
}

/**
 * User Statuses (Enum based)
 */
export interface UserStatus {
  id: number;
  name: string;
}

/**
 * User Types (Enum based)
 */
export interface UserType {
  id: number;
  name: string;
}

/**
 * Sorting options
 */
export interface SortingOption {
  id: number;
  name: string;
}

/**
 * Lookup Store State
 *
 * NOTE: disputeReasons and disputeStatuses are intentionally absent.
 *   - dispute-statuses: endpoint does not exist on the backend; use the
 *     DisputeStatus/DisputeStatusType constants from dispute.types.ts directly.
 *   - dispute-reasons: only role-scoped endpoints exist
 *     (/owner-dispute-reasons, /tenant-dispute-reasons, /all-dispute-reasons);
 *     use useRoleDisputeReasons(role) instead.
 */
export interface LookupState {
  governorates: Governorate[];
  amenities: Amenity[];
  propertyTypes: PropertyType[];
  propertyStatuses: PropertyStatus[];
  userStatuses: UserStatus[];
  userTypes: UserType[];
  bookingStatuses: BookingStatus[];
  sortingOptions: SortingOption[];
  /**
   * Per-resource in-flight tracker.
   * Key = resource name (e.g. 'governorates').
   * Prevents concurrent duplicate requests and infinite retry loops.
   */
  fetching: Record<string, boolean>;
}

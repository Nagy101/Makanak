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
 */
export interface LookupState {
  governorates: Governorate[];
  amenities: Amenity[];
  propertyTypes: PropertyType[];
  propertyStatuses: PropertyStatus[];
  userStatuses: UserStatus[];
  userTypes: UserType[];
  disputeReasons: DisputeReason[];
  bookingStatuses: BookingStatus[];
  disputeStatuses: DisputeStatus[];
  sortingOptions: SortingOption[];
  loading: boolean;
  error: string | null;
}
